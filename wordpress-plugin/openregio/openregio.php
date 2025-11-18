<?php
/**
 * Plugin Name: OpenRegio Platform
 * Plugin URI: https://openregio.nl
 * Description: Complete platform voor lokale ondernemers met Mollie betalingen, membership management en RegioBot AI assistent.
 * Version: 1.0.0
 * Author: OpenRegio
 * Author URI: https://openregio.nl
 * Text Domain: openregio
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('OPENREGIO_VERSION', '1.0.0');
define('OPENREGIO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('OPENREGIO_PLUGIN_URL', plugin_dir_url(__FILE__));
define('OPENREGIO_PLUGIN_FILE', __FILE__);

// Require Composer autoloader if exists (for Mollie API)
if (file_exists(OPENREGIO_PLUGIN_DIR . 'vendor/autoload.php')) {
    require_once OPENREGIO_PLUGIN_DIR . 'vendor/autoload.php';
}

// Include core classes
require_once OPENREGIO_PLUGIN_DIR . 'classes/class-openregio-core.php';
require_once OPENREGIO_PLUGIN_DIR . 'classes/class-openregio-roles.php';
require_once OPENREGIO_PLUGIN_DIR . 'classes/class-openregio-shortcodes.php';
require_once OPENREGIO_PLUGIN_DIR . 'classes/class-openregio-mollie.php';
require_once OPENREGIO_PLUGIN_DIR . 'classes/class-openregio-admin.php';
require_once OPENREGIO_PLUGIN_DIR . 'classes/class-openregio-user.php';
require_once OPENREGIO_PLUGIN_DIR . 'classes/class-openregio-mail.php';
require_once OPENREGIO_PLUGIN_DIR . 'classes/class-openregio-webhook.php';

// Include helper functions
require_once OPENREGIO_PLUGIN_DIR . 'includes/helpers.php';

/**
 * Main plugin initialization
 */
function openregio_init() {
    // Initialize core plugin
    OpenRegio_Core::get_instance();
}
add_action('plugins_loaded', 'openregio_init');

/**
 * Activation hook
 */
function openregio_activate() {
    // Create custom roles
    OpenRegio_Roles::create_roles();
    
    // Create necessary database tables if needed
    openregio_create_tables();
    
    // Flush rewrite rules
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'openregio_activate');

/**
 * Deactivation hook
 */
function openregio_deactivate() {
    // Flush rewrite rules
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'openregio_deactivate');

/**
 * Uninstall hook
 */
function openregio_uninstall() {
    // Remove custom roles
    OpenRegio_Roles::remove_roles();
    
    // Clean up options
    delete_option('openregio_settings');
    
    // Optional: Remove user meta (uncomment if you want to clean everything)
    // global $wpdb;
    // $wpdb->query("DELETE FROM {$wpdb->usermeta} WHERE meta_key LIKE 'openregio_%'");
}
register_uninstall_hook(__FILE__, 'openregio_uninstall');

/**
 * Create custom database tables
 */
function openregio_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    
    // Table for pending payments
    $table_name = $wpdb->prefix . 'openregio_pending_payments';
    
    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        email varchar(255) NOT NULL,
        plan varchar(50) NOT NULL,
        mollie_payment_id varchar(255) DEFAULT NULL,
        status varchar(50) DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY email (email),
        KEY mollie_payment_id (mollie_payment_id)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
