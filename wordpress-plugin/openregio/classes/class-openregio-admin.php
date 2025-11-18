<?php
/**
 * Admin settings
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

class OpenRegio_Admin {
    
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
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('OpenRegio Instellingen', 'openregio'),
            __('OpenRegio', 'openregio'),
            'manage_options',
            'openregio-settings',
            array($this, 'settings_page'),
            'dashicons-networking',
            30
        );
        
        add_submenu_page(
            'openregio-settings',
            __('Leden', 'openregio'),
            __('Leden', 'openregio'),
            'manage_options',
            'openregio-members',
            array($this, 'members_page')
        );
        
        add_submenu_page(
            'openregio-settings',
            __('Betalingen', 'openregio'),
            __('Betalingen', 'openregio'),
            'manage_options',
            'openregio-payments',
            array($this, 'payments_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('openregio_settings', 'openregio_settings', array($this, 'sanitize_settings'));
        
        // Mollie section
        add_settings_section(
            'openregio_mollie_section',
            __('Mollie Instellingen', 'openregio'),
            array($this, 'mollie_section_callback'),
            'openregio-settings'
        );
        
        add_settings_field(
            'mollie_api_key',
            __('Mollie API Key', 'openregio'),
            array($this, 'mollie_api_key_callback'),
            'openregio-settings',
            'openregio_mollie_section'
        );
        
        // Pricing section
        add_settings_section(
            'openregio_pricing_section',
            __('Prijzen', 'openregio'),
            array($this, 'pricing_section_callback'),
            'openregio-settings'
        );
        
        add_settings_field(
            'price_basic',
            __('Prijs Basic (per maand)', 'openregio'),
            array($this, 'price_basic_callback'),
            'openregio-settings',
            'openregio_pricing_section'
        );
        
        add_settings_field(
            'price_pro',
            __('Prijs Pro (per maand)', 'openregio'),
            array($this, 'price_pro_callback'),
            'openregio-settings',
            'openregio_pricing_section'
        );
        
        // Email section
        add_settings_section(
            'openregio_email_section',
            __('E-mail Instellingen', 'openregio'),
            array($this, 'email_section_callback'),
            'openregio-settings'
        );
        
        add_settings_field(
            'mail_from_name',
            __('Afzender Naam', 'openregio'),
            array($this, 'mail_from_name_callback'),
            'openregio-settings',
            'openregio_email_section'
        );
        
        add_settings_field(
            'mail_from_email',
            __('Afzender E-mail', 'openregio'),
            array($this, 'mail_from_email_callback'),
            'openregio-settings',
            'openregio_email_section'
        );
    }
    
    /**
     * Sanitize settings
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        if (isset($input['mollie_api_key'])) {
            $sanitized['mollie_api_key'] = sanitize_text_field($input['mollie_api_key']);
        }
        
        if (isset($input['price_basic'])) {
            $sanitized['price_basic'] = number_format((float)$input['price_basic'], 2, '.', '');
        }
        
        if (isset($input['price_pro'])) {
            $sanitized['price_pro'] = number_format((float)$input['price_pro'], 2, '.', '');
        }
        
        if (isset($input['mail_from_name'])) {
            $sanitized['mail_from_name'] = sanitize_text_field($input['mail_from_name']);
        }
        
        if (isset($input['mail_from_email'])) {
            $sanitized['mail_from_email'] = sanitize_email($input['mail_from_email']);
        }
        
        return $sanitized;
    }
    
    /**
     * Section callbacks
     */
    public function mollie_section_callback() {
        echo '<p>' . __('Configureer je Mollie API instellingen voor betalingen.', 'openregio') . '</p>';
    }
    
    public function pricing_section_callback() {
        echo '<p>' . __('Stel de prijzen in voor Basic en Pro lidmaatschappen.', 'openregio') . '</p>';
    }
    
    public function email_section_callback() {
        echo '<p>' . __('Configureer de e-mail instellingen voor notificaties.', 'openregio') . '</p>';
    }
    
    /**
     * Field callbacks
     */
    public function mollie_api_key_callback() {
        $settings = get_option('openregio_settings', array());
        $value = isset($settings['mollie_api_key']) ? $settings['mollie_api_key'] : '';
        ?>
        <input type="text" 
               name="openregio_settings[mollie_api_key]" 
               value="<?php echo esc_attr($value); ?>" 
               class="regular-text"
               placeholder="live_xxxxxxxxxxxxxx">
        <p class="description">
            <?php _e('Je Mollie API key (live of test). Vind deze in je Mollie dashboard.', 'openregio'); ?>
        </p>
        <?php
    }
    
    public function price_basic_callback() {
        $settings = get_option('openregio_settings', array());
        $value = isset($settings['price_basic']) ? $settings['price_basic'] : '9.95';
        ?>
        <input type="number" 
               name="openregio_settings[price_basic]" 
               value="<?php echo esc_attr($value); ?>" 
               step="0.01"
               min="0">
        <span>€</span>
        <?php
    }
    
    public function price_pro_callback() {
        $settings = get_option('openregio_settings', array());
        $value = isset($settings['price_pro']) ? $settings['price_pro'] : '19.95';
        ?>
        <input type="number" 
               name="openregio_settings[price_pro]" 
               value="<?php echo esc_attr($value); ?>" 
               step="0.01"
               min="0">
        <span>€</span>
        <?php
    }
    
    public function mail_from_name_callback() {
        $settings = get_option('openregio_settings', array());
        $value = isset($settings['mail_from_name']) ? $settings['mail_from_name'] : 'OpenRegio';
        ?>
        <input type="text" 
               name="openregio_settings[mail_from_name]" 
               value="<?php echo esc_attr($value); ?>" 
               class="regular-text">
        <?php
    }
    
    public function mail_from_email_callback() {
        $settings = get_option('openregio_settings', array());
        $value = isset($settings['mail_from_email']) ? $settings['mail_from_email'] : get_option('admin_email');
        ?>
        <input type="email" 
               name="openregio_settings[mail_from_email]" 
               value="<?php echo esc_attr($value); ?>" 
               class="regular-text">
        <?php
    }
    
    /**
     * Settings page
     */
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('OpenRegio Instellingen', 'openregio'); ?></h1>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('openregio_settings');
                do_settings_sections('openregio-settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
    
    /**
     * Members page
     */
    public function members_page() {
        include OPENREGIO_PLUGIN_DIR . 'templates/admin/members.php';
    }
    
    /**
     * Payments page
     */
    public function payments_page() {
        include OPENREGIO_PLUGIN_DIR . 'templates/admin/payments.php';
    }
}
