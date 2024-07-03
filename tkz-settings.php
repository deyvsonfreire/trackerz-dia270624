<?php
// Impede o acesso direto ao arquivo
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Função para registrar as configurações do plugin
function tkz_register_settings() {
    // Registra a seção de configurações gerais
    add_settings_section(
        TKZ_PREFIX . 'general_settings_section',
        __( 'Configurações Gerais', 'trackerz' ),
        'tkz_settings_section_callback',
        TKZ_PREFIX . 'settings_page'
    );

    // --- Campos de Configuração ---

    // Domínio
    add_settings_field(
        TKZ_PREFIX . 'domain',
        __( 'Domínio', 'trackerz' ),
        'tkz_render_settings_field',
        TKZ_PREFIX . 'settings_page',
        TKZ_PREFIX . 'general_settings_section',
        array(
            'type' => 'text',
            'name' => TKZ_PREFIX . 'domain',
            'description' => __( 'Informe o domínio principal do seu site (ex: exemplo.com).', 'trackerz' ),
        )
    );

    // Facebook Pixel ID
    add_settings_field(
        TKZ_PREFIX . 'fb_pixel',
        __( 'Facebook Pixel ID', 'trackerz' ),
        'tkz_render_settings_field',
        TKZ_PREFIX . 'settings_page',
        TKZ_PREFIX . 'general_settings_section',
        array(
            'type' => 'text',
            'name' => TKZ_PREFIX . 'fb_pixel',
            'description' => __( 'Informe o ID do seu Facebook Pixel.', 'trackerz' ),
        )
    );

    // Facebook API Token
    add_settings_field(
        TKZ_PREFIX . 'fb_api_token',
        __( 'Facebook API Token', 'trackerz' ),
        'tkz_render_settings_field',
        TKZ_PREFIX . 'settings_page',
        TKZ_PREFIX . 'general_settings_section',
        array(
            'type' => 'text',
            'name' => TKZ_PREFIX . 'fb_api_token',
            'description' => __( 'Informe o token de acesso da API do Facebook.', 'trackerz' ),
        )
    );

    // --- Fim dos Campos de Configuração ---

    // Registra o grupo de configurações
    register_setting(
        TKZ_PREFIX . 'settings_group',
        TKZ_PREFIX . 'settings',
        'tkz_sanitize_settings'
    );
}
add_action( 'admin_init', 'tkz_register_settings' );

// Função de callback para a descrição da seção de configurações
function tkz_settings_section_callback() {
    echo '<p>' . __( 'Configure as opções gerais do plugin Trackerz.', 'trackerz' ) . '</p>';
}

// Função para renderizar os campos de configuração
function tkz_render_settings_field( $args ) {
    // Obtém o valor atual da opção
    $options = get_option( TKZ_PREFIX . 'settings' );
    $value = isset( $options[ $args['name'] ] ) ? $options[ $args['name'] ] : '';

    // Renderiza o campo de acordo com o tipo
    switch ( $args['type'] ) {
        case 'text':
        case 'url':
            echo '<input type="' . esc_attr( $args['type'] ) . '" id="' . esc_attr( $args['name'] ) . '" name="' . esc_attr( $args['name'] ) . '" value="' . esc_attr( $value ) . '" class="regular-text">';
            break;
        case 'checkbox':
            echo '<input type="checkbox" id="' . esc_attr( $args['name'] ) . '" name="' . esc_attr( $args['name'] ) . '" value="1" ' . checked( 1, $value, false ) . '>';
            break;
    }

    // Exibe a descrição do campo
    if ( isset( $args['description'] ) ) {
        echo '<p class="description">' . esc_html( $args['description'] ) . '</p>';
    }
}

// Função para sanitizar as configurações
function tkz_sanitize_settings( $input ) {
    $sanitized_input = array();

    // Define valores padrão para as configurações
    $sanitized_input[TKZ_PREFIX . 'domain'] = isset( $input[TKZ_PREFIX . 'domain'] ) ? sanitize_text_field( $input[TKZ_PREFIX . 'domain'] ) : 'seu_dominio.com';
    $sanitized_input[TKZ_PREFIX . 'fb_pixel'] = isset( $input[TKZ_PREFIX . 'fb_pixel'] ) ? sanitize_text_field( $input[TKZ_PREFIX . 'fb_pixel'] ) : '';
    $sanitized_input[TKZ_PREFIX . 'fb_api_token'] = isset( $input[TKZ_PREFIX . 'fb_api_token'] ) ? sanitize_text_field( $input[TKZ_PREFIX . 'fb_api_token'] ) : '';
    $sanitized_input[TKZ_PREFIX . 'fb_js'] = 'https://connect.facebook.net/en_US/fbevents.js';
    $sanitized_input[TKZ_PREFIX . 'phone_mask'] = '(99) 99999-9999';
    $sanitized_input[TKZ_PREFIX . 'phone_mask_js'] = 'https://unpkg.com/imask';
    $sanitized_input[TKZ_PREFIX . 'phone_valid'] = 1;
    $sanitized_input[TKZ_PREFIX . 'phone_update'] = 1;
    $sanitized_input[TKZ_PREFIX . 'phone_country'] = '55';
    $sanitized_input[TKZ_PREFIX . 'phone_mask_inter'] = 1;
    $sanitized_input[TKZ_PREFIX . 'phone_mask_inter_css'] = 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css';
    $sanitized_input[TKZ_PREFIX . 'phone_mask_inter_js'] = 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js';
    $sanitized_input[TKZ_PREFIX . 'web_priority'] = 1;
    $sanitized_input[TKZ_PREFIX . 'input_custom_phone'] = 'telefone,celular,whatsapp';
    $sanitized_input[TKZ_PREFIX . 'input_custom_email'] = 'email,e-mail,correio_eletronico';
    $sanitized_input[TKZ_PREFIX . 'input_custom_name'] = 'nome,nome_completo,full_name';
    

    return $sanitized_input;
}