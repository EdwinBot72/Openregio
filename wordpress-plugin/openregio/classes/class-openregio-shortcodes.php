<?php
/**
 * Shortcode handlers
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

class OpenRegio_Shortcodes {
    
    /**
     * Single instance
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
        $this->register_shortcodes();
    }
    
    /**
     * Register all shortcodes
     */
    private function register_shortcodes() {
        add_shortcode('openregio_home', array($this, 'home_shortcode'));
        add_shortcode('openregio_start', array($this, 'start_shortcode'));
        add_shortcode('openregio_onboarding', array($this, 'onboarding_shortcode'));
        add_shortcode('openregio_dashboard', array($this, 'dashboard_shortcode'));
        add_shortcode('openregio_netwerk', array($this, 'network_shortcode'));
        add_shortcode('openregio_community', array($this, 'community_shortcode'));
        add_shortcode('openregio_chat', array($this, 'chat_shortcode'));
        add_shortcode('openregio_regiobot', array($this, 'regiobot_shortcode'));
    }
    
    /**
     * Home page shortcode
     */
    public function home_shortcode($atts) {
        ob_start();
        include OPENREGIO_PLUGIN_DIR . 'templates/home.php';
        return ob_get_clean();
    }
    
    /**
     * Start flow shortcode
     */
    public function start_shortcode($atts) {
        // Handle form submission
        if (isset($_POST['openregio_start_submit'])) {
            $this->process_start_form();
        }
        
        ob_start();
        include OPENREGIO_PLUGIN_DIR . 'templates/start.php';
        return ob_get_clean();
    }
    
    /**
     * Onboarding shortcode
     */
    public function onboarding_shortcode($atts) {
        // Check if user is logged in
        if (!is_user_logged_in()) {
            return '<p>' . __('Je moet ingelogd zijn om deze pagina te zien.', 'openregio') . '</p>';
        }
        
        // Check if onboarding already done
        $user_id = get_current_user_id();
        if (get_user_meta($user_id, 'openregio_onboarding_done', true) == '1') {
            wp_redirect(home_url('/dashboard'));
            exit;
        }
        
        // Handle form submission
        if (isset($_POST['openregio_onboarding_submit'])) {
            $this->process_onboarding_form();
        }
        
        ob_start();
        include OPENREGIO_PLUGIN_DIR . 'templates/onboarding.php';
        return ob_get_clean();
    }
    
    /**
     * Dashboard shortcode
     */
    public function dashboard_shortcode($atts) {
        if (!is_user_logged_in()) {
            return '<p>' . __('Je moet ingelogd zijn.', 'openregio') . ' <a href="' . wp_login_url() . '">' . __('Inloggen', 'openregio') . '</a></p>';
        }
        
        if (!OpenRegio_Roles::user_has_platform_access()) {
            return '<p>' . __('Je hebt geen toegang tot het platform.', 'openregio') . '</p>';
        }
        
        ob_start();
        include OPENREGIO_PLUGIN_DIR . 'templates/dashboard.php';
        return ob_get_clean();
    }
    
    /**
     * Network shortcode
     */
    public function network_shortcode($atts) {
        if (!is_user_logged_in()) {
            return '<p>' . __('Je moet ingelogd zijn.', 'openregio') . ' <a href="' . wp_login_url() . '">' . __('Inloggen', 'openregio') . '</a></p>';
        }
        
        if (!OpenRegio_Roles::user_has_platform_access()) {
            return '<p>' . __('Je hebt geen toegang tot het platform.', 'openregio') . '</p>';
        }
        
        ob_start();
        include OPENREGIO_PLUGIN_DIR . 'templates/network.php';
        return ob_get_clean();
    }
    
    /**
     * Community shortcode
     */
    public function community_shortcode($atts) {
        if (!is_user_logged_in()) {
            return '<p>' . __('Je moet ingelogd zijn.', 'openregio') . ' <a href="' . wp_login_url() . '">' . __('Inloggen', 'openregio') . '</a></p>';
        }
        
        if (!OpenRegio_Roles::user_has_platform_access()) {
            return '<p>' . __('Je hebt geen toegang tot het platform.', 'openregio') . '</p>';
        }
        
        ob_start();
        include OPENREGIO_PLUGIN_DIR . 'templates/community.php';
        return ob_get_clean();
    }
    
    /**
     * Chat shortcode
     */
    public function chat_shortcode($atts) {
        if (!is_user_logged_in()) {
            return '<p>' . __('Je moet ingelogd zijn.', 'openregio') . ' <a href="' . wp_login_url() . '">' . __('Inloggen', 'openregio') . '</a></p>';
        }
        
        if (!OpenRegio_Roles::user_has_platform_access()) {
            return '<p>' . __('Je hebt geen toegang tot het platform.', 'openregio') . '</p>';
        }
        
        ob_start();
        include OPENREGIO_PLUGIN_DIR . 'templates/chat.php';
        return ob_get_clean();
    }
    
    /**
     * RegioBot shortcode
     */
    public function regiobot_shortcode($atts) {
        if (!is_user_logged_in()) {
            return '<p>' . __('Je moet ingelogd zijn.', 'openregio') . ' <a href="' . wp_login_url() . '">' . __('Inloggen', 'openregio') . '</a></p>';
        }
        
        if (!OpenRegio_Roles::user_has_pro_access()) {
            ob_start();
            include OPENREGIO_PLUGIN_DIR . 'templates/upgrade-to-pro.php';
            return ob_get_clean();
        }
        
        ob_start();
        include OPENREGIO_PLUGIN_DIR . 'templates/regiobot.php';
        return ob_get_clean();
    }
    
    /**
     * Process start form
     */
    private function process_start_form() {
        if (!isset($_POST['openregio_start_nonce']) || 
            !wp_verify_nonce($_POST['openregio_start_nonce'], 'openregio_start')) {
            return;
        }
        
        $email = sanitize_email($_POST['email']);
        $plan = sanitize_text_field($_POST['plan']);
        
        if (!is_email($email)) {
            add_filter('openregio_error', function() {
                return __('Ongeldig e-mailadres', 'openregio');
            });
            return;
        }
        
        if (!in_array($plan, array('basic', 'pro'))) {
            $plan = 'basic';
        }
        
        // Create Mollie payment
        $mollie = OpenRegio_Mollie::get_instance();
        $payment = $mollie->create_payment($email, $plan);
        
        if (is_wp_error($payment)) {
            add_filter('openregio_error', function() use ($payment) {
                return $payment->get_error_message();
            });
            return;
        }
        
        // Redirect to Mollie
        wp_redirect($payment->getCheckoutUrl());
        exit;
    }
    
    /**
     * Process onboarding form
     */
    private function process_onboarding_form() {
        if (!isset($_POST['openregio_onboarding_nonce']) || 
            !wp_verify_nonce($_POST['openregio_onboarding_nonce'], 'openregio_onboarding')) {
            return;
        }
        
        $user_id = get_current_user_id();
        
        // Update password if provided
        if (!empty($_POST['new_password'])) {
            wp_set_password($_POST['new_password'], $user_id);
        }
        
        // Save user meta
        update_user_meta($user_id, 'openregio_company_name', sanitize_text_field($_POST['company_name']));
        update_user_meta($user_id, 'openregio_bio', sanitize_textarea_field($_POST['bio']));
        update_user_meta($user_id, 'openregio_category', sanitize_text_field($_POST['category']));
        update_user_meta($user_id, 'openregio_onboarding_done', '1');
        
        // Redirect to dashboard
        wp_redirect(home_url('/dashboard'));
        exit;
    }
}
