# 03 — Hero Slider (Headless desde WordPress + FileBird)

**Fecha de actualización:** 2026-04-09  
**Estado:** Producción

---

## Resumen

El Hero Slider del home carga sus datos **en tiempo real desde WordPress** sin Custom Post Types ni autenticación compleja. Las imágenes se organizan en una carpeta de FileBird y los metadatos del slide (título, subtítulo, botón, URL) se almacenan en los campos estándar del adjunto de medios de WordPress.

---

## Arquitectura

```
WordPress (Medios)
  └── Carpeta FileBird "Slider"
        └── Slider-Imbra-1.jpg  →  Alt Text, Título, Descripción (3 líneas)
        └── Slider-Imbra-2.jpg  →  Alt Text, Título, Descripción (3 líneas)

WordPress (functions.php / snippet)
  └── Endpoint REST público: GET /wp-json/imbra/v1/slider
        └── Lee tabla wp_fbv_attachment_folder (FileBird)
        └── Retorna adjuntos de la carpeta con sus metadatos

Next.js (servidor)
  └── getHeroSlides()  →  src/lib/wordpress.ts
        └── Fetch a /wp-json/imbra/v1/slider  (cache: no-store)
        └── Mapea campos → HeroSlide[]

Next.js (cliente)
  └── <Hero slides={heroSlides} />  →  src/components/features/Hero.tsx
        └── Autoplay 6s, swipe, Ken Burns, dots, barra de progreso
```

---

## Archivos involucrados

| Archivo | Rol |
|---|---|
| `src/lib/wordpress.ts` | `getHeroSlides()` — fetch y mapeo |
| `src/components/features/Hero.tsx` | Componente visual (Client Component) |
| `src/app/page.tsx` | Llama `getHeroSlides()` y pasa slides al Hero |
| `.env.local` | Variables de entorno |
| WordPress `functions.php` | Snippet que registra el endpoint REST |

---

## Paso 1 — Snippet en WordPress

Agregar en `functions.php` o con un plugin de snippets (WPCode, etc.):

```php
add_action('rest_api_init', function() {
    register_rest_route('imbra/v1', '/slider', array(
        'methods'             => 'GET',
        'callback'            => function() {
            $folder_id = 7; // ← ID de la carpeta FileBird "Slider"
            global $wpdb;
            $table = $wpdb->prefix . 'fbv_attachment_folder';
            $ids = $wpdb->get_col($wpdb->prepare(
                "SELECT attachment_id FROM {$table} WHERE folder_id = %d ORDER BY attachment_id ASC",
                $folder_id
            ));
            $slides = array();
            foreach ($ids as $id) {
                $attachment = get_post($id);
                if (!$attachment) continue;
                $slides[] = array(
                    'id'          => (int)$id,
                    'title'       => get_the_title($id),
                    'caption'     => wp_get_attachment_caption($id),
                    'description' => $attachment->post_content,
                    'alt_text'    => get_post_meta($id, '_wp_attachment_image_alt', true),
                    'source_url'  => wp_get_attachment_url($id),
                );
            }
            return $slides;
        },
        'permission_callback' => '__return_true',
    ));
});
```

**¿Cómo encontrar el `folder_id`?**  
Consultar la tabla `wp_fbv` en phpMyAdmin, o abrir en el navegador (autenticado):  
`https://tu-sitio.com/wp-json/filebird/public/v1/folders`

Verificar que el endpoint responde correctamente:  
`https://tu-sitio.com/wp-json/imbra/v1/slider`

---

## Paso 2 — Variables de entorno

```bash
# .env.local
NEXT_PUBLIC_WORDPRESS_URL=https://tu-sitio.com/

# FileBird (referencia documental — el endpoint es público, no requiere auth)
FILEBIRD_API_KEY=tu_api_key
FILEBIRD_HERO_FOLDER_ID=7
```

---

## Paso 3 — Interfaz y función `getHeroSlides()`

### Interfaz `HeroSlide`

```typescript
export interface HeroSlide {
  id: number;
  title: string;    // Título grande (líneas 1..N-2 del campo Descripción en WP)
  excerpt: string;  // Subtítulo (campo Título en WP Medios)
  image: string;    // URL de la imagen
  label: string;    // Etiqueta naranja (Texto alternativo en WP)
  ctaText: string;  // Texto del botón (penúltima línea de Descripción)
  ctaUrl: string;   // URL del botón (última línea de Descripción, empieza con /)
  note: string;     // Reservado (no usado actualmente)
}
```

### Fallback

```typescript
const HERO_FALLBACK: HeroSlide[] = [
  {
    id: 0,
    title: 'Título de fallback',
    excerpt: 'Subtítulo de fallback',
    image: '/images/hero-bg.png',
    label: '⚡ ETIQUETA',
    ctaText: 'VER MÁS',
    ctaUrl: '/tienda',
    note: '',
  },
];
```

### Función completa

```typescript
const WP_BASE = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') ?? '';

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const res = await fetch(
      `${WP_BASE}/wp-json/imbra/v1/slider`,
      { cache: 'no-store' }
    );
    if (!res.ok) return HERO_FALLBACK;

    const items: Array<{
      id: number;
      title: string;
      caption: string;
      description: string;
      alt_text: string;
      source_url: string;
    }> = await res.json();

    if (!items.length) return HERO_FALLBACK;

    const slides: HeroSlide[] = items.map((m, idx) => {
      const lines = (m.description ?? '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      // URL = última línea que empieza con /
      // Texto botón = línea anterior a la URL
      // Título = todo lo que queda
      const urlLine   = lines.findLast((l) => l.startsWith('/')) ?? '/tienda';
      const remaining = lines.filter((l) => l !== urlLine);
      const ctaText   = remaining.pop() ?? 'VER MÁS';
      const title     = remaining.join(' ') || ctaText;

      return {
        id:      m.id ?? idx,
        title,
        excerpt: m.title ?? '',
        image:   m.source_url ?? '/images/hero-bg.png',
        label:   m.alt_text ?? '',
        ctaText,
        ctaUrl:  urlLine,
        note:    '',
      };
    });

    return slides;
  } catch {
    return HERO_FALLBACK;
  }
}
```

---

## Paso 4 — `page.tsx`

```typescript
export const dynamic = 'force-dynamic'; // requerido para no cachear la página

import { getHeroSlides } from '@/lib/wordpress';
import Hero from '@/components/features/Hero';

export default async function Home() {
  const heroSlides = await getHeroSlides();
  return (
    <main>
      <Hero slides={heroSlides} />
    </main>
  );
}
```

---

## Paso 5 — Componente `Hero.tsx`

### Características

| Feature | Detalle |
|---|---|
| Autoplay | 6 segundos por slide |
| Pausa | Al hacer hover |
| Swipe | Pointer Events (mouse + touch), umbral 50px |
| Animación imagen | Ken Burns (zoom 1.06 → 1.0, 8s) |
| Transición slides | Crossfade opacity 700ms |
| Barra de progreso | Animación CSS linear 6s en la base |
| Dots | Ancho variable: activo = 28px, inactivo = 8px |
| Flechas | Visibles al hover, ocultas en mobile |

### Fix crítico — swipe bloquea botones

Sin este fix, `setPointerCapture` intercepta los clicks en `<Link>` y `<button>` impidiendo la navegación:

```typescript
const onPointerDown = (e: React.PointerEvent) => {
  if ((e.target as HTMLElement).closest('a, button')) return; // ← fix
  dragRef.current = { active: true, startX: e.clientX };
  sectionRef.current?.setPointerCapture(e.pointerId);
};
```

---

## Convención de campos en WordPress Medios

| Campo en WP | Mapeado a | Ejemplo |
|---|---|---|
| **Texto alternativo** | `label` — etiqueta naranja | `⚡ DIRECTO DEL FABRICANTE` |
| **Título** (post_title) | `excerpt` — subtítulo | `Diseñadas para trabajar mejor...` |
| **Leyenda** | No se usa — dejar vacío | — |
| **Descripción** línea 1..N-2 | `title` — titular grande | `Herramienta Especializada IMBRA` |
| **Descripción** línea N-1 | `ctaText` — texto botón | `VER HERRAMIENTAS` |
| **Descripción** línea N (`/…`) | `ctaUrl` — URL botón | `/tienda` |

### Ejemplo de Descripción correcta

```
Herramienta Especializada IMBRA
VER HERRAMIENTAS
/tienda
```

---

## Problemas resueltos durante el desarrollo

### JWT Auth intercepta API Key de FileBird
**Causa:** El plugin JWT Authentication intercepta todos los `Authorization: Bearer`, incluyendo la API Key de FileBird (que no es un JWT). Devuelve `403 jwt_auth_invalid_token`.  
**Solución:** Endpoint propio público en WordPress — no requiere autenticación.

### `filebird_folder` no funciona como query param de WP Media
**Causa:** FileBird no registra ese parámetro en `/wp-json/wp/v2/media`. Se ignora silenciosamente y devuelve todos los medios recientes.  
**Solución:** Endpoint propio que consulta la tabla `wp_fbv_attachment_folder` directamente.

### WP REST API `search` no filtra correctamente
**Causa:** La búsqueda por título devuelve archivos de otros plugins (RevSlider) que tienen palabras coincidentes en el nombre del archivo.  
**Solución:** Endpoint propio filtrado por `folder_id`.

### Cache Next.js persiste entre reinicios del servidor
**Causa:** `next: { revalidate: N }` en un fetch guarda en disco (`.next/cache`) aunque se reinicie el dev server.  
**Solución:** Usar `cache: 'no-store'` cuando la página tiene `force-dynamic`. Borrar `.next/` si persiste.

### `setPointerCapture` bloquea navegación de botones
**Causa:** Capturar eventos de puntero en el `<section>` intercepta clicks en elementos hijos interactivos.  
**Solución:** Verificar `closest('a, button')` antes de activar la captura.

---

## Checklist para replicar en otro proyecto

- [ ] Instalar FileBird en WordPress y crear carpeta para slides
- [ ] Anotar el `folder_id` de esa carpeta (tabla `wp_fbv`)
- [ ] Agregar snippet PHP en WordPress con el `folder_id` correcto
- [ ] Verificar endpoint: `GET /wp-json/imbra/v1/slider` devuelve JSON
- [ ] Copiar `HeroSlide` interface y `getHeroSlides()` en `lib/wordpress.ts`
- [ ] Actualizar `WP_BASE` / `NEXT_PUBLIC_WORDPRESS_URL` en `.env.local`
- [ ] Copiar `Hero.tsx` en `components/features/`
- [ ] Agregar `export const dynamic = 'force-dynamic'` en `page.tsx`
- [ ] Llamar `getHeroSlides()` y pasar resultado a `<Hero slides={...} />`
- [ ] Subir al menos una imagen a la carpeta con los campos completos
- [ ] Probar: autoplay, swipe, click en botón, fallback (carpeta vacía)

---

*Documentación técnica — Imbra Store Headless — Abril 2026*
