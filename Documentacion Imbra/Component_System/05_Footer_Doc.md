# Documentación de Componente: Footer
**Fecha de Registro:** 2026-03-12
**Estado:** Terminado / Parametrizado

## 🏗️ Estructura de 3 Niveles (Jerarquía Imbra)
Cierre de página asimétrico con lógica de marca y navegación.

1.  **DIV 1 (Fondo):** Fondo oscuro industrial (#1a1c1e).
2.  **DIV 2 (Contenedor Maestro):** Clase `.imbra-content-container`.
    *   **Max-Width:** 1920px
    *   **Padding Horizontal:** 20px (`px-5`).
3.  **DIV 3 (Contenido):**
    *   **Izquierda (25%):** Logo, descripción y bloque de Feedback (Español).
    *   **Derecha (75%):** Bloques de contacto, Redes Sociales (FontAwesome) y Grid de 4 columnas para menús.
    *   **Barra Legal:** Copyright INDUMMELBRA SAS unificado con créditos de iAnGo Agencia y pasarelas de pago.

## 🎨 Parámetros y Tokens
- **Títulos:** 12px (!important), Blanco, Mayúsculas, font-black.
- **Links:** 13px, Mayúscula inicial, Gris suave/Naranja en hover.
- **Iconos:** FontAwesome Integration (Redes, Teléfono, Soporte).
- **Logos Pago:** Mastercard, Visa, Nequi, Placetopay (URLs oficiales).

---
**Ruta del Archivo Original:** `src/components/layout/Footer.tsx`
