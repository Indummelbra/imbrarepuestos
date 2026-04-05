# TAREAS LUNES — LANZAMIENTO imbrarepuestos.com

Fecha objetivo: lunes en la mañana  
Estado actual (viernes): todo funciona en https://store.imbra.cloud/

---

## ORDEN DE EJECUCIÓN

### 1. Apuntar el dominio (DNS)
- Entra al panel donde tienes registrado `imbrarepuestos.com`
- Cambia el registro A o CNAME para que apunte al servidor de Dokploy
- Espera propagación (puede tardar 5–30 minutos)

---

### 2. Cambiar 1 variable en Dokploy

En Dokploy → tu app → Environment Settings:

**Cambiar:**
```
NEXT_PUBLIC_RETURN_URL=https://store.imbra.cloud/checkout/resultado
```
**Por:**
```
NEXT_PUBLIC_RETURN_URL=https://imbrarepuestos.com/checkout/resultado
```

También cambiarlo en **Build-time Arguments**:
```
NEXT_PUBLIC_RETURN_URL=https://imbrarepuestos.com/checkout/resultado
```

→ **Hacer Redeploy**

---

### 3. Actualizar los 3 Webhooks de WooCommerce

En `mkt.imbrarepuestos.com/wp-admin` → WooCommerce → Ajustes → Avanzado → Webhooks

Cambiar la URL de los 3 webhooks (Producto Creado, Actualizado, Eliminado) de:
```
https://store.imbra.cloud/api/webhooks/woo-sync
```
A:
```
https://imbrarepuestos.com/api/webhooks/woo-sync
```

---

### 4. Correr el Sync de Supabase

Abrir esta URL en el navegador:
```
https://imbrarepuestos.com/api/sync-products?secret=Imbra2025_Sync_Safety
```

Esperar respuesta (1–2 minutos). Debe decir:
```json
{ "success": true, "count": 2337 }
```

---

### 5. Verificar PlacetoPay (pago de prueba)

- Hacer un pedido real pequeño
- Confirmar que PlacetoPay redirige de vuelta a `imbrarepuestos.com/checkout/resultado`
- Confirmar que el estado del pago se muestra correctamente

---

### 6. Verificar el Buscador y MotoSelector

- Ir a `imbrarepuestos.com/tienda`
- Probar búsqueda por texto
- Probar el MotoSelector (seleccionar marca → modelo → año)
- Si no aparecen productos, repetir el Paso 4 (sync Supabase)

---

## VARIABLES DE ENTORNO FINALES (referencia)

```
WC_CONSUMER_KEY=ck_3adb8346265e17ceb80913d501480c5d80905adc
WC_CONSUMER_SECRET=cs_f499ee29185b9984465af5219f2b467eef77d630
PTP_LOGIN=bc1cb144264d2a706734f55068678e8a
PTP_SECRET_KEY=3NpZgA28j8bfgYi2
PTP_BASE_URL=https://checkout.placetopay.com
WPGRAPHQL_URL=https://mkt.imbrarepuestos.com/graphql
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SYNC_SECRET=Imbra2025_Sync_Safety
NEXT_PUBLIC_WORDPRESS_URL=https://mkt.imbrarepuestos.com/
NEXT_PUBLIC_SUPABASE_URL=https://supabase.imbra.cloud
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_RETURN_URL=https://imbrarepuestos.com/checkout/resultado  ← CAMBIAR EL LUNES
CRON_SECRET=ImbraSecurityCron2026_XyZ
WP_JWT_USER=dazzleagency.ac@gmail.com
WP_JWT_PASS=u0%!HHBqwr44
```

> Nota: actualizar WC_CONSUMER_KEY y WC_CONSUMER_SECRET si se generaron claves nuevas.

---

## CHECKLIST FINAL

- [ ] DNS apuntando a Dokploy
- [ ] Variable NEXT_PUBLIC_RETURN_URL cambiada (Environment + Build-time)
- [ ] Redeploy ejecutado
- [ ] 3 webhooks WooCommerce actualizados a imbrarepuestos.com
- [ ] Sync Supabase ejecutado → responde count: ~2337
- [ ] Pago de prueba exitoso con PlacetoPay
- [ ] Buscador funciona con productos
- [ ] MotoSelector muestra marcas/modelos
