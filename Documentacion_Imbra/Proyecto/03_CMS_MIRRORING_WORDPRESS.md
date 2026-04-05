# Documentación Maestra: CMS Mirroring WordPress 1:1 (SEO Ready)

Este manual técnico detalla la arquitectura, el funcionamiento y el mantenimiento del sistema de sincronización de contenido legal e informativo desde WordPress hacia el Headless de IMBRA Store.

---

## 1. El Problema y la Solución SEO
**Problema**: Originalmente, las páginas de WordPress presentaban URLs en la raíz (`/politica-...`). Al migrarlas al Headless, se intentó usar prefijos como `/legal/` o `/paginas/`, lo cual rompía la autoridad SEO histórica.
**Solución**: Se implementó un ruteador dinámico universal en la raíz (`/[slug]`) que imita 1:1 la estructura de WordPress, permitiendo una transición transparente para los buscadores.

---

## 2. Infraestructura de Datos (Supabase SQL)
Para garantizar la persistencia del contenido sin depender de WordPress en cada carga, se creó la siguiente estructura en la base de datos:

```sql
CREATE TABLE info_politica_paginas (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('legal', 'pagina', 'otro')),
    modified_gmt TIMESTAMP WITH TIME ZONE,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de Seguridad (RLS)
ALTER TABLE info_politica_paginas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON info_politica_paginas FOR SELECT USING (true);
```

---

## 3. Lógica del Motor de Sincronización (API)
El archivo `src/app/api/sync-legal-pages/route.ts` maneja la lógica de ingestión de datos.

### Seguridad (Secret Sharing)
Ambos métodos (GET/POST) validan el parámetro `secret` contra la variable de entorno `SYNC_SECRET`. Esto evita que terceros disparen peticiones de sincronización falsas.

### Revalidación de Caché (ISR)
Para que los cambios sean instantáneos, se utiliza la función `revalidatePath` de Next.js.
```typescript
// Al recibir una actualización exitosa:
if (slug) {
  revalidatePath(`/${slug}`); // Limpia la caché específica de la página
} else {
  revalidatePath("/[slug]", "page"); // Limpia todas las páginas dinámicas
}
```

---

## 4. Ruteo Dinámico de Nivel Raíz
El archivo `src/app/[slug]/page.tsx` es el responsable de servir el contenido. Su lógica de filtrado es crítica para no interferir con las rutas estáticas de la tienda (como `/cart` o `/product`).

```typescript
// Filtro de slugs autorizados
const isCmsPage = slug.startsWith('politica-') || 
                  slug.startsWith('pagina-') || 
                  slug.startsWith('terminos-');

if (!isCmsPage) notFound(); // Evita consultas innecesarias a la DB
```

---

## 5. El Componente CMS Premium (`CMSContent.tsx`)
Este componente transforma el HTML "crudo" de WordPress en una interfaz premium de IMBRA:

-   **Banner Industrial**: Header oscuro con título dinámico.
-   **Sanitización de Estilos**: Se eliminan las clases de WordPress y se aplican las de IMBRA (`imbra-content-container`, `prose-slate`).
-   **Interactividad**: Implementado como "Client Component" para permitir funciones de impresión y compartir.

---

## 6. Configuración de Webhooks (WordPress)
Para que WordPress avise al Headless de un cambio, se debe añadir este fragmento en el `functions.php` del tema activo:

```php
add_action('save_post', 'sync_imbra_headless_page', 10, 3);
function sync_imbra_headless_page($post_id, $post, $update) {
    if ($post->post_type != 'page') return;
    
    $slug = $post->post_name;
    $url = "https://store.imbra.cloud/api/sync-legal-pages";
    
    wp_remote_post($url, array(
        'body' => json_encode(array(
            'slug' => $slug,
            'secret' => 'TU_SECRETO_AQUI'
        )),
        'headers' => array('Content-Type' => 'application/json')
    ));
}
```

---

## 7. Mantenimiento para Desarrolladores
-   **Entorno Local**: Como el Webhook no puede llegar a un `localhost`, usa las URLs de sync manual detalladas en el `walkthrough.md`.
-   **Nuevas Tipologías**: Si se crea una nueva serie de páginas (ej: `/blog-posts/`), simplemente añade el prefijo en el ruteador `[slug]/page.tsx` y en el mapeador de la API.

---
*Documentación generada el 19 de Marzo de 2026 para el equipo técnico de IMBRA Store.*
