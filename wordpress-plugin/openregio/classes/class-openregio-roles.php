<?php
/**
 * User roles management
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

class OpenRegio_Roles {
    
    /**
     * Create custom roles
     */
    public static function create_roles() {
        // Basic member role
        add_role(
            'openregio_basic',
            __('OpenRegio Basic', 'openregio'),
            array(
                'read' => true,
                'edit_posts' => false,
                'delete_posts' => false,
                'openregio_access_platform' => true,
                'openregio_access_dashboard' => true,
                'openregio_access_network' => true,
                'openregio_access_community' => true,
                'openregio_access_chat' => true,
            )
        );
        
        // Pro member role
        add_role(
            'openregio_pro',
            __('OpenRegio Pro', 'openregio'),
            array(
                'read' => true,
                'edit_posts' => false,
                'delete_posts' => false,
                'openregio_access_platform' => true,
                'openregio_access_dashboard' => true,
                'openregio_access_network' => true,
                'openregio_access_community' => true,
                'openregio_access_chat' => true,
                'openregio_access_regiobot' => true,
            )
        );
    }
    
    /**
     * Remove custom roles
     */
    public static function remove_roles() {
        remove_role('openregio_basic');
        remove_role('openregio_pro');
    }
    
    /**
     * Check if user has access to platform
     */
    public static function user_has_platform_access($user_id = null) {
        if (!$user_id) {
            $user_id = get_current_user_id();
        }
        
        if (!$user_id) {
            return false;
        }
        
        $user = get_userdata($user_id);
        if (!$user) {
            return false;
        }
        
        return in_array('openregio_basic', $user->roles) || 
               in_array('openregio_pro', $user->roles) ||
               in_array('administrator', $user->roles);
    }
    
    /**
     * Check if user has Pro access
     */
    public static function user_has_pro_access($user_id = null) {
        if (!$user_id) {
            $user_id = get_current_user_id();
        }
        
        if (!$user_id) {
            return false;
        }
        
        $user = get_userdata($user_id);
        if (!$user) {
            return false;
        }
        
        return in_array('openregio_pro', $user->roles) ||
               in_array('administrator', $user->roles);
    }
    
    /**
     * Get user plan
     */
    public static function get_user_plan($user_id = null) {
        if (!$user_id) {
            $user_id = get_current_user_id();
        }
        
        if (!$user_id) {
            return null;
        }
        
        $user = get_userdata($user_id);
        if (!$user) {
            return null;
        }
        
        if (in_array('openregio_pro', $user->roles)) {
            return 'pro';
        } elseif (in_array('openregio_basic', $user->roles)) {
            return 'basic';
        }
        
        return null;
    }
}
