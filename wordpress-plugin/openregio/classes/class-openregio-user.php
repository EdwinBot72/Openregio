<?php
/**
 * User management
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

class OpenRegio_User {
    
    /**
     * Create user from payment
     */
    public static function create_user_from_payment($email, $plan) {
        // Generate username from email
        $username = sanitize_user(str_replace('@', '_', $email));
        
        // Make sure username is unique
        $original_username = $username;
        $counter = 1;
        while (username_exists($username)) {
            $username = $original_username . $counter;
            $counter++;
        }
        
        // Generate temporary password
        $password = wp_generate_password(12, true, true);
        
        // Create user
        $user_id = wp_create_user($username, $password, $email);
        
        if (is_wp_error($user_id)) {
            return $user_id;
        }
        
        // Set user role based on plan
        $user = new WP_User($user_id);
        $role = $plan === 'pro' ? 'openregio_pro' : 'openregio_basic';
        $user->set_role($role);
        
        // Store temporary password for email
        update_user_meta($user_id, 'openregio_temp_password', $password);
        update_user_meta($user_id, 'openregio_plan', $plan);
        
        return $user;
    }
    
    /**
     * Update user plan
     */
    public static function update_user_plan($user_id, $plan) {
        $user = new WP_User($user_id);
        $role = $plan === 'pro' ? 'openregio_pro' : 'openregio_basic';
        $user->set_role($role);
        
        update_user_meta($user_id, 'openregio_plan', $plan);
        
        return true;
    }
    
    /**
     * Get user business profile
     */
    public static function get_business_profile($user_id = null) {
        if (!$user_id) {
            $user_id = get_current_user_id();
        }
        
        return array(
            'company_name' => get_user_meta($user_id, 'openregio_company_name', true),
            'bio' => get_user_meta($user_id, 'openregio_bio', true),
            'category' => get_user_meta($user_id, 'openregio_category', true),
            'region' => get_user_meta($user_id, 'openregio_region', true),
            'phone' => get_user_meta($user_id, 'openregio_phone', true),
            'website' => get_user_meta($user_id, 'openregio_website', true),
        );
    }
    
    /**
     * Update user business profile
     */
    public static function update_business_profile($user_id, $data) {
        $fields = array(
            'company_name',
            'bio',
            'category',
            'region',
            'phone',
            'website'
        );
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                update_user_meta($user_id, 'openregio_' . $field, sanitize_text_field($data[$field]));
            }
        }
        
        return true;
    }
    
    /**
     * Check if user completed onboarding
     */
    public static function has_completed_onboarding($user_id = null) {
        if (!$user_id) {
            $user_id = get_current_user_id();
        }
        
        return get_user_meta($user_id, 'openregio_onboarding_done', true) == '1';
    }
}
