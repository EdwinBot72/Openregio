<?php
/**
 * Mollie payment handler
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

class OpenRegio_Mollie {
    
    /**
     * Single instance
     */
    private static $instance = null;
    
    /**
     * Mollie API client
     */
    private $mollie_client = null;
    
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
        $this->init_mollie();
    }
    
    /**
     * Initialize Mollie client
     */
    private function init_mollie() {
        $settings = get_option('openregio_settings', array());
        $api_key = isset($settings['mollie_api_key']) ? $settings['mollie_api_key'] : '';
        
        if (empty($api_key)) {
            return;
        }
        
        // Only initialize if Mollie API is available
        if (class_exists('\Mollie\Api\MollieApiClient')) {
            try {
                $this->mollie_client = new \Mollie\Api\MollieApiClient();
                $this->mollie_client->setApiKey($api_key);
            } catch (Exception $e) {
                error_log('OpenRegio: Failed to initialize Mollie - ' . $e->getMessage());
            }
        }
    }
    
    /**
     * Create payment
     */
    public function create_payment($email, $plan) {
        if (!$this->mollie_client) {
            return new WP_Error('mollie_not_configured', __('Mollie is niet geconfigureerd', 'openregio'));
        }
        
        $settings = get_option('openregio_settings', array());
        
        // Get amount based on plan
        $amount = $plan === 'pro' 
            ? (isset($settings['price_pro']) ? $settings['price_pro'] : '19.95')
            : (isset($settings['price_basic']) ? $settings['price_basic'] : '9.95');
        
        $description = $plan === 'pro' 
            ? 'OpenRegio Pro Lidmaatschap'
            : 'OpenRegio Basic Lidmaatschap';
        
        try {
            // Create payment
            $payment = $this->mollie_client->payments->create([
                'amount' => [
                    'currency' => 'EUR',
                    'value' => number_format((float)$amount, 2, '.', '')
                ],
                'description' => $description,
                'redirectUrl' => add_query_arg('payment', 'success', home_url('/bedankt')),
                'webhookUrl' => home_url('/?openregio_webhook=mollie'),
                'metadata' => [
                    'email' => $email,
                    'plan' => $plan
                ]
            ]);
            
            // Store pending payment in database
            global $wpdb;
            $table_name = $wpdb->prefix . 'openregio_pending_payments';
            
            $wpdb->insert(
                $table_name,
                array(
                    'email' => $email,
                    'plan' => $plan,
                    'mollie_payment_id' => $payment->id,
                    'status' => 'pending'
                ),
                array('%s', '%s', '%s', '%s')
            );
            
            return $payment;
            
        } catch (Exception $e) {
            error_log('OpenRegio: Payment creation failed - ' . $e->getMessage());
            return new WP_Error('payment_failed', $e->getMessage());
        }
    }
    
    /**
     * Get payment status
     */
    public function get_payment($payment_id) {
        if (!$this->mollie_client) {
            return null;
        }
        
        try {
            return $this->mollie_client->payments->get($payment_id);
        } catch (Exception $e) {
            error_log('OpenRegio: Failed to get payment - ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Process successful payment
     */
    public function process_paid_payment($payment_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'openregio_pending_payments';
        
        // Get pending payment
        $pending = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE mollie_payment_id = %s",
            $payment_id
        ));
        
        if (!$pending) {
            error_log('OpenRegio: Pending payment not found for ' . $payment_id);
            return false;
        }
        
        // Check if user already exists
        $user = get_user_by('email', $pending->email);
        
        if (!$user) {
            // Create new user
            $user = OpenRegio_User::create_user_from_payment($pending->email, $pending->plan);
            
            if (is_wp_error($user)) {
                error_log('OpenRegio: Failed to create user - ' . $user->get_error_message());
                return false;
            }
        } else {
            // Update existing user role
            OpenRegio_User::update_user_plan($user->ID, $pending->plan);
        }
        
        // Update pending payment status
        $wpdb->update(
            $table_name,
            array('status' => 'completed'),
            array('mollie_payment_id' => $payment_id),
            array('%s'),
            array('%s')
        );
        
        // Send welcome email
        OpenRegio_Mail::send_welcome_email($user->ID);
        
        return true;
    }
}
