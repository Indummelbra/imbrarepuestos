<?php
/**
 * IMBRA STORE — Hero Slides
 * ─────────────────────────────────────────────────────────────────────────────
 * Pega este código en functions.php de tu tema hijo (o en un plugin custom).
 *
 * CÓMO USAR EN WORDPRESS:
 *  1. Pega el código en Apariencia → Editor de temas → functions.php
 *  2. Guarda. Aparecerá "Hero Slides" en el menú lateral de WP.
 *  3. Crea un nuevo Slide:
 *     - TÍTULO          → Título principal del slide
 *     - EXTRACTO        → Subtítulo / texto descriptivo
 *     - IMAGEN DEST.    → Imagen de fondo del slide (columna derecha)
 *     - CAMPOS IMBRA    → Panel con todos los campos del slide
 *     - ORDEN           → Número de posición (1, 2, 3…) en "Atributos de entrada"
 *  4. Publica el slide. ¡Listo! Se refleja en el sitio automáticamente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// 1. Registrar el Custom Post Type
add_action( 'init', function () {

    register_post_type( 'hero_slide', [
        'labels'        => [
            'name'               => 'Hero Slides',
            'singular_name'      => 'Slide',
            'add_new'            => 'Agregar Slide',
            'add_new_item'       => 'Agregar nuevo Slide',
            'edit_item'          => 'Editar Slide',
            'new_item'           => 'Nuevo Slide',
            'view_item'          => 'Ver Slide',
            'search_items'       => 'Buscar Slides',
            'not_found'          => 'No se encontraron slides',
            'not_found_in_trash' => 'No hay slides en la papelera',
        ],
        'public'        => false,
        'show_ui'       => true,
        'show_in_rest'  => true,
        'rest_base'     => 'hero_slide',
        'supports'      => [ 'title', 'excerpt', 'thumbnail', 'page-attributes' ],
        'menu_icon'     => 'dashicons-images-alt2',
        'menu_position' => 5,
    ] );

    // Registrar meta fields para el REST API
    $fields = [ 'slide_label', 'slide_cta_text', 'slide_cta_url', 'slide_note' ];
    foreach ( $fields as $key ) {
        register_post_meta( 'hero_slide', $key, [
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => 'string',
            'auth_callback' => fn() => current_user_can( 'edit_posts' ),
        ] );
    }
} );

// 2. Agregar el meta box con los campos del slide
add_action( 'add_meta_boxes', function () {
    add_meta_box(
        'imbra_slide_fields',
        '⚙️ Campos del Slide (IMBRA Store)',
        'imbra_slide_meta_box_html',
        'hero_slide',
        'normal',
        'high'
    );
} );

function imbra_slide_meta_box_html( $post ) {
    wp_nonce_field( 'imbra_slide_save', 'imbra_slide_nonce' );

    $label    = get_post_meta( $post->ID, 'slide_label',    true );
    $cta_text = get_post_meta( $post->ID, 'slide_cta_text', true );
    $cta_url  = get_post_meta( $post->ID, 'slide_cta_url',  true );
    $note     = get_post_meta( $post->ID, 'slide_note',     true );

    $style_label = 'font-weight:600;display:block;margin-bottom:4px;margin-top:14px;font-size:13px;';
    $style_input = 'width:100%;padding:6px 8px;border:1px solid #ccc;border-radius:3px;font-size:14px;box-sizing:border-box;';
    $style_hint  = 'color:#888;font-size:11px;margin-top:3px;';
    ?>
    <div style="padding:4px 0">

        <label style="<?= $style_label ?>">🏷️ Etiqueta superior</label>
        <input type="text" name="slide_label" value="<?= esc_attr( $label ) ?>"
               placeholder="ej: ⚡ DIRECTO DEL FABRICANTE"
               style="<?= $style_input ?>" />
        <p style="<?= $style_hint ?>">Texto pequeño naranja que aparece sobre el título.</p>

        <label style="<?= $style_label ?>">🔘 Texto del botón CTA</label>
        <input type="text" name="slide_cta_text" value="<?= esc_attr( $cta_text ) ?>"
               placeholder="ej: VER KIT Y PRECIO"
               style="<?= $style_input ?>" />

        <label style="<?= $style_label ?>">🔗 URL del botón CTA</label>
        <input type="text" name="slide_cta_url" value="<?= esc_attr( $cta_url ) ?>"
               placeholder="ej: /tienda  o  https://imbrastore.com/tienda"
               style="<?= $style_input ?>" />
        <p style="<?= $style_hint ?>">Puede ser una ruta relativa (/tienda) o URL completa.</p>

        <label style="<?= $style_label ?>">📝 Nota pequeña (opcional)</label>
        <input type="text" name="slide_note" value="<?= esc_attr( $note ) ?>"
               placeholder="ej: VÁLIDO HASTA EL 31/12/2025"
               style="<?= $style_input ?>" />
        <p style="<?= $style_hint ?>">Texto pequeño que aparece al lado del botón. Dejar vacío para ocultar.</p>

        <hr style="margin-top:16px;border:none;border-top:1px solid #eee;" />
        <p style="color:#555;font-size:12px;margin:8px 0 0;">
            <strong>Recuerda:</strong> el <strong>Título</strong> y el <strong>Extracto</strong> se editan arriba.
            La <strong>Imagen de fondo</strong> se configura en "Imagen destacada" (columna derecha).
            El <strong>Orden</strong> de aparición se define en "Atributos de entrada" → Orden.
        </p>
    </div>
    <?php
}

// 3. Guardar los campos al publicar / actualizar
add_action( 'save_post_hero_slide', function ( $post_id ) {
    if ( ! isset( $_POST['imbra_slide_nonce'] ) ) return;
    if ( ! wp_verify_nonce( $_POST['imbra_slide_nonce'], 'imbra_slide_save' ) ) return;
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;

    $fields = [ 'slide_label', 'slide_cta_text', 'slide_cta_url', 'slide_note' ];
    foreach ( $fields as $key ) {
        if ( isset( $_POST[ $key ] ) ) {
            update_post_meta( $post_id, $key, sanitize_text_field( $_POST[ $key ] ) );
        }
    }
} );
