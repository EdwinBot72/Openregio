<?php
/**
 * Template: Upgrade to Pro (shown to Basic users)
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

$settings = get_option('openregio_settings', array());
$price_pro = isset($settings['price_pro']) ? $settings['price_pro'] : '19.95';
?>

<div class="openregio-upgrade">
    <div class="openregio-upgrade-card">
        <h2><?php _e('Upgrade naar Pro', 'openregio'); ?></h2>
        <p class="openregio-upgrade-tagline">
            <?php _e('RegioBot is alleen beschikbaar voor Pro leden', 'openregio'); ?>
        </p>
        
        <div class="openregio-upgrade-benefits">
            <h3><?php _e('Met Pro krijg je:', 'openregio'); ?></h3>
            <ul>
                <li><?php _e('RegioBot AI marketing assistent', 'openregio'); ?></li>
                <li><?php _e('Automatische content generatie', 'openregio'); ?></li>
                <li><?php _e('SEO optimalisatie hulp', 'openregio'); ?></li>
                <li><?php _e('Marketing strategie advies', 'openregio'); ?></li>
                <li><?php _e('Prioriteit support', 'openregio'); ?></li>
            </ul>
        </div>
        
        <div class="openregio-upgrade-price">
            <p class="openregio-price-amount">
                <?php echo openregio_format_price($price_pro); ?>
                <span class="openregio-price-period"><?php _e('per maand', 'openregio'); ?></span>
            </p>
        </div>
        
        <a href="<?php echo home_url('/upgrade'); ?>" 
           class="openregio-button openregio-button-pro openregio-button-large">
            <?php _e('Upgrade naar Pro', 'openregio'); ?>
        </a>
        
        <p class="openregio-upgrade-note">
            <?php _e('Opzeggen kan altijd', 'openregio'); ?>
        </p>
    </div>
</div>
