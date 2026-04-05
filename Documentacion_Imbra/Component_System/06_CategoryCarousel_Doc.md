# Documentación de Componente: Carousel de Categorías
**Fecha de Registro:** 2026-03-12
**Estado:** Terminado / Parametrizado

## 🏗️ Estructura de 3 Niveles (Jerarquía Imbra)
Réplica de alta fidelidad base en captura de pantalla para navegación rápida por categorías.

1.  **DIV 1 (Fondo):** Sección blanca (`bg-white`) con borde inferior sutil.
2.  **DIV 2 (Contenedor Maestro):** Clase `.imbra-content-container`.
    *   **Max-Width:** 1920px
    *   **Padding Horizontal:** 20px (`px-5`).
3.  **DIV 3 (Contenido):** Scroll-flex horizontal con items de categoría y flechas circulares de navegación.

## 🎨 Parámetros y Tokens
- **Items:** 
    *   Ancho: 180px fijo.
    *   Imagen: Contenedor con `aspect-square` y fondo `#f9f9f9`.
    *   Tipografía: Mayúscula inicial para nombres, contador en gris.
- **Interactividad:** 
    *   Hover: Cambio de color de fondo en contenedor e interés visual en título (Naranja Primario).
    *   Flechas: Aparecen al hacer hover sobre la sección.

## 🧩 Secciones Internas
- **Navegación:** Implementado scroll nativo suavizado con botones de control.
- **Categorías:** Frenos, Sillas, Escape, Suspensión, Eléctricos, Iluminación, Filtros.

---
**Ruta del Archivo Original:** `src/components/features/CategoryCarousel.tsx`
