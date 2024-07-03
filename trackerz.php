<?php
/*
Plugin Name: Trackerz
Plugin URI: https://trackerz.app
Description: Plugin de rastreamento e coleta de dados.
Version: 2.0.0
Author: Deyvson
Author URI: https://deyvson.com.br
*/

// Impede o acesso direto ao arquivo
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define o prefixo do plugin
define( 'TKZ_PREFIX', 'tkz_' );

// Inclui os arquivos necessários
require_once plugin_dir_path( __FILE__ ) . 'tkz-settings.php';
require_once plugin_dir_path( __FILE__ ) . 'tkz-admin.php';
require_once plugin_dir_path( __FILE__ ) . 'trackerz-db.php';
require_once plugin_dir_path( __FILE__ ) . 'trackerz-api.php';
require_once plugin_dir_path( __FILE__ ) . 'trackerz-functions.php';

// Função de ativação do plugin
function trackerz_activate() {
    trackerz_create_tables();
}
register_activation_hook( __FILE__, 'trackerz_activate' );

// Função de desativação do plugin
function trackerz_deactivate() {
    // Ações a serem executadas na desativação (opcional)
}
register_deactivation_hook( __FILE__, 'trackerz_deactivate' );

// Enfileira os scripts e estilos
function trackerz_enqueue_scripts() {
    // Obtém as configurações do plugin
    $options = get_option( TKZ_PREFIX . 'settings' );

    // Define as configurações do plugin como variáveis JavaScript
    $tkz_config = array(
        'domain'          => $options['domain'],
        'api_lead'        => rest_url( 'trackerz/v1/lead' ),
        'api_event'       => rest_url( 'trackerz/v1/event' ),
        'fb_pixel'        => $options['fb_pixel'],
        'fb_js'           => $options['fb_js'],
        'fb_api_token'    => $options['fb_api_token'],
        'phone_mask'      => $options['phone_mask'],
        'phone_mask_js'   => $options['phone_mask_js'],
        'phone_valid'     => $options['phone_valid'],
        'phone_update'    => $options['phone_update'],
        'phone_country'   => $options['phone_country'],
        'phone_mask_inter' => $options['phone_mask_inter'],
        'phone_mask_inter_css' => $options['phone_mask_inter_css'],
        'phone_mask_inter_js' => $options['phone_mask_inter_js'],
        'web_priority'    => $options['web_priority'],
        'input_custom_phone' => $options['input_custom_phone'],
        'input_custom_email' => $options['input_custom_email'],
        'input_custom_name' => $options['input_custom_name'],
    );

    // Passa as configurações para o script principal
    wp_localize_script( TKZ_PREFIX . 'script', 'tkz_config', $tkz_config );

    // Registra o script principal do Trackerz
    wp_register_script(
        TKZ_PREFIX . 'script', 
        plugins_url( 'assets/js/trackerz.js', __FILE__ ), 
        array(), 
        '2.0.0', 
        true 
    );

    // Define o atributo type="module" para o script trackerz.js (compatível com versões antigas)
    ?>
    <script>
        var tkzScript = document.createElement('script');
        tkzScript.setAttribute('type', 'module');
        tkzScript.setAttribute('src', '<?php echo plugins_url( 'assets/js/trackerz.js', __FILE__ ); ?>');
        document.head.appendChild(tkzScript);
    </script>
    <?php
}
add_action( 'wp_enqueue_scripts', 'trackerz_enqueue_scripts' );

// Adiciona código ao rodapé do site
function trackerz_add_footer_scripts() {
    ?>
    <script type="module">
        document.addEventListener('DOMContentLoaded', function() {
            const tkz_page_id = document.querySelector('body').getAttribute('data-post-id');
            const tkz_page_name = document.querySelector('title').textContent;

            // Adiciona as variáveis da página ao objeto de configuração global
            window.tkz_config.page_id = tkz_page_id;
            window.tkz_config.page_title = tkz_page_name;

            // Inicia o script Trackerz
            if (typeof Trackerz !== 'undefined') {
                const trackerz = new Trackerz(window.tkz_config);
                trackerz.init();
            } else {
                console.error('A classe Trackerz não está definida.');
            }
        });
    </script>
    <?php
}
add_action( 'wp_footer', 'trackerz_add_footer_scripts' );