<?php
/**
 * Template: Dashboard
 * Shortcode: [openregio_dashboard]
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

$user_id = get_current_user_id();
$user = get_userdata($user_id);
$plan = OpenRegio_Roles::get_user_plan($user_id);
$profile = OpenRegio_User::get_business_profile($user_id);

// Get statistics
$total_members = count(openregio_get_members());
$basic_members = count(openregio_get_members(array('role' => 'openregio_basic')));
$pro_members = count(openregio_get_members(array('role' => 'openregio_pro')));
?>

<div class="openregio-dashboard">
    <div class="openregio-dashboard-header">
        <h1><?php printf(__('Welkom, %s', 'openregio'), esc_html($user->display_name)); ?></h1>
        <p class="openregio-plan-badge openregio-plan-<?php echo esc_attr($plan); ?>">
            <?php echo $plan === 'pro' ? __('Pro Lid', 'openregio') : __('Basic Lid', 'openregio'); ?>
        </p>
    </div>
    
    <div class="openregio-dashboard-stats">
        <div class="openregio-stat-card">
            <h3><?php _e('Totaal leden', 'openregio'); ?></h3>
            <p class="openregio-stat-number"><?php echo number_format($total_members, 0, ',', '.'); ?></p>
        </div>
        
        <div class="openregio-stat-card">
            <h3><?php _e('Basic leden', 'openregio'); ?></h3>
            <p class="openregio-stat-number"><?php echo number_format($basic_members, 0, ',', '.'); ?></p>
        </div>
        
        <div class="openregio-stat-card">
            <h3><?php _e('Pro leden', 'openregio'); ?></h3>
            <p class="openregio-stat-number"><?php echo number_format($pro_members, 0, ',', '.'); ?></p>
        </div>
    </div>
    
    <div class="openregio-dashboard-content">
        <div class="openregio-dashboard-main">
            <div class="openregio-card">
                <h2><?php _e('Jouw profiel', 'openregio'); ?></h2>
                
                <?php if (!empty($profile['company_name'])): ?>
                <div class="openregio-profile-summary">
                    <p><strong><?php echo esc_html($profile['company_name']); ?></strong></p>
                    
                    <?php if (!empty($profile['category'])): ?>
                    <p class="openregio-category">
                        <?php 
                        $categories = openregio_get_categories();
                        echo isset($categories[$profile['category']]) 
                            ? esc_html($categories[$profile['category']]) 
                            : esc_html($profile['category']); 
                        ?>
                    </p>
                    <?php endif; ?>
                    
                    <?php if (!empty($profile['bio'])): ?>
                    <p><?php echo esc_html($profile['bio']); ?></p>
                    <?php endif; ?>
                </div>
                <?php else: ?>
                <p><?php _e('Je hebt je profiel nog niet ingevuld.', 'openregio'); ?></p>
                <?php endif; ?>
                
                <a href="<?php echo home_url('/onboarding'); ?>" class="openregio-button">
                    <?php _e('Profiel bewerken', 'openregio'); ?>
                </a>
            </div>
            
            <div class="openregio-card">
                <h2><?php _e('Snelle links', 'openregio'); ?></h2>
                <ul class="openregio-quick-links">
                    <li><a href="<?php echo home_url('/netwerk'); ?>"><?php _e('Ontdek het netwerk', 'openregio'); ?></a></li>
                    <li><a href="<?php echo home_url('/community'); ?>"><?php _e('Ga naar community', 'openregio'); ?></a></li>
                    <li><a href="<?php echo home_url('/chat'); ?>"><?php _e('Start een gesprek', 'openregio'); ?></a></li>
                    <?php if ($plan === 'pro'): ?>
                    <li><a href="<?php echo home_url('/regiobot'); ?>"><?php _e('Open RegioBot', 'openregio'); ?></a></li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
        
        <div class="openregio-dashboard-sidebar">
            <?php if ($plan === 'basic'): ?>
            <div class="openregio-card openregio-upgrade-card">
                <h3><?php _e('Upgrade naar Pro', 'openregio'); ?></h3>
                <p><?php _e('Krijg toegang tot RegioBot en nog veel meer!', 'openregio'); ?></p>
                <a href="<?php echo home_url('/upgrade'); ?>" class="openregio-button openregio-button-pro">
                    <?php _e('Upgrade nu', 'openregio'); ?>
                </a>
            </div>
            <?php endif; ?>
            
            <div class="openregio-card">
                <h3><?php _e('Laatste nieuws', 'openregio'); ?></h3>
                <p><?php _e('Binnenkort meer updates!', 'openregio'); ?></p>
            </div>
        </div>
    </div>
</div>
