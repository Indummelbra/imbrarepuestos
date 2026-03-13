# Informe de Ingeniería: Mapeo y Sincronización de Productos (WooCommerce ↔ Headless)

Este informe detalla el proceso de ingeniería, la arquitectura y la lógica implementada en el proyecto **PharmaPlus Headless** para mapear y sincronizar productos de manera eficiente y escalable. Este documento sirve como guía para replicar el sistema en otros proyectos.

---

## 1. Arquitectura de Sincronización (3 Capas)

El sistema utiliza una arquitectura de tres capas para garantizar velocidad, redundancia y consistencia de datos:

1.  **Capa de Origen (WooCommerce):** Es el "Source of Truth" (Fuente de Verdad). Aquí se gestiona el inventario, precios y metadatos.
2.  **Capa de Búsqueda y Caché (Supabase):** Los productos se sincronizan en una tabla de Supabase (`products_search`). Esto permite búsquedas ultra-rápidas y filtrado avanzado que sería costoso directamente en la API de WooCommerce.
3.  **Capa de Presentación (Next.js Headless):** El frontend consume datos de Supabase para listados/búsquedas y directamente de WooCommerce (con caché en Redis) para el detalle del producto, asegurando datos frescos en el checkout.

---

## 2. Proceso de Sincronización

### A. Sincronización en Lote (Bulk Sync)
Implementada en [app/api/sync-products/route.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/app/api/sync-products/route.ts).
- **Funcionamiento:** Recorre todos los productos de WooCommerce mediante paginación y los inserta/actualiza (`upsert`) en Supabase.
- **Optimización:** Filtra productos no publicados o marcados como "ocultos" para mantener la base de datos limpia.

### B. Sincronización en Tiempo Real (Webhooks)
Implementada en [app/api/webhooks/woo-sync/route.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/app/api/webhooks/woo-sync/route.ts).
- **Topicos:** Escucha `product.created`, `product.updated` y `product.deleted`.
- **Lógica Nivel Dios:** Al recibir un webhook, el sistema realiza un **refetch** completo del producto desde la API de WooCommerce. Esto evita problemas con datos parciales enviados en el cuerpo del webhook.
- **Revalidación:** Al terminar la sincronización, dispara `revalidateTag('products')` y `revalidateTag('product-[slug]')` para refrescar instantáneamente la caché de Next.js.

---

## 3. Lógica de Mapeo Farmacéutico ([lib/mappers.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/lib/mappers.ts))

El archivo [lib/mappers.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/lib/mappers.ts) contiene la inteligencia para transformar la data cruda de WooCommerce en objetos listos para la UI.

### Factores Clave del Mapeo:
- **Metadatos Robustos:** Busca campos como `_marca`, `_registro_invima` y `_clasificacion` en diferentes lugares (meta_data, atributos o propiedades de primer nivel).
- **Lógica de Receta Médica (Rx):** 
    - Un producto requiere fórmula médica si tiene el meta `_needs_rx` en 'true'.
    - **Fallback Inteligente:** Si no tiene el meta, se analiza el nombre del producto buscando palabras clave (antibiótico, tramadol, amoxicilina, etc.) o si pertenece a categorías específicas (ej: "Medicamentos Controlados").
- **Cadena de Frío:** Se detecta automáticamente por el slug de la categoría `cadena-de-frio` o el ID `3368`.
- **Gestión de Stock:** Se implementa una validación estricta donde un producto solo es comprable si `stock_quantity > 0`. El estado `instock` por sí solo no es suficiente.

---

## 4. Estrategia de Fetching ("Nivel Dios")

En [lib/woocommerce.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/lib/woocommerce.ts), se implementa una estrategia híbrida:
1.  **Intento GraphQL:** Primero intenta obtener los datos via **WPGraphQL**. Es mucho más rápido y devuelve exactamente los campos necesarios.
2.  **Fallback REST:** Si GraphQL falla o el plugin no está disponible, cae automáticamente en la **REST API v3** de WooCommerce.
3.  **Caché Redis:** Todas las respuestas pesadas se guardan en Redis (`withRedisCache`) con un tiempo de vida (TTL) configurable.

---

## 5. Configuración en WordPress

Para que este sistema funcione, se requieren los siguientes componentes en el sitio de WordPress:

### Plugins Necesarios:
- **WooCommerce**: Motor e-commerce.
- **WPGraphQL**: Para fetching de alto rendimiento.
- **WPGraphQL for WooCommerce**: Extensión para exponer datos de Woo en GQL.
- **Application Passwords**: Para la autenticación del Headless.

### Snippets Personalizados (`cms-snippets/`):
- **[handover_helper.php](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/cms-snippets/handover_helper.php)**: Permite la transición fluida al carrito de WP.
    - Captura parámetros de URL (`?saprix_handover=1&items=id:qty`).
    - Pre-llena los campos del checkout (Nombre, Cédula, etc.) desde la URL.
    - Implementa reglas de envío personalizadas basadas en el conteo de ítems.

---

## 6. Visualización en el Frontend

La data mapeada se consume en componentes como [ProductDetails.tsx](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/components/product/ProductDetails.tsx), que reacciona según los atributos detectados:
- **Alertas Visuales:** Muestra banners especiales para productos refrigerados o que requieren receta.
- **Optimización de Imágenes:** Procesa la galería de imágenes asegurando que siempre haya al menos un placeholder si no hay fotos.
- **Sincronización de Carrito:** Los productos se añaden al `CartContext` con banderas de Rx y Frío, que luego se validan en el flujo de checkout.
