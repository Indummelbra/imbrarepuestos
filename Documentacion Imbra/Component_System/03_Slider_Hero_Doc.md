# Documentación de Componente: Slider (Hero)
**Fecha de Registro:** 2026-03-12
**Estado:** Terminado / Parametrizado

## 🏗️ Estructura de 3 Niveles (Jerarquía Imbra)
Impacto visual principal de la página de inicio.

1.  **DIV 1 (Fondo):** Sección externa con imagen de fondo (Hero Image) que cubre el área visual.
2.  **DIV 2 (Contenedor Maestro):** Clase `.imbra-content-container`.
    *   **Max-Width:** 1920px
    *   **Padding Horizontal:** 20px (`px-5`).
3.  **DIV 3 (Contenido):** Texto promocional, Call to Action (CTA) y el componente MotoSelector integrado.

## 🎨 Parámetros y Tokens
- **Tipografía:** H1 con `clamp()` para escalado fluido, font-display (Archivo), estilo Bold/Italic.
- **Botones:** Estilo "Secondary" (Negro/Naranja) con hover reactivo.
- **Paddings:** Ajustados para no interferir con el Header fijo.

---
**Ruta del Archivo Original:** `src/components/features/Hero.tsx`
