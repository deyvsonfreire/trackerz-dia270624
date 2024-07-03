<?php
// Impede o acesso direto ao arquivo
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Função para criar as tabelas do plugin no banco de dados
function trackerz_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    // Nome das tabelas com o prefixo do plugin
    $table_sessions = $wpdb->prefix . TKZ_PREFIX . 'sessions';
    $table_leads = $wpdb->prefix . TKZ_PREFIX . 'leads';

    // SQL para criar a tabela de sessões
    $sql_sessions = "
    CREATE TABLE $table_sessions (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        tkz_session_id VARCHAR(255) NOT NULL,
        tkz_lead_name VARCHAR(255),
        tkz_lead_fname VARCHAR(255),
        tkz_lead_lname VARCHAR(255),
        tkz_lead_email VARCHAR(255),
        tkz_lead_phone VARCHAR(20),
        tkz_lead_ip VARCHAR(45),
        tkz_device TEXT,
        tkz_lead_city VARCHAR(255),
        tkz_lead_region VARCHAR(255),
        tkz_lead_country_name VARCHAR(255),
        tkz_lead_country_code VARCHAR(10),
        tkz_lead_zipcode VARCHAR(20),
        tkz_lead_currency VARCHAR(10),
        tkz_fbclid VARCHAR(255),
        tkz_utm_medium VARCHAR(255),
        tkz_utm_campaign VARCHAR(255),
        tkz_utm_content VARCHAR(255),
        tkz_utm_term VARCHAR(255),
        tkz_utm_source VARCHAR(255),
        tkz_gclid VARCHAR(255),
        tkz_src VARCHAR(255),
        tkz_url TEXT,
        tkz_last_url TEXT,
        tkz_campaignid VARCHAR(255),
        tkz_id_utm VARCHAR(255),
        tkz_cliente_id VARCHAR(255),
        tkz_fbc VARCHAR(255),
        tkz_fbp VARCHAR(255),
        tkz_sck TEXT,
        tkz_ga_user_id VARCHAR(255),
        tkz_event_day INT,
        tkz_event_month VARCHAR(20),
        tkz_event_day_in_month INT,
        tkz_event_time_interval VARCHAR(20),
        tkz_adset VARCHAR(255),
        tkz_adid VARCHAR(255),
        tkz_adgroupid VARCHAR(255),
        tkz_targetid VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY tkz_session_id (tkz_session_id)
    ) $charset_collate;
    ";

    // SQL para criar a tabela de leads
    $sql_leads = "
    CREATE TABLE $table_leads (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        lead_id VARCHAR(255) NOT NULL,
        lead_name VARCHAR(255),
        lead_fname VARCHAR(255),
        lead_lname VARCHAR(255),
        lead_email VARCHAR(255),
        lead_phone VARCHAR(20),
        ip VARCHAR(45),
        device TEXT,
        adress_city VARCHAR(255),
        adress_state VARCHAR(255),
        adress_zipcode VARCHAR(20),
        adress_country_name VARCHAR(255),
        adress_country VARCHAR(10),
        fbp VARCHAR(255),
        fbc VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY lead_id (lead_id)
    ) $charset_collate;
    ";

    // Executa as queries SQL para criar as tabelas
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql_sessions );
    dbDelta( $sql_leads );
}