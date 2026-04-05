<?php
/**
 * IMBRA Store — Información de Envío por Pedido
 * ================================================
 * Agrega al panel de administración de WooCommerce:
 *   • Dropdown para seleccionar la transportadora colombiana
 *   • Campo de texto para el número de guía
 *
 * Los datos quedan disponibles en la REST API de WooCommerce
 * para ser consumidos por la tienda headless Next.js.
 *
 * INSTALACIÓN:
 *   Opción A) Code Snippets plugin → pegar este código → guardar
 *   Opción B) functions.php del tema hijo → pegar al final
 *
 * Compatible con WooCommerce HPOS (High Performance Order Storage)
 * y con el sistema de pedidos legacy (shop_order post type).
 *
 * @author  iAnGo / Gustavo Vargas
 * @version 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


// ═══════════════════════════════════════════════════════════════════
// 1. LISTA DE TRANSPORTADORAS COLOMBIANAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Devuelve el array de transportadoras: slug => nombre.
 * Agregar o quitar según necesidad del negocio.
 */
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
// 2. REGISTRAR META BOX EN LA PANTALLA DE EDICIÓN DEL PEDIDO
// ═══════════════════════════════════════════════════════════════════

add_action( 'add_meta_boxes', function () {

    $args = [
        'id'       => 'imbra_shipping_info',
        'title'    => '🚚 Envío — Transportadora & Guía',
        'callback' => 'imbra_shipping_meta_box_html',
        'priority' => 'default',
        'context'  => 'side',
    ];

    // HPOS (nueva arquitectura WooCommerce 8+)
    add_meta_box(
        $args['id'], $args['title'], $args['callback'],
        'woocommerce_page_wc-orders',
        $args['context'], $args['priority']
    );

    // Legacy (shop_order post type)
    add_meta_box(
        $args['id'], $args['title'], $args['callback'],
        'shop_order',
        $args['context'], $args['priority']
    );
} );


// ═══════════════════════════════════════════════════════════════════
// 3. HTML DEL META BOX
// ═══════════════════════════════════════════════════════════════════

function imbra_shipping_meta_box_html( $post_or_order ): void {

    // Compatible con HPOS (recibe WC_Order) y legacy (recibe WP_Post)
    $order = ( $post_or_order instanceof WC_Order )
        ? $post_or_order
        : wc_get_order( $post_or_order->ID );

    if ( ! $order ) {
        return;
    }

    $carrier  = (string) $order->get_meta( '_imbra_shipping_carrier' );
    $guide    = (string) $order->get_meta( '_imbra_shipping_guide' );
    $carriers = imbra_get_carriers();

    wp_nonce_field( 'imbra_save_shipping_info', 'imbra_shipping_nonce' );
    ?>

    <style>
        #imbra_shipping_info .imbra-f       { margin-bottom: 12px; }
        #imbra_shipping_info label          { display: block; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px; color: #444; }
        #imbra_shipping_info select,
        #imbra_shipping_info input[type=text] {
            width: 100%; padding: 7px 9px;
            border: 1px solid #ddd; border-radius: 4px;
            font-size: 13px; color: #1e1e1e;
            background: #fafafa;
        }
        #imbra_shipping_info select:focus,
        #imbra_shipping_info input:focus {
            border-color: #F18700; outline: none;
            box-shadow: 0 0 0 2px rgba(241,135,0,.18);
        }
        .imbra-active-guide {
            margin-top: 10px; padding: 9px 11px;
            background: #fff8ee; border: 1px solid #F18700;
            border-radius: 5px; font-size: 12px; line-height: 1.5;
        }
        .imbra-active-guide strong {
            display: block; font-size: 10px; text-transform: uppercase;
            letter-spacing: .08em; color: #F18700; margin-bottom: 3px;
        }
    </style>

    <div class="imbra-f">
        <label for="imbra_shipping_carrier">Transportadora</label>
        <select name="imbra_shipping_carrier" id="imbra_shipping_carrier">
            <?php foreach ( $carriers as $value => $label ) : ?>
                <option value="<?= esc_attr( $value ) ?>"
                    <?= selected( $carrier, $value, false ) ?>>
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
// 4. GUARDAR LOS DATOS AL ACTUALIZAR EL PEDIDO
// ═══════════════════════════════════════════════════════════════════

// HPOS
add_action( 'woocommerce_update_order', 'imbra_save_shipping_info' );
// Legacy
add_action( 'woocommerce_process_shop_order_meta', 'imbra_save_shipping_info' );

function imbra_save_shipping_info( int $order_id ): void {

    // Verificar nonce y permisos
    if ( empty( $_POST['imbra_shipping_nonce'] ) ) {
        return;
    }
    if ( ! wp_verify_nonce( $_POST['imbra_shipping_nonce'], 'imbra_save_shipping_info' ) ) {
        return;
    }
    if ( ! current_user_can( 'edit_shop_orders' ) ) {
        return;
    }

    $order = wc_get_order( $order_id );
    if ( ! $order ) {
        return;
    }

    $carriers      = imbra_get_carriers();
    $raw_carrier   = sanitize_text_field( $_POST['imbra_shipping_carrier'] ?? '' );
    $raw_guide     = sanitize_text_field( $_POST['imbra_shipping_guide']   ?? '' );

    // Solo guardar transportadoras válidas del listado
    $carrier = array_key_exists( $raw_carrier, $carriers ) ? $raw_carrier : '';
    $guide   = strtoupper( preg_replace( '/[^A-Za-z0-9\-]/', '', $raw_guide ) );

    $order->update_meta_data( '_imbra_shipping_carrier', $carrier );
    $order->update_meta_data( '_imbra_shipping_guide',   $guide   );
    $order->save();
}


// ═══════════════════════════════════════════════════════════════════
// 5. EXPONER EN LA REST API DE WOOCOMMERCE
//    → Los campos quedan como propiedades de primer nivel en la
//      respuesta JSON, listos para consumir desde Next.js.
// ═══════════════════════════════════════════════════════════════════

add_filter( 'woocommerce_rest_prepare_shop_order_object', 'imbra_inject_shipping_into_rest', 10, 3 );

function imbra_inject_shipping_into_rest( $response, WC_Order $order, $request ) {

    $data = $response->get_data();

    $data['imbra_shipping_carrier'] = (string) $order->get_meta( '_imbra_shipping_carrier' );
    $data['imbra_shipping_guide']   = (string) $order->get_meta( '_imbra_shipping_guide'   );

    $response->set_data( $data );
    return $response;
}
