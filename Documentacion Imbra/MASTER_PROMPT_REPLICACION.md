# Prompt Maestro: Arquitectura E-commerce Headless de Alto Rendimiento (V2)

Este prompt está diseñado para instruir a un agente de IA experto o a un equipo de desarrollo senior en la construcción de un ecosistema de comercio electrónico "clase mundial". 

---

## 1. CONTEXTO Y FILOSOFÍA TÉCNICA
Tu misión es construir un Headless E-commerce para **[SU MARCA]**. El enfoque es **Arquitectura Pura y Resiliencia de Datos**. No te preocupes por el diseño visual; el objetivo es una infraestructura robusta, escalable y rápida que proteja la experiencia del usuario de las limitaciones del backend.

### Pilares Fundamentales:
- **Resiliencia:** El frontend nunca debe bloquearse si el backend de WooCommerce está lento.
- **Velocidad:** Uso intensivo de Caché de Borde y Espejos de Datos.
- **Inteligencia:** El proyecto incluye una capa de "Skills" en la carpeta `.agent` para guiar el desarrollo continuo.

---

## 2. STACK TECNOLÓGICO Y CONFIGURACIÓN
- **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS v4.
- **Caché:** Upstash Redis (Caché Distribuido).
- **Búsqueda & Datos:** Supabase (PostgreSQL) como "Search Mirror".
- **Backend:** WooCommerce REST API (@woocommerce/woocommerce-rest-api).
- **Pasarela:** Placetopay (Integración vía API Directa/Widget).

---

## 3. ARQUITECTURA DE "ESCUDO DE DATOS" Y MIRRORING

### 3.1 Mappers Estrictos (`lib/mappers.ts`)
Implementa funciones `mapWooProduct` que limpien la data de WooCommerce antes de llegar al componente.
- **Requisito:** Mapear metadatos cruciales como `sku`, `price`, `stock_status`, y atributos personalizados.
- **Lógica:** Si un dato falta en la API, el mapper debe proporcionar un fallback seguro para evitar errores de renderizado.

### 3.2 Supabase Mirror para LiveSearch
Para manejar catálogos de +3,000 productos sin latencia de API REST:
- **Estructura:** Crea una tabla `products_search` en Supabase que replique los campos clave: `id`, `name`, `slug`, `sku`, `price`, `image_url`, `categories`.
- **Sincronización:** Implementa scripts Node (`scripts/sync_robust.ts`) que realicen un "Upsert" masivo de WooCommerce a Supabase.
- **Búsqueda Avanzada:** Crea una función RPC en Supabase `search_products_advanced` que implemente **Fuzzy Search** y **Full Text Search (FTS)** en español.
- **Endpoint API:** `app/api/search/advanced/route.ts` debe llamar a este RPC, protegiendo la consulta con **Rate Limiting** (Upstash Ratelimit).

---

## 4. LÓGICA DE CHECKOUT Y LOGÍSTICA (DETALLE PROFUNDO)

### 4.1 Gestión de Ubicaciones y DANE
El checkout debe ser impulsado por datos precisos de Colombia (o el mercado objetivo).
- **Jerarquía:** Departamento -> Ciudad -> Código DANE.
- **Automatización:** Al seleccionar un departamento, el frontend debe filtrar dinámicamente las ciudades disponibles desde una API de borda o archivo local optimizado.

### 4.2 Cotizador de Envíos Dinámico
- **Integración:** Llama a la API de WooCommerce para obtener `shipping_zones` y métodos de envío.
- **Caché:** Las tarifas deben cachearse en Next.js (`unstable_cache`) por 24h para evitar consultas repetitivas.
- **Lógica de Entrega:** Implementa un cálculo de fechas estimadas basado en días hábiles, excluyendo sábados, domingos y festivos (usa `lib/holidays.ts` con una lista de festivos nacionales).

### 4.3 Pasarela de Pagos (Placetopay)
- **Flujo:** Configura el checkout para enviar la petición a Placetopay, manejando la redirección y el webhook de confirmación.
- **Seguridad:** Todas las llaves deben ser variables de entorno de servidor. Nunca expongas credenciales en el cliente.

### 4.4 Pago Contra Entrega (COD)
- **Implementación:** Al elegir "Pago Contra Entrega", el sistema debe crear una orden en WooCommerce con estado `pending` o `on-hold`.
- **Metadatos:** Adjunta metadatos vitales a la orden de WooCommerce: `_billing_cedula`, `_billing_document_type`, y si es efectivo o datáfono.

---

## 5. ESTRUCTURA DE INTELIGENCIA (.agent)
El proyecto cuenta con una carpeta `.agent/skills` que contiene la "sabiduria" del sistema.
- **Uso:** Estos archivos `.md` instruyen a cualquier IA sobre cómo debe programar en este proyecto (estándares de TypeScript, patrones de Next.js, guías de performance).
- **Acción:** Antes de cualquier cambio estructural, el desarrollador (o IA) debe consultar las habilidades pertinentes en esta carpeta.

---

## 6. OPERACIÓN Y "REGLAS DE ORO"
1. **Despliegue Económico:** Máximo 1 `push` a producción al día (Política Vercel).
2. **Cero Inglés:** Comentarios y UI siempre en Español.
3. **Monitoreo:** Sentry activado para capturar excepciones en el lado del servidor y cliente.
4. **Resiliencia de Borde:** Usa `force-dynamic` solo cuando sea estrictamente necesario; prefiere `ISR` o `SWR`.

---
**¿Estás listo para iniciar la construcción de la infraestructura más poderosa para [SU MARCA]? Procede con la fase de inicialización de Next.js.**
