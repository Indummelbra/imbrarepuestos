# 📄 Informe Tecnico: Sincronizacion Estrategica y Despliegue Dokploy (V6.0) 🚀

Este documento resume la intervencion de alta ingenieria realizada para estabilizar el despliegue de **IMBRA Store** y potenciar su motor de datos.

---

## 🏗️ 1. Estabilizacion del Despliegue (Docker + Dokploy)

Tras varios intentos de build fallidos debido a dependencias de variables de entorno, se implemento una estrategia de **"Build Blindado"**:

- **Renderizado Dinamico Forzado:** Se añadio `export const dynamic = "force-dynamic"` en la Home y rutas criticas de API. Esto evita que Next.js intente conectar a la base de datos durante el build (donde no hay variables) y lo haga en tiempo real al cargar la web.
- **Sanitizacion de URLs:** Se ajusto el motor de WooCommerce para manejar correctamente URLs con o sin "/" al final, evitando errores de parseo de URL.
- **Correccion de Tipado (TS):** Se eliminaron los errores de ESLint (`any`) que bloqueaban el pipeline de Docker, creando interfaces robustas para los productos.

---

## 🔌 2. Configuracion Maestra de Variables (Env)

Se realizo una auditoria de las variables en **Dokploy -> Environment Settings**. Se corrigieron errores de sintaxis (uso de `:` en lugar de `=`) y se añadieron las llaves necesarias:

| Variable | Proposito |
| :--- | :--- |
| `WC_CONSUMER_KEY/SECRET` | Conexion con WooCommerce REST API. |
| `WPGRAPHQL_URL` | Acceso ultrarrapido via GraphQL. |
| `NEXT_PUBLIC_SUPABASE_URL` | Endpoint de la base de datos PostgreSQL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave maestra para sincronizacion masiva. |
| `SYNC_SECRET` | Token de seguridad para proteger los endpoints de sync. |

---

## ⚡ 3. Motor de Busqueda "Nivel Dios" (Supabase)

Se implemento una arquitectura de **espejeo de datos** para no depender de la latencia de WordPress:

- **Tabla `products_search`:** Creada en Supabase con soporte para **Full Text Search**.
- **Indice GIN:** Permite buscar entre miles de SKU y nombres en milisegundos.
- **RPC `search_products_advanced`:** Funcion avanzada en la DB que maneja errores de escritura, resaltado de texto (`<b>`) y ranking de relevancia.
- **Sincronizacion Masiva:** Se ejecuto un barrido total del catalogo localmente, importando **2337 productos** con exito.

---

## 🎨 4. Ajustes Finales de UI/UX

- **Footer Fix:** Se corrigio el error de renderizado que hacia que los logos de pasarelas de pago (Visa, Mastercard, etc.) se vieran gigantes. Ahora tienen un tamaño fijo, elegante y optimizado.
- **Live Search:** El componente de busqueda en el Header ahora consume directamente la API de Supabase, ofreciendo resultados instantaneos mientras el usuario escribe.

---

## 🏁 Estado Actual y Siguientes Pasos

- [x] **Produccion en Vivo:** El sitio despliega correctamente en Dokploy.
- [x] **Inventario Sincronizado:** 2,337 productos listos para la venta.
- [x] **Buscador Inteligente:** Operativo y rapido.

**Proxima Meta sugerida:** Configurar los Webhooks en WordPress para que cualquier cambio de precio o stock en el panel de WP se actualice en Supabase de forma automatica e invisible.

**Fecha:** 13 de marzo de 2026  
**Ingeniero:** iAnGo (Antigravity AI)
