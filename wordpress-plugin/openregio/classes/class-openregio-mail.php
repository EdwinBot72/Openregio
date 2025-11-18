<?php
/**
 * Email handling
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

class OpenRegio_Mail {
    
    /**
     * Send welcome email
     */
    public static function send_welcome_email($user_id) {
        $user = get_userdata($user_id);
        if (!$user) {
            return false;
        }
        
        $settings = get_option('openregio_settings', array());
        $from_name = isset($settings['mail_from_name']) ? $settings['mail_from_name'] : 'OpenRegio';
        $from_email = isset($settings['mail_from_email']) ? $settings['mail_from_email'] : get_option('admin_email');
        
        // Get temporary password
        $temp_password = get_user_meta($user_id, 'openregio_temp_password', true);
        $plan = get_user_meta($user_id, 'openregio_plan', true);
        
        // Email headers
        $headers = array(
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $from_name . ' <' . $from_email . '>'
        );
        
        // Email subject
        $subject = sprintf(
            __('Welkom bij OpenRegio %s!', 'openregio'),
            $plan === 'pro' ? 'Pro' : 'Basic'
        );
        
        // Email body
        ob_start();
        include OPENREGIO_PLUGIN_DIR . 'templates/emails/welcome.php';
        $message = ob_get_clean();
        
        // Send email
        $sent = wp_mail($user->user_email, $subject, $message, $headers);
        
        // Clean up temp password after sending
        if ($sent) {
            delete_user_meta($user_id, 'openregio_temp_password');
        }
        
        return $sent;
    }
    
    /**
     * Send onboarding reminder
     */
    public static function send_onboarding_reminder($user_id) {
        $user = get_userdata($user_id);
        if (!$user) {
            return false;
        }
        
        // Check if already completed onboarding
        if (OpenRegio_User::has_completed_onboarding($user_id)) {
            return false;
        }
        
        $settings = get_option('openregio_settings', array());
        $from_name = isset($settings['mail_from_name']) ? $settings['mail_from_name'] : 'OpenRegio';
        $from_email = isset($settings['mail_from_email']) ? $settings['mail_from_email'] : get_option('admin_email');
        
        $headers = array(
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $from_name . ' <' . $from_email . '>'
        );
        
        $subject = __('Voltooi je OpenRegio profiel', 'openregio');
        
        ob_start();
        include OPENREGIO_PLUGIN_DIR . 'templates/emails/onboarding-reminder.php';
        $message = ob_get_clean();
        
        return wp_mail($user->user_email, $subject, $message, $headers);
    }
}
