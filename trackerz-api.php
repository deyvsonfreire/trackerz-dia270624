<?php
// Impede o acesso direto ao arquivo
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Função para registrar as rotas da API REST
function trackerz_register_routes() {
    // Rota para salvar dados da sessão
    register_rest_route( 'trackerz/v1', '/save-session-data', array(
        'methods'  => 'POST',
        'callback' => 'trackerz_save_session_data',
        'permission_callback' => function () {
            // Verifica se a requisição veio do próprio domínio
            return $_SERVER['REMOTE_ADDR'] === $_SERVER['SERVER_ADDR'];
        }
    ));

    // Rota para salvar dados do lead
    register_rest_route( 'trackerz/v1', '/lead', array(
        'methods'  => 'POST',
        'callback' => 'trackerz_save_lead_data',
        'permission_callback' => function () {
            // Verifica se a requisição veio do próprio domínio
            return $_SERVER['REMOTE_ADDR'] === $_SERVER['SERVER_ADDR'];
        }
    ));

    // Rota para salvar eventos
    register_rest_route( 'trackerz/v1', '/event', array(
        'methods'  => 'POST',
        'callback' => 'trackerz_save_event_data',
        'permission_callback' => function () {
            // Verifica se a requisição veio do próprio domínio
            return $_SERVER['REMOTE_ADDR'] === $_SERVER['SERVER_ADDR'];
        }
    ));
}
add_action( 'rest_api_init', 'trackerz_register_routes' );

// Função para salvar os dados da sessão
function trackerz_save_session_data( WP_REST_Request $request ) {
    global $wpdb;

    // Obtém os dados da requisição
    $data = $request->get_json_params();

    // Sanitiza os dados
    $session_data = array(
        'tkz_session_id'        => sanitize_text_field( $data['tkz_session_id'] ),
        'tkz_lead_name'         => sanitize_text_field( $data['tkz_lead_name'] ),
        'tkz_lead_fname'        => sanitize_text_field( $data['tkz_lead_fname'] ),
        'tkz_lead_lname'        => sanitize_text_field( $data['tkz_lead_lname'] ),
        'tkz_lead_email'        => sanitize_email( $data['tkz_lead_email'] ),
        'tkz_lead_phone'        => sanitize_text_field( $data['tkz_lead_phone'] ),
        'tkz_lead_ip'           => sanitize_text_field( $data['tkz_lead_ip'] ),
        'tkz_device'            => sanitize_textarea_field( $data['tkz_device'] ),
        'tkz_lead_city'         => sanitize_text_field( $data['tkz_lead_city'] ),
        'tkz_lead_region'        => sanitize_text_field( $data['tkz_lead_region'] ),
        'tkz_lead_country_name'  => sanitize_text_field( $data['tkz_lead_country_name'] ),
        'tkz_lead_country_code' => sanitize_text_field( $data['tkz_lead_country_code'] ),
        'tkz_lead_zipcode'      => sanitize_text_field( $data['tkz_lead_zipcode'] ),
        'tkz_lead_currency'     => sanitize_text_field( $data['tkz_lead_currency'] ),
        'tkz_fbclid'           => sanitize_text_field( $data['tkz_fbclid'] ),
        'tkz_utm_medium'        => sanitize_text_field( $data['tkz_utm_medium'] ),
        'tkz_utm_campaign'      => sanitize_text_field( $data['tkz_utm_campaign'] ),
        'tkz_utm_content'      => sanitize_text_field( $data['tkz_utm_content'] ),
        'tkz_utm_term'         => sanitize_text_field( $data['tkz_utm_term'] ),
        'tkz_utm_source'        => sanitize_text_field( $data['tkz_utm_source'] ),
        'tkz_gclid'            => sanitize_text_field( $data['tkz_gclid'] ),
        'tkz_src'               => sanitize_text_field( $data['tkz_src'] ),
        'tkz_url'              => esc_url_raw( $data['tkz_url'] ),
        'tkz_last_url'          => esc_url_raw( $data['tkz_last_url'] ),
        'tkz_campaignid'       => sanitize_text_field( $data['tkz_campaignid'] ),
        'tkz_id_utm'           => sanitize_text_field( $data['tkz_id_utm'] ),
        'tkz_cliente_id'        => sanitize_text_field( $data['tkz_cliente_id'] ),
        'tkz_fbc'              => sanitize_text_field( $data['tkz_fbc'] ),
        'tkz_fbp'              => sanitize_text_field( $data['tkz_fbp'] ),
        'tkz_sck'               => sanitize_textarea_field( $data['tkz_sck'] ),
        'tkz_ga_user_id'        => sanitize_text_field( $data['tkz_ga_user_id'] ),
        'tkz_event_day'         => intval( $data['tkz_event_day'] ),
        'tkz_event_month'       => sanitize_text_field( $data['tkz_event_month'] ),
        'tkz_event_day_in_month' => intval( $data['tkz_event_day_in_month'] ),
        'tkz_event_time_interval' => sanitize_text_field( $data['tkz_event_time_interval'] ),
        'tkz_adset'            => sanitize_text_field( $data['tkz_adset'] ),
        'tkz_adid'             => sanitize_text_field( $data['tkz_adid'] ),
        'tkz_adgroupid'        => sanitize_text_field( $data['tkz_adgroupid'] ),
        'tkz_targetid'         => sanitize_text_field( $data['tkz_targetid'] ),
        'created_at'           => current_time( 'mysql' ),
    );

    // Insere os dados na tabela de sessões
    $table = $wpdb->prefix . TKZ_PREFIX . 'sessions';
    $result = $wpdb->insert( $table, $session_data );

    // Retorna a resposta
    if ( $result ) {
        return new WP_REST_Response( array( 'message' => 'Dados da sessão salvos com sucesso', 'session_id' => $data['tkz_session_id'] ), 201 );
    } else {
        return new WP_REST_Response( 'Erro ao salvar dados da sessão', 500 );
    }
}

// Função para salvar os dados do lead
function trackerz_save_lead_data( WP_REST_Request $request ) {
    global $wpdb;

    // Obtém os dados da requisição
    $data = $request->get_json_params();

    // Sanitiza os dados
    $lead_data = array(
        'lead_id'           => sanitize_text_field( $data['lead_id'] ),
        'lead_name'         => sanitize_text_field( $data['lead_name'] ),
        'lead_fname'        => sanitize_text_field( $data['lead_fname'] ),
        'lead_lname'        => sanitize_text_field( $data['lead_lname'] ),
        'lead_email'        => sanitize_email( $data['lead_email'] ),
        'lead_phone'        => sanitize_text_field( $data['lead_phone'] ),
        'ip'                => sanitize_text_field( $data['ip'] ),
        'device'            => sanitize_textarea_field( $data['device'] ),
        'adress_city'       => sanitize_text_field( $data['adress_city'] ),
        'adress_state'      => sanitize_text_field( $data['adress_state'] ),
        'adress_zipcode'     => sanitize_text_field( $data['adress_zipcode'] ),
        'adress_country_name' => sanitize_text_field( $data['adress_country_name'] ),
        'adress_country'    => sanitize_text_field( $data['adress_country'] ),
        'fbp'               => sanitize_text_field( $data['fbp'] ),
        'fbc'               => sanitize_text_field( $data['fbc'] ),
        'created_at'        => current_time( 'mysql' ),
    );

    // Insere os dados na tabela de leads
    $table = $wpdb->prefix . TKZ_PREFIX . 'leads';
    $result = $wpdb->insert( $table, $lead_data );

    // Retorna a resposta
    if ( $result ) {
        return new WP_REST_Response( array( 'message' => 'Dados do lead salvos com sucesso', 'lead_id' => $data['lead_id'] ), 201 );
    } else {
        return new WP_REST_Response( 'Erro ao salvar dados do lead', 500 );
    }
}

// Função para salvar os dados do evento
function trackerz_save_event_data( WP_REST_Request $request ) {
    global $wpdb;

    // Obtém os dados da requisição
    $data = $request->get_json_params();

    // Sanitiza os dados
    $event_data = array(
        'event_id'          => sanitize_text_field( $data['event_id'] ),
        'lead_id'           => sanitize_text_field( $data['lead_id'] ),
        'event_time'        => sanitize_text_field( $data['event_time'] ),
        'event_name'        => sanitize_text_field( $data['event_name'] ),
        'content_ids'       => sanitize_text_field( $data['content_ids'] ),
        'product_id'        => sanitize_text_field( $data['product_id'] ),
        'product_name'       => sanitize_text_field( $data['product_name'] ),
        'content_name'       => sanitize_text_field( $data['content_name'] ),
        'value'             => sanitize_text_field( $data['value'] ),
        'currency'          => sanitize_text_field( $data['currency'] ),
        'page_title'        => sanitize_text_field( $data['page_title'] ),
        'page_id'           => sanitize_text_field( $data['page_id'] ),
        'created_at'        => current_time( 'mysql' ),
    );

    // Insere os dados na tabela de eventos
    $table = $wpdb->prefix . TKZ_PREFIX . 'events';
    $result = $wpdb->insert( $table, $event_data );

    // Retorna a resposta
    if ( $result ) {
        return new WP_REST_Response( array( 'message' => 'Dados do evento salvos com sucesso', 'event_id' => $data['event_id'] ), 201 );
    } else {
        return new WP_REST_Response( 'Erro ao salvar dados do evento', 500 );
    }
}