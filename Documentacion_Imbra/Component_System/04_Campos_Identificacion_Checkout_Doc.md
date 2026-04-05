# Campos de Identificación en el Checkout Headless
## Tipo de Documento y Número de Identificación

---

## ¿Qué hace este sistema?

El checkout de Next.js captura el **Tipo de Documento** (CC, NIT, CE, TI, PPN) y el **Número de Identificación** del cliente y los envía a WooCommerce al crear el pedido. Desde WooCommerce, n8n los lee para sincronizar con SAP.

---

## Flujo completo

```
Cliente llena el checkout en Next.js
        ↓
CheckoutForm.tsx captura:
  - formData.documentType  (CC, NIT, CE, TI, PPN)
  - formData.dni           (número sin puntos ni guiones)
        ↓
POST /api/checkout/create-order → WooCommerce REST API
meta_data: [
  { key: "billing_numero_documento", value: "1234567890" },
  { key: "billing_tipo_documento",   value: "CC" }
]
        ↓
WooCommerce almacena en meta_data del pedido (SIN prefijo _)
        ↓
┌─────────────────────────────────────────────┐
│  n8n SW5 lee: billing_numero_documento ✅   │
│  WP Admin muestra: Tipo Doc + Número ID ✅  │
│  Correos WC incluyen: ambos campos ✅       │
└─────────────────────────────────────────────┘
```

---

## Claves exactas usadas

| Sistema | Clave | Valor ejemplo |
|---|---|---|
| Next.js envía | `billing_numero_documento` | `1234567890` |
| Next.js envía | `billing_tipo_documento` | `CC` |
| WooCommerce almacena | `billing_numero_documento` | igual |
| n8n SW5 busca (orden) | `_billing_numero_documento` → `billing_numero_documento` ✅ → `numero_documento` | encuentra en posición 2 |

> **CRÍTICO:** La clave es `billing_numero_documento` SIN guión bajo al inicio.  
> El snippet de WP y el código de Next.js usan exactamente esta clave.  
> N8n tiene fallback y la encuentra en segundo intento.

---

## Snippet de WordPress (Code Snippets)

Instalado en `mkt.imbrarepuestos.com/wp-admin` → Code Snippets.

**Nombre del snippet:** `Imbra Headless — Campos Identificación`

```php
/**
 * SNIPPET: Campos de Identificación — Imbra Headless Store
 * Solo muestra en admin y correos. El checkout es headless (Next.js).
 * Las claves van SIN prefijo _ para coincidir con lo que envía Next.js.
 */

// Mostrar en el Administrador de Pedidos WooCommerce
add_action( 'woocommerce_admin_order_data_after_billing_address', 'imbra_display_legal_fields_admin', 10, 1 );
function imbra_display_legal_fields_admin( $order ) {
    $tipo   = get_post_meta( $order->get_id(), 'billing_tipo_documento', true );
    $numero = get_post_meta( $order->get_id(), 'billing_numero_documento', true );
    if ( $tipo )   echo '<p><strong>Tipo Doc:</strong> '   . esc_html( $tipo )   . '</p>';
    if ( $numero ) echo '<p><strong>Número ID:</strong> ' . esc_html( $numero ) . '</p>';
}

// Incluir en correos automáticos de WooCommerce
add_filter( 'woocommerce_email_order_meta_keys', 'imbra_add_legal_fields_email' );
function imbra_add_legal_fields_email( $keys ) {
    $keys['Tipo de Documento']        = 'billing_tipo_documento';
    $keys['Número de Identificación'] = 'billing_numero_documento';
    return $keys;
}
```

**Lo que hace:**
- `imbra_display_legal_fields_admin` → muestra Tipo Doc y Número ID debajo de la dirección de facturación en cada pedido del admin WooCommerce
- `imbra_add_legal_fields_email` → los incluye en los correos automáticos (nuevo pedido, pedido completado, etc.)

**Lo que NO hace:** No agrega campos al checkout de WooCommerce (innecesario — el checkout es Next.js).

---

## Archivos de Next.js involucrados

| Archivo | Líneas | Qué hace |
|---|---|---|
| `src/components/checkout/CheckoutForm.tsx` | 361-362 | Envía los campos en meta_data al crear el pedido |
| `src/app/actions/order-actions.ts` | 113 | Lee `billing_numero_documento` para verificar pedidos del cliente |

---

## Compatibilidad con n8n (SW5 — Clientes)

El workflow SW5 de n8n busca el número de documento en este orden dentro de `meta_data`:
1. `_billing_numero_documento` → no existe (Next.js no pone el `_`)
2. `billing_numero_documento` → ✅ **encontrado aquí**
3. `numero_documento` → fallback, no llega aquí

**No se requiere ningún cambio en n8n.** El workflow sigue funcionando exactamente igual.

### Campos que n8n lee del pedido y que no deben cambiar nunca

| Campo WooCommerce | Usado en | No cambiar |
|---|---|---|
| `billing.first_name` | SW5 → Customer_FirstName | ✅ estándar WC |
| `billing.last_name` | SW5 → Customer_LastName | ✅ estándar WC |
| `billing.email` | SW5 → Customer_Email | ✅ estándar WC |
| `billing.phone` | SW5 → Customer_Phone | ✅ estándar WC |
| `billing.address_1` | SW5 → Customer_Address | ✅ estándar WC |
| `billing.city` | SW5 → Customer_City | ✅ estándar WC |
| `meta_data[billing_numero_documento]` | SW5 → RUT cliente | ✅ clave fija |
| `line_items[].sku` | SW6 → ItemCode SAP | ✅ viene de WC producto |
| `order.status` | SW5 → filtro | ✅ estándar WC |
