# IMBRA BLUEPRINT: ADN del Proyecto

Este documento es el manual maestro para reconstruir **Imbra Repuestos Headless** desde cero. Contiene la esencia del diseño, la arquitectura y los estándares que garantizan una experiencia premium y profesional.

## 🎨 1. Brandbook (Identidad Visual)

### Colores Maestros
- **Primario (Ambar):** `#ffbc50`
  - Uso: Botones principales, acentos de navegación, iconos destacados.
- **Base (Negro Industrial):** `#1a1a1a` o `#1a1c1e`
  - Uso: Footers, Top bar, estados dark mode, bordes fuertes.
- **Fondo:** `#ffffff` (Light) / `#111827` (Dark)
- **Texto:** `#1f2937` (Gris oscuro para legibilidad).

### Tipografía
- **Fuente Principal:** `Inter` (Google Fonts).
- **Estilos:**
  - Títulos: Bold / Black con tracking ligero (`-0.025em`).
  - Cuerpo: Medium para legibilidad en e-commerce.
  - Etiquetas: Uppercase con tracking aumentado (`0.1em`).

### Estética Industrial
- **Bordes:** `0px` (Straight edges / Bordes rectos). La marca debe sentirse sólida y técnica, evitando redondeados suaves (excepto en avatares específicos).
- **Iconografía:** Material Icons + Lucide React.
- **Efectos:** Glassmorphism sutil en dropdowns y sombras profundas para elevación de componentes.

---

## 🏗️ 2. Estructura de Layout (Jerarquía)

### Nivel 1: Top Bar (Utilidad)
- Mensaje de bienvenida, enlaces rápidos (Catálogo, FAQ, Contacto) y Login/Registro rápido.

### Nivel 2: Main Header (Acción)
- **Logo:** `logo-Imbra.png` h-14.
- **Search:** [LiveSearch](file:///f:/CLIENTES/IMBRA-MAPACHE/Imbra%20Headless%201A/components/search/LiveSearch.tsx#6-121) centralizado y prominente.
- **Acciones:**
  - Centro de Ayuda (Dropdown con acceso a WhatsApp).
  - Wishlist (Contador de favoritos).
  - Cart (Resumen de total y contador).

### Nivel 3: Secondary Nav (Navegación)
- Categorías maestras (Inicio, Tienda, Productos, Blog, Contacto).
- Selector de moneda (COP) y lenguaje.

### Footer (Confianza)
- Logotipo invertido.
- Resumen de marca (50 años de experiencia).
- Feedback loop.
- Grid de Mapa de Sitio, Info, Categorías y Soporte.
- Bottom bar con pasarelas de pago (Visa, Master, PSE, Efecty).

---

## 🛠️ 3. Estándares Técnicos

- **Framework:** Next.js 15 (App Router).
- **Motor UI:** React 19 + Tailwind CSS v4.
- **Integraciones:**
  - WooCommerce: `ck_...` / `cs_...` vía REST API.
  - Supabase: Auth y bases de datos personalizadas.
- **Despliegue:** Dokploy (Docker standalone mode).

---

## 📂 4. Mapa de Archivos Vitales (Lo que se hereda)
- [app/globals.css](file:///f:/CLIENTES/IMBRA-MAPACHE/Imbra%20Headless%201A/app/globals.css): Definición de @theme y variables CSS.
- [lib/woocommerce.ts](file:///f:/CLIENTES/IMBRA-MAPACHE/Imbra%20Headless%201A/lib/woocommerce.ts): Cliente de conexión.
- [context/CartContext.tsx](file:///f:/CLIENTES/IMBRA-MAPACHE/Imbra%20Headless%201A/context/CartContext.tsx): Lógica de estado global del carrito.
- `components/layout/`: Header y Footer reconstruidos bajo este estándar.
