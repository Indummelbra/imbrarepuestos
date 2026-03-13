# Documentación de Componente: Header
**Fecha de Registro:** 2026-03-12
**Estado:** Terminado / Parametrizado

## 🏗️ Estructura de 3 Niveles (Jerarquía Imbra)
Este componente sigue estrictamente la arquitectura de contenedores para garantizar la alineación global.

1.  **DIV 1 (Fondo):** Sección externa con el fondo según corresponda (Gris claro en Top Bar, Blanco en Middle/Bottom Bar).
2.  **DIV 2 (Contenedor Maestro):** Clase `.imbra-content-container`.
    *   **Max-Width:** 1920px
    *   **Padding Horizontal:** 20px (`px-5`) fijo para alineación total.
3.  **DIV 3 (Contenido):** Grid o Flexbox interno con los elementos funcionales.

## 🎨 Parámetros y Tokens
- **Colores:** #f3f4f6 (Top), Blanco (Middle/Bottom).
- **Fuentes:** Montserrat (Body), Archivo (Display).
- **Iconos:** Material Icons (Person, Menu, Search, Shopping_cart).

## 🧩 Secciones Internas
- **Top Bar:** Bienvenida, Catálogo, Login.
- **Middle Bar:** Logo Imbra, Buscador de productos, Contacto, Carrito/Favoritos.
- **Bottom Bar:** Navegación principal (TIENDA, PRODUCTOS, BLOG, etc.), Moneda y Selector de Idioma.

---
**Ruta del Archivo Original:** `src/components/layout/Header.tsx`
