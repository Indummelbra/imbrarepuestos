# Guía: Paso a Producción - Certificación PlacetoPay (Evertec)

**Fecha de finalización de certificación:** 25 de Marzo, 2026.
**Estado:** Certificación en pruebas técnicas aprobada. A la espera de credenciales productivas.

---

## 1. Validación Requerida por Evertec

Tras finalizar exitosamente la etapa de certificación técnica (donde se probaron los endpoints, firmas SHA-256, webhooks y sondas), el equipo de integración de PlacetoPay solicitará vía correo electrónico confirmar los ambientes de producción para emitir las credenciales definitivas (`P2P_LOGIN` y `P2P_TRANKEY`).

Evertec exige los siguientes 3 puntos:
1. Conocer la URL pública final del sitio (Producción).
2. Conocer la URL pública final del sistema de alertas (Webhook en Producción).
3. Obtener una **captura de pantalla (evidencia)** comprobando que la Sonda / Cronjob está programada para ejecutarse en el servidor **cada 24 horas**.

---

## 2. Plantilla Oficial de Respuesta a Evertec

Para responderle formalmente al Analista de Implementación (ej: Laura Natalia Forero Torres) y solicitar la liberación a producción, utiliza exactamente esta estructura de correo:

**Asunto:** Re: Certificación - [Nombre de tu Empresa / Imbra]
**Para:** [Correo del analista - ej. laura.forerotorres@evertecinc.com]

> Hola, Laura. ¡Muchas gracias por el acompañamiento durante todo el proceso de certificación!
> 
> A continuación, conforme a lo requerido, remito la información configurada para el paso a Producción:
> 
> **1. URL sitio en producción:**
> `https://[www.tudominio.com]` *(Asegúrate de reemplazar con tu dominio real)*
> 
> **2. URL de notificación (Webhook) en producción:**
> `https://[www.tudominio.com]/api/payments/placetopay/webhook`
> 
> **3. Evidencia de la Sonda (Cronjob):**
> Adjunto a este correo te envío la captura de pantalla de la configuración de nuestro Cronjob de producción, el cual apunta internamente a nuestro endpoint de sonda (`/api/cron/placetopay-probe`) y está programado para ejecutarse religiosamente cada 24 horas (`0 0 * * *`), tal como lo exige el manual técnico.
> 
> Asimismo, te confirmo formalmente que la tarea programada que apuntaba al ambiente de pruebas ya fue inhabilitada y eliminada en nuestra infraestructura.
> 
> Quedo a la espera de las credenciales definitivas de producción (Login y SecretKey) para realizar el pase a vivo.
> 
> ¡Un saludo cordial y feliz día!
> 
> *[Tu Nombre]*
> *[Tu Cargo en Imbra]*

---

## 3. Acciones Internas Antes de Enviar el Correo

Antes de copiar la plantilla y enviar este correo, el equipo de ingeniería/operaciones de Imbra debe:

### A. Preparar las URLs
* Reemplazar `[www.tudominio.com]` por la URL real donde está desplegado el frontend de Next.js (El entorno Headless de Vercel o Dokploy).
* El webhook siempre debe terminar en la ruta `/api/payments/placetopay/webhook`.

### B. Obtener Captura del Cronjob (Sonda)
Toma un pantallazo o captura de pantalla donde demuestres que tu cron (sonda) está automatizado en el servidor cada 24 hrs. Esta evidencia va como adjunto en el correo:
* **Si usas Vercel:** Toma captura de tu archivo `vercel.json` o del panel en la ruta *Settings -> Cron Jobs*, mostrando el scheduler `0 0 * * *` llamando a la ruta `api/cron/placetopay-probe`.
* **Si usas Dokploy/n8n/cPanel:** Toma captura de las tareas programadas (Scheduled Tasks / Cron) mostrando un método GET o cURL apuntando hacia `https://[tudominio]/api/cron/placetopay-probe` en un intervalo diario.

### C. Apagar el Ambiente de Pruebas
Sigue estrictos protocolos de limpieza y desactiva el Cronjob diario que apuntaba al ambiente de pruebas técnico para no generar ruido en los servidores de Evertec y cumplir la exigencia operativa pedida en el correo.

---

## 4. Recepción y Actualización de Credenciales (Siguiente Paso)

Una vez Evertec reciba este correo, habilitarán la cuenta productiva. Te entregarán vía correo o SMS:
* Nuevo entorno (`production`).
* Nuevo Login (`P2P_LOGIN`).
* Nuevo TranKey (`P2P_TRANKEY`).

Deberás ubicar estos nuevos valores y reemplazarlos en tus variables de entorno (`.env.production` / Vercel Env Vars / Dokploy ConfigFiles) y el sistema estará 100% en vivo para recibir pagos reales conectando Headless ↔ WooCommerce ↔ PlacetoPay.
