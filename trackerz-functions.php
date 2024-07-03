<?php
// Impede o acesso direto ao arquivo
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Retorna os dados de um lead pelo ID.
 *
 * @param string $lead_id O ID do lead.
 * @return object|null Os dados do lead ou null se não encontrado.
 */
function trackerz_get_lead_by_id( $lead_id ) {
    global $wpdb;
    $table = $wpdb->prefix . TKZ_PREFIX . 'leads';
    $lead_id = sanitize_text_field( $lead_id );
    $query = $wpdb->prepare( "SELECT * FROM $table WHERE lead_id = %s", $lead_id );
    $lead = $wpdb->get_row( $query );

    if ( $wpdb->last_error ) {
        error_log( 'Erro ao obter lead: ' . $wpdb->last_error );
        return null;
    }

    return $lead;
}

/**
 * Atualiza os dados de um lead.
 *
 * @param string $lead_id O ID do lead.
 * @param array $lead_data Os dados a serem atualizados.
 * @return bool True se a atualização for bem-sucedida, False caso contrário.
 */
function trackerz_update_lead( $lead_id, $lead_data ) {
    global $wpdb;
    $table = $wpdb->prefix . TKZ_PREFIX . 'leads';
    $lead_id = sanitize_text_field( $lead_id );

    // Sanitiza os dados
    $sanitized_data = array_map( 'sanitize_text_field', $lead_data );
    if ( isset( $sanitized_data['lead_email'] ) ) {
        $sanitized_data['lead_email'] = sanitize_email( $sanitized_data['lead_email'] );
    }
    if ( isset( $sanitized_data['device'] ) ) {
        $sanitized_data['device'] = sanitize_textarea_field( $sanitized_data['device'] );
    }

    $where = array( 'lead_id' => $lead_id );
    $result = $wpdb->update( $table, $sanitized_data, $where );

    if ( $result === false ) {
        error_log( 'Erro ao atualizar lead: ' . $wpdb->last_error );
        return false;
    }

    return true;
}

/**
 * Retorna os dados de uma sessão pelo ID.
 *
 * @param string $session_id O ID da sessão.
 * @return object|null Os dados da sessão ou null se não encontrada.
 */
function trackerz_get_session_by_id( $session_id ) {
    global $wpdb;
    $table = $wpdb->prefix . TKZ_PREFIX . 'sessions';
    $session_id = sanitize_text_field( $session_id );
    $query = $wpdb->prepare( "SELECT * FROM $table WHERE tkz_session_id = %s", $session_id );
    $session = $wpdb->get_row( $query );

    if ( $wpdb->last_error ) {
        error_log( 'Erro ao obter sessão: ' . $wpdb->last_error );
        return null;
    }

    return $session;
}

/**
 * Atualiza os dados de uma sessão.
 *
 * @param string $session_id O ID da sessão.
 * @param array $session_data Os dados a serem atualizados.
 * @return bool True se a atualização for bem-sucedida, False caso contrário.
 */
function trackerz_update_session( $session_id, $session_data ) {
    global $wpdb;
    $table = $wpdb->prefix . TKZ_PREFIX . 'sessions';
    $session_id = sanitize_text_field( $session_id );

    // Sanitiza os dados
    $sanitized_data = array_map( 'sanitize_text_field', $session_data );
    if ( isset( $sanitized_data['tkz_lead_email'] ) ) {
        $sanitized_data['tkz_lead_email'] = sanitize_email( $sanitized_data['tkz_lead_email'] );
    }
    if ( isset( $sanitized_data['tkz_device'] ) ) {
        $sanitized_data['tkz_device'] = sanitize_textarea_field( $sanitized_data['tkz_device'] );
    }
    if ( isset( $sanitized_data['tkz_url'] ) ) {
        $sanitized_data['tkz_url'] = esc_url_raw( $sanitized_data['tkz_url'] );
    }
    if ( isset( $sanitized_data['tkz_last_url'] ) ) {
        $sanitized_data['tkz_last_url'] = esc_url_raw( $sanitized_data['tkz_last_url'] );
    }

    $where = array( 'tkz_session_id' => $session_id );
    $result = $wpdb->update( $table, $sanitized_data, $where );

    if ( $result === false ) {
        error_log( 'Erro ao atualizar sessão: ' . $wpdb->last_error );
        return false;
    }

    return true;
}

/**
 * Exclui um lead pelo ID.
 *
 * @param string $lead_id O ID do lead.
 * @return bool True se a exclusão for bem-sucedida, False caso contrário.
 */
function trackerz_delete_lead( $lead_id ) {
    global $wpdb;
    $table = $wpdb->prefix . TKZ_PREFIX . 'leads';
    $lead_id = sanitize_text_field( $lead_id );
    $result = $wpdb->delete( $table, array( 'lead_id' => $lead_id ) );

    if ( $result === false ) {
        error_log( 'Erro ao excluir lead: ' . $wpdb->last_error );
        return false;
    }

    return true;
}

/**
 * Exclui uma sessão pelo ID.
 *
 * @param string $session_id O ID da sessão.
 * @return bool True se a exclusão for bem-sucedida, False caso contrário.
 */
function trackerz_delete_session( $session_id ) {
    global $wpdb;
    $table = $wpdb->prefix . TKZ_PREFIX . 'sessions';
    $session_id = sanitize_text_field( $session_id );
    $result = $wpdb->delete( $table, array( 'tkz_session_id' => $session_id ) );

    if ( $result === false ) {
        error_log( 'Erro ao excluir sessão: ' . $wpdb->last_error );
        return false;
    }

    return true;
}