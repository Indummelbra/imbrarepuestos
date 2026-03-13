# Documentación Técnica: Componentes del Home (Imbra Store)

Este documento detalla la estructura, el diseño y la lógica técnica de los componentes clave desarrollados para el Home de Imbra Store, siguiendo los estándares de diseño industrial y precisión de la marca.

## 1. Carrusel de Categorías (`CategoryCarousel.tsx`)

Componente dedicado a la navegación visual por las categorías principales de productos.

### Estructura de Layout (Sistema de 3 Capas)
- **DIV 1 (Sección):** Full-width con fondo `#f8f7f5` (Gris arena ligero). Padding vertical moderado.
- **DIV 2 (embra-content-container):** Contenedor maestro centrado para pantallas ultra-wide (máx 1920px).
- **DIV 3 (Bloque de Contenido):** Ancho del **88%** con `mx-auto` y `px-0` para alineación perfecta con los bordes industriales.

### Características Visuales
- **Tarjetas de Categoría:** 
  - Diseño minimalista con fondo blanco.
  - Imagen centrada con efecto `hover:scale-110`.
  - Título en `font-bold` con tipografía industrial.
- **Navegación:**
  - Botones de navegación rectangulares (Estilo 16:9).
  - Posicionados pegados al borde del bloque del 88%.
  - Colores: Blanco con hover en `primary` (Amarillo Imbra).

---

## 2. Experiencias Imbra / Testimonios (`TestimonialsBenefits.tsx`)

Sección de prueba social basada exclusivamente en opiniones reales de Google Maps y barra de beneficios de marca.

### Estructura de Layout (Sistema de 3 Capas)
- **DIV 1 (Sección):** Fondo `#f8f9fa`. Padding vertical moderado (`py-16`).
- **DIV 2 (embra-content-container):** Contenedor maestro centrado.
- **DIV 3 (Bloque de Contenido):** Ancho del **88%**, `mx-auto`, y **`px-0`** (sin paddings laterales adicionales).

### Componentes Internos

#### A. Cabecera (Google Proof)
- **Título:** "Experiencias Imbra" en tipografía masiva (`font-black`).
- **Rating Real:** Muestra el promedio **4.5** de Google.
- **Estrellas:** 5 estrellas (4.5 activas) usando Material Icons.
- **Autenticidad:** Logo oficial de Google integrado para validación visual inmediata y contador de (39 opiniones).

#### B. Carrusel de Opiniones
- **Contenido:** **39 opiniones reales** extraídas de Google Maps.
- **Orden Estratégico:** 35 menciones positivas al inicio; 4 menciones críticas (suavizadas técnicamente) al final.
- **Diseño Abierto:** Sin tarjetas encajonadas. Los testimonios flotan en el diseño, separados por líneas de precisión verticales (`divide-x`).
- **Navegación Industrial:** 
  - Botones **Verticales (9:16)** (`w-10 h-16`).
  - Posicionados en los extremos absolutos del bloque del 88%.
- **Lógica Infinita:** Sistema de 117 ítems (3 sets de 39) para un desplazamiento fluido sin fin.

#### C. Barra de Beneficios
- **Iconografía:** Color **Gris Industrial / Negro** (no azul) para mantener la sobriedad.
- **Contenido:** Envíos a toda Colombia, Garantía Imbra (50 años), Precios de Fábrica, Soporte Técnico y Pagos Seguros.

---

## Estándares de Código Aplicados
- **Idiomas:** Código y comentarios 100% en Español.
- **Diseño:** Borders rectos (`rounded-sm`), tipografía industrial masiva, y paleta de colores oficial Imbra.
- **Precisión:** Uso de divisiones (`divide-x`) y líneas depx para delimitar secciones en lugar de sombras pesadas o bordes redondeados.

**Fecha de Última Actualización:** 2026-03-12
**Estado:** Producción / Finalizado
