# Índice de Estructura y Contenido del Proyecto

Este documento proporciona una visión general de la organización del código y el propósito de cada directorio y archivo clave en el ecosistema Headless E-commerce.

---

## 📂 Directorios Principales

### 1. [`.agent/`](file:///.agent) - Inteligencia del Proyecto
Contiene el conocimiento contextual para agentes de IA y desarrolladores.
- **`skills/`**: Guías maestras sobre estándares de desarrollo, SEO, UI/UX y arquitectura.
- **`workflows/`**: Procesos paso a paso para tareas comunes (despliegue, migraciones).
- **`STRICT_RULES.md`**: Reglas de oro del proyecto (Cero inglés, límites de push, etc.).

### 2. [`app/`](file:///app) - Núcleo Next.js (App Router)
Contiene las rutas, páginas y endpoints de la API.
- **`(view)/`**: Rutas de visualización (Tienda, Producto, Categorías).
- **`api/`**: Endpoints para checkout, búsqueda avanzada, envío y autenticación.
- **`checkout/`**: Lógica de la página de pago y resultados.
- **`layout.tsx`**: Estructura base, fuentes (Inter) y GTM.

### 3. [`components/`](file:///components) - Biblioteca de UI
Componentes de React organizados por funcionalidad.
- **`checkout/`**: Formularios de pago, uploader de fórmulas, botones de pasarela.
- **`product/`**: Tarjetas de producto, carruseles, badges.
- **`layout/`**: Header, Footer, Navigation, CartDrawer.
- **`ui/`**: Componentes base (Botones, Inputs, Modales con Radix UI).

### 4. [`lib/`](file:///lib) - Lógica de Negocio y Utilidades
El "cerebro" técnico detrás del frontend.
- **`mappers.ts`**: Transformación de datos crudos de WooCommerce.
- **`woocommerce.ts`**: Cliente API con lógica de caché y revalidación.
- **`supabaseAdmin.ts`**: Conexión con Supabase para el "Search Mirror".
- **`redis.ts`**: Implementación de caché distribuido con Upstash.
- **`shipping.ts` / `holidays.ts`**: Lógica de cálculo de envíos y festivos.

### 5. [`scripts/`](file:///scripts) - Automatización y Mantenimiento
Scripts de Node.js para tareas administrativas y de datos (+100 archivos).
- **`sync_robust.ts`**: Sincronización masiva WooCommerce -> Supabase.
- **`audit-categories.ts`**: Verificación de integridad de taxonomías.
- **`generate-colombia-data.js`**: Procesamiento de datos geográficos (DANE).

### 6. [`context/`](file:///context) - Gestión de Estado
Proveedores de contexto de React.
- **`CartContext.tsx`**: Gestión global del carrito, descuentos y cargos por cadena de frío.
- **`AuthContext.tsx`**: Estado de autenticación del usuario.

### 7. [`data/`](file:///data) - Datos Locales y Espejos
- **`fixed-categories.json`**: Espejo estático de categorías para carga instantánea.
- **`colombia-data.json`**: Base de datos de departamentos y ciudades.

---

## 📄 Archivos de Configuración Críticos
- **`next.config.ts`**: Configuración de Next.js, dominios de imágenes y optimizaciones.
- **`package.json`**: Dependencias (Next 15, React 19, Tailwind v4, Upstash, Supabase).
- **`MASTER_PROMPT_REPLICACION.md`**: Guía maestra para duplicar este proyecto.
- **`DOC_PROYECTO_COMPLETO.md`**: Documentación técnica detallada.
- **`tsconfig.json`**: Configuración estricta de TypeScript.

---

## 🛠️ Tecnologías Integradas
- **Frontend**: Next.js, Tailwind CSS v4, Framer Motion.
- **Backend**: WordPress/WooCommerce (Headless).
- **Infraestructura**: Vercel.
- **BBDD/Search**: Supabase (PostgreSQL + RPC).
- **Caché**: Upstash Redis.
- **Pagos**: Placetopay / Wompi / COD.
