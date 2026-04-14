# Sistema de Cupones en Checkout - Imbra Store

Este documento detalla la implementación técnica, la lógica de negocio y el diseño de la interfaz de usuario (UI/UX) del sistema de cupones implementado en el checkout headless (Next.js) de Imbra Store.

---

## 1. Arquitectura General y Flujo de Datos

El sistema está diseñado bajo el principio de que **WooCommerce es la única Fuente de Verdad (Source of Truth)**. El frontend no toma decisiones económicas finales, sino que consulta y envía las referencias a WooCommerce quien realiza las matemáticas estrictas, asegurando que la pasarela de pagos (PlacetoPay) procese la transacción con el valor real y protegido.

### Pasos del Flujo:
1. **Validación (Tiempo Real):** Cuando el usuario ingresa un cupón y hace clic en "Aplicar", se lanza una petición contra nuestra API local `/api/coupons/validate`.
2. **Consulta a WooCommerce:** La API local consulta vía la API REST oficial de WooCommerce si ese cupón existe, si está vigente, si tiene cupos y si el subtotal lo permite. No hay cachés.
3. **Cálculo Visual (Simulacro):** Si WooCommerce dice que es válido, retorna el código, el monto y el tipo de descuento (`percent`, `fixed_cart`, `fixed_product`). El frontend *solo dibuja visualmente* cómo quedaría la orden rebajada.
4. **Envío del Checkout (Orden):** Al hacer clic en "Pagar", la web manda los datos del comprador más la etiqueta `coupon_lines: [{ code: 'DINO15' }]` a WooCommerce.
5. **Cálculo Real (Garantía Final):** WooCommerce recibe la orden en estado "Pendiente", busca ese código `DINO15`, lo restaura internamente, aplica el descuento y devuelve un código de Orden y un `total` absolutamente calculado por ellos (ejemplo: El total final es `$45.500`).
6. **Pasarela de Pagos:** Ese `total` de `$45.500` exacto y sin manipular es el que se le inyecta directamente a *PlacetoPay*. Así se evita cualquier posibilidad de fraude o descuadre de inventarios.

---

## 2. Desarrollo a Nivel de Código (Archivos)

### A. Endpoint de Validación (`src/app/api/coupons/validate/route.ts`)
*   Se creó este archivo para proteger las credenciales (`WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`) enviando las consultas al servidor backend y no exponiéndolas al navegador del cliente.
*   **Filtros aplicados (Validaciones de Woo):**
    *   Revisa `status === 'publish'`.
    *   Revisa `date_expires` (que no haya caducado).
    *   Revisa `usage_limit` y `usage_count` (Límite de usos máximos absolutos).
    *   Revisa `minimum_amount` (Para permitir aplicar cupones solo tras ciertos montos).
    *   Revisa `maximum_amount`.

### B. Route de Creación de Orden (`src/app/api/checkout/create-order/route.ts`)
*   Se inyectó en el Payload la propiedad `coupon_lines` para que WooCommerce sepa qué procesar.
*   Se mapeó que en vez de tomar el valor pre-creado de Next.js para enviar a PlacetoPay, tomara como ley suprema el valor final tras la respuesta de WooCommerce (`const wcTotal = parseFloat(orderData.total) || totalFinal;`).

### C. Componente Principal (`src/components/checkout/CheckoutForm.tsx`)
*   **Estado:** Usa de manera limpia el `useState` para código, validación de carga (`couponLoading`), almacenamiento estructurado de la data (`appliedCoupon`), y manejo de errores creativos (`couponError`).
*   **Storage Backup:** Alimenta `sessionStorage` guardando temporalmente `imbra_coupon`. Si el cliente refresca el navegador o se le cae la web en pleno checkout, el cupón sigue activo.
*   **Lógica Modular Universal:** Cuenta con un `switch` para descifrar si el admin hizo un código por **Descuento Fijo (fixed_cart)**, **Porcentaje Directo (percent)**, o **Unidad de Producto (fixed_product)**. 

---

## 3. UI, UX y Copywriting Creativo

La interfaz está dividida en dos ejes para dar claridad al usuario en su interacción.

### Formulario (Input de Cupones)
*   **Localización:** Columna derecha superior del *Resumen Final* de compra.
*   **Diseño:** Contenedor de bordes punteados (inspirando estética de recortes mecánicos) y estructura en MAYÚSCULAS automatizada a nivel form para evitar el error de sensibilidad a las minúsculas por parte de usuarios.
*   **Botón Dinámico:** Cambia de estado: bloqueado, activo, y "VALIDANDO" (con un *spinner* giratorio moderno).

### Sistemas Responsivos de Errores e Interactivos (Copywriting adaptado)

1.  **Estado Falla o Error (ROJO - ⚠️)**
    *   Un cuadro de diálogo de color rojo que evita tecnicismos "Error 400 u Invalid Data".
    *   **Título Creativo:** `"Pilas! Algo no cuadra"`
    *   **Subtexto Explicativo:** Se alimenta directo del error desde WooCommerce (Ej: *"Este código ya expiró"*, o *"Tienes que comprar mínimo $100.000 pesos para este bono"*).

2.  **Estado Validación Correcta (VERDE - 🎉)**
    *   Un cuadro verde que confirma e inspira continuidad a pagar rápido.
    *   **Título Creativo:** `"Felicidades! Tu descuento esta activo"`
    *   **Desglose Visivo:** *"Cupón DINO15 aplicado"* con su desglose exacto (Ej: *Descuento del 15% = -$100.000 de descuento*).
    *   **Control del Usuario:** Al lado del contenedor, aparece una opción visual (equis) para remover el descuento de forma interactiva si el cliente decide que, por error, quiere arrepentirse.

---

## 4. Conexión de Porcentajes Dinámicos desde WP/WooCommerce

*   **Problema de Configuración Inicial:** Durante el desarrollo, notamos que WooCommerce descontaba un valor de $15 pesos, no 15%.
*   **La Causa:** En WordPress, el campo base estaba puesto como `fixed_cart`.
*   **La Solución:** Tras actualizar la variable por API (o haciéndolo en la UI clásica de WP seleccionando: *"Tipo de descuento" -> "Porcentaje de descuento"*), nuestro sistema de TypeSafe de `CheckoutForm.tsx` inmediatamente calcula el `Math.round(totalPrice * (appliedCoupon.amount / 100))`. No hizo falta codificar nada "parchado", ya que React sabe leer exactamente la naturaleza del cupón según WooCommerce asigne la configuración de dicho descuento.
