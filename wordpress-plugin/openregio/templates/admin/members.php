<?php
/**
 * Admin Template: Members overview
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

$members = openregio_get_members(array('number' => 999999));
?>

<div class="wrap">
    <h1><?php _e('OpenRegio Leden', 'openregio'); ?></h1>
    
    <div class="openregio-admin-stats">
        <div class="openregio-admin-stat-box">
            <h3><?php _e('Totaal leden', 'openregio'); ?></h3>
            <p class="openregio-stat-number"><?php echo count($members); ?></p>
        </div>
        
        <div class="openregio-admin-stat-box">
            <h3><?php _e('Basic leden', 'openregio'); ?></h3>
            <p class="openregio-stat-number">
                <?php echo count(openregio_get_members(array('role' => 'openregio_basic', 'number' => 999999))); ?>
            </p>
        </div>
        
        <div class="openregio-admin-stat-box">
            <h3><?php _e('Pro leden', 'openregio'); ?></h3>
            <p class="openregio-stat-number">
                <?php echo count(openregio_get_members(array('role' => 'openregio_pro', 'number' => 999999))); ?>
            </p>
        </div>
    </div>
    
    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th><?php _e('Naam', 'openregio'); ?></th>
                <th><?php _e('E-mail', 'openregio'); ?></th>
                <th><?php _e('Bedrijf', 'openregio'); ?></th>
                <th><?php _e('Plan', 'openregio'); ?></th>
                <th><?php _e('Onboarding', 'openregio'); ?></th>
                <th><?php _e('Lid sinds', 'openregio'); ?></th>
                <th><?php _e('Acties', 'openregio'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php if (!empty($members)): ?>
                <?php foreach ($members as $member): ?>
                    <?php 
                    $profile = OpenRegio_User::get_business_profile($member->ID);
                    $plan = OpenRegio_Roles::get_user_plan($member->ID);
                    $onboarding_done = OpenRegio_User::has_completed_onboarding($member->ID);
                    ?>
                    <tr>
                        <td><?php echo esc_html($member->display_name); ?></td>
                        <td><?php echo esc_html($member->user_email); ?></td>
                        <td><?php echo esc_html($profile['company_name'] ?: '-'); ?></td>
                        <td>
                            <span class="openregio-plan-badge openregio-plan-<?php echo esc_attr($plan); ?>">
                                <?php echo $plan === 'pro' ? 'Pro' : 'Basic'; ?>
                            </span>
                        </td>
                        <td>
                            <?php if ($onboarding_done): ?>
                                <span style="color: green;">✓ <?php _e('Voltooid', 'openregio'); ?></span>
                            <?php else: ?>
                                <span style="color: orange;">⏳ <?php _e('In afwachting', 'openregio'); ?></span>
                            <?php endif; ?>
                        </td>
                        <td><?php echo date_i18n(get_option('date_format'), strtotime($member->user_registered)); ?></td>
                        <td>
                            <a href="<?php echo get_edit_user_link($member->ID); ?>" class="button button-small">
                                <?php _e('Bewerken', 'openregio'); ?>
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="7"><?php _e('Nog geen leden.', 'openregio'); ?></td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<style>
.openregio-admin-stats {
    display: flex;
    gap: 20px;
    margin: 20px 0;
}
.openregio-admin-stat-box {
    background: #fff;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    flex: 1;
}
.openregio-admin-stat-box h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #666;
}
.openregio-stat-number {
    font-size: 32px;
    font-weight: bold;
    margin: 0;
}
.openregio-plan-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: bold;
}
.openregio-plan-basic {
    background: #e3f2fd;
    color: #1976d2;
}
.openregio-plan-pro {
    background: #f3e5f5;
    color: #7b1fa2;
}
</style>
