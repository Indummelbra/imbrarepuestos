# 🏥 Su Marca Headless - Documentación Técnica Integral

Este documento ofrece una visión completa y detallada de la arquitectura, conexiones, implementaciones y flujos de trabajo del proyecto **Su Marca**, desde su base de código hasta su estado actual en vivo.

---

## 1. 🏗️ Arquitectura y Fundamentos del Código

El proyecto sigue una arquitectura **Headless Commerce**, separando la interfaz de usuario (Frontend) de la lógica de negocio y datos (Backend).

### Stack Tecnológico
- **Frontend Principal:** Next.js 15+ (App Router) y TypeScript.
- **Backend CMS:** WordPress + WooCommerce (REST API).
- **Estilos:** Tailwind CSS v4 para diseño dinámico y premium.
- **Base de Datos Suplementaria:** Supabase (PostgreSQL) para funciones de aplicación.
- **Caché Distribuido:** Upstash Redis.
- **Infraestructura de Despliegue:** Vercel (Edge & Serverless).

### Estructura de Directorios
- `/app`: Rutas del sistema (Next.js App Router).
- `/components`: Biblioteca de componentes React reutilizables (UI, Layout, Secciones).
- `/lib`: El "cerebro" técnico. Contiene los adaptadores de API, lógica de mapeo y utilidades de negocio.
- `/scripts`: Más de 100 herramientas de automatización para mantenimiento y sincronización.
- `/docs`: Registro histórico y guías de desarrollo.

---

## 2. 🔌 Conexiones y Blindaje de Datos (Connections)

Para ser un proyecto de primera categoría, el sistema utiliza un sistema de **Shielding** para no depender de la velocidad de WordPress:

1.  **Mapeador Farmacéutico (`lib/mappers.ts`):** Convierte el JSON crudo y desordenado de WooCommerce en objetos limpios con propiedades como `isRefrigerated` o `requiresRx`.
2.  **Capa de Caché Edge (Redis):** Las peticiones pesadas se almacenan en Upstash Redis para evitar consultas repetitivas al servidor de WordPress.
3.  **Static Mirror:** El árbol de categorías se sincroniza en un archivo JSON local (`fixed-categories.json`), garantizando que el menú principal funcione instantáneamente incluso si el backend falla.

---

## 3. ⚖️ Lógica de Negocio Especializada (Pharma Logic)

El sistema tiene inteligencia propia para manejar productos farmacéuticos:
- **Cadena de Frío:** Algoritmo automático que detecta medicamentos refrigerados mediante metadatos (`_cadena_de_frio`), categorías (ID `3368`) o palabras clave en el título.
- **Fórmula Médica (Rx):** Identificación de antibióticos y controlados mediante validación de taxonomías y diccionarios médicos internos.
- **Calculadora de Envíos Dinámica:** Integración con las zonas de envío de WooCommerce que descuenta festivos y estima fechas reales de llegada.

---

## 4. 🚀 Implementaciones "PLUS" (Diferenciadores)

Son los módulos a medida que elevan la experiencia de usuario:

### 💊 Pastillero Virtual (Pillbox)
- **SMS Hub:** Envío de mensajes de texto reales al celular del paciente para recordar tomas.
- **Gestión de Stock:** Alerta al usuario cuando sus medicamentos se están agotando.
- **Sincronización Silenciosa:** Persistencia de datos en `localStorage` y sincronización con Supabase vinculada al ID de WordPress.

### 🛒 Checkout de Alta Conversión
- **Prescription Uploader:** Módulo para que el usuario suba su fórmula médica legalmente requerida.
- **Wompi Integration:** Pasarela de pagos de Bancolombia integrada de forma nativa.
- **Wizard Step-by-Step:** Proceso de compra guiado que reduce la fatiga del usuario.

### 🚚 Cotizador de Envíos Express
- Interfaz premium con *Glassmorphism*.
- Estimaciones basadas en la ubicación del usuario y reglas logísticas de la transportadora.

---

## 5. 🛠️ Scripts de Automatización e Ingeniería
La salud del proyecto se mantiene mediante scripts potentes:
- **`sync-categories.js`:** Sincroniza el menú de la web con el inventario de WordPress.
- **`audit-product.ts`:** Busca fallos en los datos de los productos antes de que afecten al cliente.
- **`verify-cold-chain.ts`:** Escaneo de integridad para productos sensibles al calor.

---

## 6. 📊 Flujo E-commerce en Vivo (Pipeline)
1.  **Gestión:** El administrador edita productos en WordPress.
2.  **Sincronización:** Los scripts/webhooks notifican al Front de los cambios.
3.  **Entrega:** El usuario navega por una SPA (Single Page Application) ultrarrápida servida desde Vercel.
4.  **Compra:** El Checkout valida la orden, recibe el pago vía Wompi y crea el pedido en WooCommerce para su despacho.

---
**Versión de Documentación:** 2.0  
**Última Actualización:** Marzo 2026
