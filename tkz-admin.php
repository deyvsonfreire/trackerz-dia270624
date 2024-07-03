<?php
// Impede o acesso direto ao arquivo
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Função para adicionar a página de configurações ao menu do WordPress
function tkz_admin_menu() {
    add_options_page(
        __( 'Configurações do Trackerz', 'trackerz' ),
        __( 'Trackerz', 'trackerz' ),
        'manage_options',
        TKZ_PREFIX . 'settings_page',
        'tkz_settings_page'
    );
}
add_action( 'admin_menu', 'tkz_admin_menu' );

// Função para renderizar a página de configurações
function tkz_settings_page() {
    // Verifica se o usuário tem permissão para acessar a página
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    ?>
    <div class="wrap">
        <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
        <form action="options.php" method="post">
            <?php
            // Exibe as seções e os campos de configuração
            settings_fields( TKZ_PREFIX . 'settings_group' );
            do_settings_sections( TKZ_PREFIX . 'settings_page' );
            submit_button();
            ?>
        </form>
    </div>
    <?php
}