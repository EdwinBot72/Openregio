<?php
/**
 * Core plugin class
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

class OpenRegio_Core {
    
    /**
     * Single instance of the class
     */
    private static $instance = null;
    
    /**
     * Get instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
        $this->init_components();
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        add_action('init', array($this, 'load_textdomain'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
    }
    
    /**
     * Initialize plugin components
     */
    private function init_components() {
        // Initialize shortcodes
        OpenRegio_Shortcodes::get_instance();
        
        // Initialize admin
        if (is_admin()) {
            OpenRegio_Admin::get_instance();
        }
        
        // Initialize webhook handler
        OpenRegio_Webhook::get_instance();
    }
    
    /**
     * Load plugin textdomain
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'openregio',
            false,
            dirname(plugin_basename(OPENREGIO_PLUGIN_FILE)) . '/languages'
        );
    }
    
    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_scripts() {
        // Enqueue CSS
        wp_enqueue_style(
            'openregio-styles',
            OPENREGIO_PLUGIN_URL . 'assets/css/openregio.css',
            array(),
            OPENREGIO_VERSION
        );
        
        // Enqueue JS
        wp_enqueue_script(
            'openregio-scripts',
            OPENREGIO_PLUGIN_URL . 'assets/js/openregio.js',
            array('jquery'),
            OPENREGIO_VERSION,
            true
        );
        
        // Localize script
        wp_localize_script('openregio-scripts', 'openregioData', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('openregio_nonce')
        ));
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function admin_enqueue_scripts($hook) {
        // Only load on our admin pages
        if (strpos($hook, 'openregio') === false) {
            return;
        }
        
        wp_enqueue_style(
            'openregio-admin-styles',
            OPENREGIO_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            OPENREGIO_VERSION
        );
    }
}
