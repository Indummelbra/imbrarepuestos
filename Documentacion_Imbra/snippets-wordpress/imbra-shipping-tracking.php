<?php
/**
 * IMBRA Store — Shipping Tracking (versión ligera)
 * ================================================
 * Solo actúa cuando el staff de bodega abre/guarda un pedido en el admin.
 * Cero impacto en requests del frontend ni de PlaceToPay.
 *
 * Hooks activos:
 *   - add_meta_boxes                          → meta box en el pedido (admin)
 *   - woocommerce_update_order (HPOS)         → guardar al actualizar
 *   - woocommerce_process_shop_order_meta     → guardar en legacy
 *
 * Hooks eliminados (eran los problemáticos):
 *   - woocommerce_rest_prepare_shop_order_object  ← corría en CADA llamada REST
 *   - woocommerce_email_order_meta                ← innecesario ahora
 *   - woocommerce_shop_order_search_fields        ← opcional, agregar luego
 *
 * El frontend lee los campos directamente desde meta_data[] de WooCommerce REST API.
 * Ver: src/app/actions/order-actions.ts → getMeta(meta, '_imbra_shipping_carrier')
 *
 * INSTALACIÓN:
 *   Code Snippets plugin → pegar este código → guardar
 *   (un único snippet, sin duplicados)
 *
 * @version 2.0.0 — versión ligera sin filtros REST
 */

if ( ! defined( 'ABSPATH' ) ) exit;


// ═══════════════════════════════════════════════════════════════════
// 1. TRANSPORTADORAS
// ═══════════════════════════════════════════════════════════════════

function imbra_get_carriers(): array {
    return [
        ''                => '— Seleccionar transportadora —',
        'servientrega'    => 'Servientrega',
        'interrapidisimo' => 'Interrapidísimo',
        'coordinadora'    => 'Coordinadora',
        'envia'           => 'Envía',
        'tcc'             => 'TCC',
        'deprisa'         => 'Deprisa',
        '472'             => '472 · Correos de Colombia',
        'domina'          => 'Domina',
        'mensajeros'      => 'Mensajeros Urbanos',
        'suppla'          => 'Suppla',
        'otra'            => 'Otra transportadora',
    ];
}


// ═══════════════════════════════════════════════════════════════════
// 2. META BOX EN EL PEDIDO (solo admin)
// ═══════════════════════════════════════════════════════════════════

add_action( 'add_meta_boxes', function () {
    $args = [
        'id'       => 'imbra_shipping_info',
        'title'    => '🚚 Envío — Transportadora & Guía',
        'callback' => 'imbra_shipping_meta_box_html',
        'priority' => 'default',
        'context'  => 'side',
    ];

    // HPOS (WooCommerce 8+)
    add_meta_box(
        $args['id'], $args['title'], $args['callback'],
        'woocommerce_page_wc-orders',
        $args['context'], $args['priority']
    );

    // Legacy
    add_meta_box(
        $args['id'], $args['title'], $args['callback'],
        'shop_order',
        $args['context'], $args['priority']
    );
} );

function imbra_shipping_meta_box_html( $post_or_order ): void {
    $order = ( $post_or_order instanceof WC_Order )
        ? $post_or_order
        : wc_get_order( $post_or_order->ID );

    if ( ! $order ) return;

    $carrier  = (string) $order->get_meta( '_imbra_shipping_carrier' );
    $guide    = (string) $order->get_meta( '_imbra_shipping_guide' );
    $carriers = imbra_get_carriers();

    wp_nonce_field( 'imbra_save_shipping_info', 'imbra_shipping_nonce' );
    ?>

    <style>
        #imbra_shipping_info .imbra-f { margin-bottom: 12px; }
        #imbra_shipping_info label { display: block; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px; color: #444; }
        #imbra_shipping_info select,
        #imbra_shipping_info input[type=text] { width: 100%; padding: 7px 9px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; color: #1e1e1e; background: #fafafa; }
        #imbra_shipping_info select:focus,
        #imbra_shipping_info input:focus { border-color: #F18700; outline: none; box-shadow: 0 0 0 2px rgba(241,135,0,.18); }
        .imbra-active-guide { margin-top: 10px; padding: 9px 11px; background: #fff8ee; border: 1px solid #F18700; border-radius: 5px; font-size: 12px; line-height: 1.5; }
        .imbra-active-guide strong { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: #F18700; margin-bottom: 3px; }
    </style>

    <div class="imbra-f">
        <label for="imbra_shipping_carrier">Transportadora</label>
        <select name="imbra_shipping_carrier" id="imbra_shipping_carrier">
            <?php foreach ( $carriers as $value => $label ) : ?>
                <option value="<?= esc_attr( $value ) ?>" <?= selected( $carrier, $value, false ) ?>>
                    <?= esc_html( $label ) ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>

    <div class="imbra-f">
        <label for="imbra_shipping_guide">Número de Guía</label>
        <input
            type="text"
            name="imbra_shipping_guide"
            id="imbra_shipping_guide"
            value="<?= esc_attr( $guide ) ?>"
            placeholder="Ej: 9010234567890"
            autocomplete="off"
        />
    </div>

    <?php if ( $carrier && $guide ) : ?>
        <div class="imbra-active-guide">
            <strong>✅ Guía registrada</strong>
            <span><?= esc_html( $carriers[ $carrier ] ?? $carrier ) ?></span><br>
            <code style="font-size:13px;font-weight:700;"><?= esc_html( $guide ) ?></code>
        </div>
    <?php endif;
}


// ═══════════════════════════════════════════════════════════════════
// 3. GUARDAR AL ACTUALIZAR EL PEDIDO
// ═══════════════════════════════════════════════════════════════════

add_action( 'woocommerce_update_order',            'imbra_save_shipping_info' ); // HPOS
add_action( 'woocommerce_process_shop_order_meta', 'imbra_save_shipping_info' ); // Legacy

function imbra_save_shipping_info( int $order_id ): void {
    if ( empty( $_POST['imbra_shipping_nonce'] ) ) return;
    if ( ! wp_verify_nonce( $_POST['imbra_shipping_nonce'], 'imbra_save_shipping_info' ) ) return;
    if ( ! current_user_can( 'edit_shop_orders' ) ) return;

    $order = wc_get_order( $order_id );
    if ( ! $order ) return;

    $carriers    = imbra_get_carriers();
    $raw_carrier = sanitize_text_field( $_POST['imbra_shipping_carrier'] ?? '' );
    $raw_guide   = sanitize_text_field( $_POST['imbra_shipping_guide']   ?? '' );

    $carrier = array_key_exists( $raw_carrier, $carriers ) ? $raw_carrier : '';
    $guide   = strtoupper( preg_replace( '/[^A-Za-z0-9\-]/', '', $raw_guide ) );

    $order->update_meta_data( '_imbra_shipping_carrier', $carrier );
    $order->update_meta_data( '_imbra_shipping_guide',   $guide   );
    $order->save();
}
