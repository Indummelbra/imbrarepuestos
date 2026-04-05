# URGENTE — Checklist de Lanzamiento a Produccion
### Fecha limite: Lunes 6 de Abril de 2026 — Antes de apuntar el DNS

> **ATENCION:** Estos pasos DEBEN completarse ANTES de redirigir el dominio `imbrarepuestos.com` al servidor de Dokploy.
> Si se apunta el DNS sin hacer estos cambios, PlacetoPay NO redirigira correctamente al cliente despues del pago
> y el cron de sincronizacion de pedidos quedara roto.

---

## Contexto del problema

El headless store esta corriendo en `https://store.imbra.cloud` durante las pruebas.
El lanzamiento a produccion se hara bajo el dominio `https://imbrarepuestos.com`, que es el dominio
certificado ante PlacetoPay/Evertec. Hay 3 ajustes criticos que deben hacerse antes del cambio de DNS.

---

## PASO 1 — Dokploy: Agregar CRON_SECRET

**Donde:** Dokploy → App `imbra-store` → Environment Settings

**Accion:** Agregar la siguiente variable nueva:

```
CRON_SECRET=ImbraSecurityCron2026_XyZ
```

**Por que:** El endpoint `/api/cron/placetopay-probe` usa esta clave para validar que solo
el cron autorizado pueda ejecutarlo. El cron de cPanel ya envia esta clave en el header,
pero Dokploy no la tenia configurada, dejando el endpoint sin proteccion.

---

## PASO 2 — Dokploy: Cambiar NEXT_PUBLIC_RETURN_URL (CRITICO)

**Donde:** Dokploy → App `imbra-store` → Environment Settings

**Accion:** Modificar el valor de esta variable:

```
# ANTES (pruebas — borrar este valor):
NEXT_PUBLIC_RETURN_URL=https://store.imbra.cloud/checkout/resultado

# DESPUES (produccion — poner este valor):
NEXT_PUBLIC_RETURN_URL=https://imbrarepuestos.com/checkout/resultado
```

**Por que:** Cuando el cliente termina de pagar en PlacetoPay, este servicio redirige al comprador
de vuelta a la tienda usando exactamente esta URL. PlacetoPay esta certificado UNICAMENTE para
el dominio `imbrarepuestos.com`. Si queda apuntando a `store.imbra.cloud`, la sesion de pago
puede quedar en estado invalido y el cliente llegara a una pantalla de error.

**Despues de guardar los dos cambios anteriores:** Reiniciar el contenedor en Dokploy para que
las nuevas variables tomen efecto.

---

## PASO 3 — cPanel: Actualizar URL del Cron

**Donde:** cPanel → Trabajos Cron

**Accion:** Editar el trabajo existente y cambiar el comando por este:

```bash
curl -H "Authorization: Bearer ImbraSecurityCron2026_XyZ" https://imbrarepuestos.com/api/cron/placetopay-probe
```

**Horario actual (mantener igual):** Todos los dias a las 3:00 AM

**Por que:** El cron actualmente llama a `https://imbrarepuestos.com` que en pruebas todavia apunta
al WordPress antiguo, no al headless. Al hacer el cambio de DNS el lunes, el cron quedara
apuntando correctamente al nuevo headless automaticamente. Solo hay que asegurarse de que
la URL sea la definitiva de produccion.

---

## Tabla resumen de cambios

| Variable / Recurso | Estado actual (pruebas) | Estado requerido (produccion) | Donde cambiar |
|---|---|---|---|
| `NEXT_PUBLIC_RETURN_URL` | `store.imbra.cloud/checkout/resultado` | `imbrarepuestos.com/checkout/resultado` | Dokploy |
| `CRON_SECRET` | No existe | `ImbraSecurityCron2026_XyZ` | Dokploy |
| URL del Cron en cPanel | `imbrarepuestos.com` (apunta a WP viejo) | `imbrarepuestos.com` (apuntara al headless) | cPanel |
| PlacetoPay dominio certificado | `imbrarepuestos.com` | `imbrarepuestos.com` | Sin cambios |

---

## Orden de ejecucion el dia del lanzamiento

```
1. Hacer cambios en Dokploy (Pasos 1 y 2)
2. Reiniciar contenedor en Dokploy
3. Apuntar DNS de imbrarepuestos.com al servidor Dokploy
4. Esperar propagacion DNS (15 min a 2 horas)
5. Verificar que https://imbrarepuestos.com carga el headless
6. Actualizar el cron en cPanel (Paso 3)
7. Hacer un pedido de prueba real con PlacetoPay
8. Confirmar que el PDF/correo del pedido llega con Tipo Doc y Numero de Cedula
```

---

## Notas adicionales

- El snippet de WordPress que agrega los campos de cedula ya esta activo en `mkt.imbrarepuestos.com`
- Los metadatos de los campos se guardan con las claves `_billing_tipo_documento` y `_billing_numero_documento`
- El fix de las claves fue commiteado el 2 de abril de 2026 (commit `e8391bd`)
- `SUPABASE_JWT_SECRET` que existe en Dokploy NO es usado por el headless — es interno de Supabase y puede ignorarse

---

*Documento generado el 2 de abril de 2026 — iAnGo*
