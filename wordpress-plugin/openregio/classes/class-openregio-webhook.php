<?php
/**
 * Webhook handler for Mollie
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

class OpenRegio_Webhook {
    
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
        add_action('init', array($this, 'handle_webhook'));
    }
    
    /**
     * Handle webhook request
     */
    public function handle_webhook() {
        // Check if this is a webhook request
        if (!isset($_GET['openregio_webhook']) || $_GET['openregio_webhook'] !== 'mollie') {
            return;
        }
        
        // Get payment ID from POST data
        $payment_id = isset($_POST['id']) ? sanitize_text_field($_POST['id']) : '';
        
        if (empty($payment_id)) {
            error_log('OpenRegio Webhook: No payment ID provided');
            status_header(400);
            exit;
        }
        
        // Log webhook call
        error_log('OpenRegio Webhook: Received for payment ' . $payment_id);
        
        // Get payment from Mollie
        $mollie = OpenRegio_Mollie::get_instance();
        $payment = $mollie->get_payment($payment_id);
        
        if (!$payment) {
            error_log('OpenRegio Webhook: Payment not found ' . $payment_id);
            status_header(404);
            exit;
        }
        
        // Process based on status
        if ($payment->isPaid() && !$payment->hasRefunds() && !$payment->hasChargebacks()) {
            error_log('OpenRegio Webhook: Payment is paid ' . $payment_id);
            
            // Process the payment
            $result = $mollie->process_paid_payment($payment_id);
            
            if ($result) {
                error_log('OpenRegio Webhook: Successfully processed payment ' . $payment_id);
                status_header(200);
            } else {
                error_log('OpenRegio Webhook: Failed to process payment ' . $payment_id);
                status_header(500);
            }
        } elseif ($payment->isOpen()) {
            error_log('OpenRegio Webhook: Payment is still open ' . $payment_id);
            status_header(200);
        } elseif ($payment->isPending()) {
            error_log('OpenRegio Webhook: Payment is pending ' . $payment_id);
            status_header(200);
        } elseif ($payment->isFailed()) {
            error_log('OpenRegio Webhook: Payment failed ' . $payment_id);
            
            // Update status in database
            global $wpdb;
            $table_name = $wpdb->prefix . 'openregio_pending_payments';
            $wpdb->update(
                $table_name,
                array('status' => 'failed'),
                array('mollie_payment_id' => $payment_id),
                array('%s'),
                array('%s')
            );
            
            status_header(200);
        } elseif ($payment->isExpired()) {
            error_log('OpenRegio Webhook: Payment expired ' . $payment_id);
            
            // Update status in database
            global $wpdb;
            $table_name = $wpdb->prefix . 'openregio_pending_payments';
            $wpdb->update(
                $table_name,
                array('status' => 'expired'),
                array('mollie_payment_id' => $payment_id),
                array('%s'),
                array('%s')
            );
            
            status_header(200);
        } elseif ($payment->isCanceled()) {
            error_log('OpenRegio Webhook: Payment canceled ' . $payment_id);
            
            // Update status in database
            global $wpdb;
            $table_name = $wpdb->prefix . 'openregio_pending_payments';
            $wpdb->update(
                $table_name,
                array('status' => 'canceled'),
                array('mollie_payment_id' => $payment_id),
                array('%s'),
                array('%s')
            );
            
            status_header(200);
        } else {
            error_log('OpenRegio Webhook: Unknown payment status ' . $payment_id);
            status_header(200);
        }
        
        exit;
    }
}
