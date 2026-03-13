# 📋 Guía de Tareas Pendientes: Configuración Final IMBRA Store

Hermano, aquí tienes el Checklist detallado de lo que debes hacer para que los 4 procesos que implementamos funcionen perfectamente. He dividido esto por plataforma para que te sea fácil seguirlo.

---

## 1. 🛠️ Supabase (Bases de Datos)
Para el **Live Search** y la **Sincronización**, debes configurar la infraestructura SQL.

- [ ] **Ejecutar Script SQL:** Ve al "SQL Editor" de Supabase y pega el código que está en:  
  `Documentacion Imbra/Marca/Ingenieria_Live_Search_Sincronización_Configuración_Supabase.md`
    *   *Esto creará la tabla `products_search` y la función RPC `search_products_advanced`.*
- [ ] **Verificar Tabla:** Asegúrate de que la tabla `products_search` aparezca en el esquema `public`.

---

## 2. 🎡 WordPress / WooCommerce (Backend)
Aquí activaremos la comunicación hacia el Headless.

- [ ] **Instalar Snippet PHP:**
    *   Usa el plugin "Code Snippets" o edita tu `functions.php`.
    *   Copia y activa el contenido de: `Documentacion Imbra/Marca/handover_helper.php`.
    *   *Esto permite que el carrito se mantenga al saltar de Next.js a WooCommerce.*
- [ ] **Configurar Webhooks (Sincronización en Tiempo Real):**
    *   Ve a: *WooCommerce > Ajustes > Avanzado > Webhooks*.
    *   Crea 3 Webhooks con estos datos:
        1.  **Producto Creado:** Topic: `Product created` | URL: `https://tu-dominio.com/api/webhooks/woo-sync`
        2.  **Producto Editado:** Topic: `Product updated` | URL: `https://tu-dominio.com/api/webhooks/woo-sync`
        3.  **Producto Borrado:** Topic: `Product deleted` | URL: `https://tu-dominio.com/api/webhooks/woo-sync`
    *   *Usa el mismo secreto que definas en tu archivo .env.*

---

## 3. 💳 PlacetoPay (Pagos)
Para que los pedidos cambien de estado automáticamente tras el pago.

- [ ] **Configurar URL de Notificación (Webhook):**
    *   En tu consola de PlacetoPay, configura la URL de notificación a:  
        `https://tu-dominio.com/api/payments/placetopay/webhook`
    *   *Esto activará el cambio automático de `pending` a `processing` en WooCommerce.*

---

## 4. 🔑 Next.js (Variables de Entorno)
Actualiza tu archivo `.env.local` o las variables en Vercel/Dokploy.

- [ ] **Configurar Credenciales:**
    *   `WC_CONSUMER_KEY` y `WC_CONSUMER_SECRET`: Generadas en WooCommerce REST API.
    *   `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: De tu proyecto Supabase.
    *   `P2P_LOGIN` y `P2P_TRANKEY`: De tu cuenta PlacetoPay.
    *   `SYNC_SECRET`: Un código secreto tuyo (ej: `imbra-top-secret-2026`) para proteger el endpoint de sincronización masiva.

---

## 🚀 Paso Final: Sincronización Inicial
Una vez que todo lo anterior esté listo, debes ejecutar la carga inicial de productos:

- [ ] **Llamada de Sincronización:**  
  Visita en tu navegador: `https://tu-dominio.com/api/sync-products?secret=TU_SECRETO_AQUÍ`
    *   *Esto llenará Supabase con todos tus productos actuales de WooCommerce por primera vez.*

---
**Documentación de referencia:**  
📁 `Documentacion Imbra/Marca/Reporte_Implementacion_Arquitectura_Sincronizacion_V5.md`
