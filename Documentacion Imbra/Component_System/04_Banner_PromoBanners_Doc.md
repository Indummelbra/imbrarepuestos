# Documentación de Componente: Banner (PromoBanners)
**Fecha de Registro:** 2026-03-12
**Estado:** Terminado / Parametrizado

## 🏗️ Estructura de 3 Niveles (Jerarquía Imbra)
Módulo de promociones con grid asimétrico.

1.  **DIV 1 (Fondo):** Fondo de sección (Blanco/Gris oscuro).
2.  **DIV 2 (Contenedor Maestro):** Clase `.imbra-content-container`.
    *   **Max-Width:** 1920px
    *   **Padding Horizontal:** 20px (`px-5`).
3.  **DIV 3 (Contenido):** Grid de 12 columnas (`lg:grid-cols-12`) que distribuye los banners de forma 5-4-3.

## 🎨 Parámetros y Tokens
- **Diseño:** Mix-blend mode para las imágenes, overlays oscuros, tipografías condensadas y potentes.
- **Interactividad:** Hover con escala de imagen y transición de 700ms.
- **Colores:** Naranja Primario (#F18700) y Negro Secundario (#212221).

---
**Ruta del Archivo Original:** `src/components/features/PromoBanners.tsx`
