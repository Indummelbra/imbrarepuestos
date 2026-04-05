# Reporte de Preparación para Despliegue (Dokploy/Docker)

Este documento confirma que el Headless de IMBRA Store ha pasado todas las pruebas de compilación y está listo para ser desplegado en Dokploy.

## 1. Estado de Compilación (Build)
- **Resultado**: ✅ EXITOSO (`Compiled successfully`).
- **TypeScript**: Se eliminaron todos los usos de `any` en rutas críticas para cumplir con las reglas estrictas de Next.js en producción.
- **Linting**: Verificado y corregido.

---

## 2. Configuración Docker
- **Dockerfile**: Validado con `multi-stage build` para optimización de imagen.
- **Next Config**: Modo `standalone` activo en `next.config.js`. Esto reduce drásticamente el tamaño del contenedor al copiar solo lo necesario para el runtime.
- **Puerto**: La imagen expone el puerto `3000`.

---

## 3. Variables de Entorno Requeridas (Dokploy)
Para que el despliegue funcione correctamente en Dokploy, debes configurar las siguientes variables en el panel de control de la aplicación:

### Sincronización CMS y WordPress
- `NEXT_PUBLIC_WORDPRESS_URL`: URL base de tu WordPress MKT.
- `SYNC_SECRET`: El token de seguridad que configuramos (`Imbra2025_Sync_Safety`).

### Conectividad Supabase
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Key pública.
- `SUPABASE_SERVICE_ROLE_KEY`: Key administrativa para sincronización.

### Pasarela PlacetoPay
- `PTP_LOGIN`: Credencial de acceso.
- `PTP_SECRET_KEY`: Llave secreta.
- `PTP_BASE_URL`: URL del ambiente (Test/Producción).
- `NEXT_PUBLIC_RETURN_URL`: URL de retorno tras el pago en el Headless.

### WooCommerce API
- `WC_CONSUMER_KEY`: Llave de lectura/escritura.
- `WC_CONSUMER_SECRET`: Secreto de la API.

---

## 4. Instrucciones de Despliegue en Dokploy
1. Conecta el repositorio de GitHub.
2. Selecciona **Nixpacks** o **Dockerfile** (se recomienda Dockerfile ya que está optimizado).
3. Añade las variables de entorno mencionadas arriba.
4. Presiona **Deploy**.

---
*Reporte generado automáticamente tras validación de build exitosa el 19 de Marzo de 2026.*
