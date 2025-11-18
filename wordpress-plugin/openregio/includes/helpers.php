<?php
/**
 * Helper functions
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Get plugin settings
 */
function openregio_get_setting($key, $default = '') {
    $settings = get_option('openregio_settings', array());
    return isset($settings[$key]) ? $settings[$key] : $default;
}

/**
 * Check if user is OpenRegio member
 */
function openregio_is_member($user_id = null) {
    return OpenRegio_Roles::user_has_platform_access($user_id);
}

/**
 * Check if user is Pro member
 */
function openregio_is_pro($user_id = null) {
    return OpenRegio_Roles::user_has_pro_access($user_id);
}

/**
 * Get user plan
 */
function openregio_get_user_plan($user_id = null) {
    return OpenRegio_Roles::get_user_plan($user_id);
}

/**
 * Format price
 */
function openregio_format_price($amount) {
    return '€ ' . number_format((float)$amount, 2, ',', '.');
}

/**
 * Get categories
 */
function openregio_get_categories() {
    return array(
        'retail' => __('Retail', 'openregio'),
        'food' => __('Horeca & Food', 'openregio'),
        'services' => __('Dienstverlening', 'openregio'),
        'tech' => __('Tech & IT', 'openregio'),
        'health' => __('Zorg & Welzijn', 'openregio'),
        'education' => __('Onderwijs', 'openregio'),
        'construction' => __('Bouw', 'openregio'),
        'creative' => __('Creatief', 'openregio'),
        'other' => __('Overig', 'openregio'),
    );
}

/**
 * Get all OpenRegio members
 */
function openregio_get_members($args = array()) {
    $defaults = array(
        'role__in' => array('openregio_basic', 'openregio_pro'),
        'orderby' => 'registered',
        'order' => 'DESC'
    );
    
    $args = wp_parse_args($args, $defaults);
    
    return get_users($args);
}

/**
 * Check if current page requires authentication
 */
function openregio_requires_auth() {
    global $post;
    
    if (!$post) {
        return false;
    }
    
    $protected_shortcodes = array(
        'openregio_dashboard',
        'openregio_netwerk',
        'openregio_community',
        'openregio_chat',
        'openregio_regiobot',
        'openregio_onboarding'
    );
    
    foreach ($protected_shortcodes as $shortcode) {
        if (has_shortcode($post->post_content, $shortcode)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Redirect to login if needed
 */
function openregio_maybe_redirect_to_login() {
    if (openregio_requires_auth() && !is_user_logged_in()) {
        wp_redirect(wp_login_url(get_permalink()));
        exit;
    }
}
add_action('template_redirect', 'openregio_maybe_redirect_to_login');
