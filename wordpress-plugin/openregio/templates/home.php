<?php
/**
 * Template: Home page
 * Shortcode: [openregio_home]
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

$settings = get_option('openregio_settings', array());
$price_basic = isset($settings['price_basic']) ? $settings['price_basic'] : '9.95';
$price_pro = isset($settings['price_pro']) ? $settings['price_pro'] : '19.95';
?>

<div class="openregio-home">
    <div class="openregio-hero">
        <h1><?php _e('Welkom bij OpenRegio', 'openregio'); ?></h1>
        <p class="openregio-tagline">
            <?php _e('Het coöperatieve platform voor lokale ondernemers', 'openregio'); ?>
        </p>
    </div>
    
    <div class="openregio-intro">
        <h2><?php _e('Wat is OpenRegio?', 'openregio'); ?></h2>
        <p>
            <?php _e('OpenRegio is een democratisch platform dat lokale ondernemers samenbrengt. Wij bieden een alternatief voor Big Tech platforms, waar jij als ondernemer zelf de regie houdt.', 'openregio'); ?>
        </p>
        
        <h3><?php _e('Wat krijg je?', 'openregio'); ?></h3>
        <ul class="openregio-features">
            <li><?php _e('Zichtbaar bedrijfsprofiel in jouw regio', 'openregio'); ?></li>
            <li><?php _e('Netwerk van lokale ondernemers', 'openregio'); ?></li>
            <li><?php _e('Community voor kennisdeling', 'openregio'); ?></li>
            <li><?php _e('Chat met collega-ondernemers', 'openregio'); ?></li>
            <li><?php _e('Democratische medezeggenschap', 'openregio'); ?></li>
        </ul>
    </div>
    
    <div class="openregio-pricing">
        <h2><?php _e('Kies je lidmaatschap', 'openregio'); ?></h2>
        
        <div class="openregio-plans">
            <div class="openregio-plan openregio-plan-basic">
                <h3><?php _e('Basic', 'openregio'); ?></h3>
                <div class="openregio-price">
                    <?php echo openregio_format_price($price_basic); ?>
                    <span class="openregio-period"><?php _e('per maand', 'openregio'); ?></span>
                </div>
                <ul class="openregio-plan-features">
                    <li><?php _e('Bedrijfsprofiel', 'openregio'); ?></li>
                    <li><?php _e('Netwerk toegang', 'openregio'); ?></li>
                    <li><?php _e('Community forum', 'openregio'); ?></li>
                    <li><?php _e('Chat functie', 'openregio'); ?></li>
                    <li><?php _e('Stemrecht', 'openregio'); ?></li>
                </ul>
                <a href="<?php echo esc_url(add_query_arg('plan', 'basic', home_url('/start'))); ?>" 
                   class="openregio-button openregio-button-basic">
                    <?php _e('Word lid', 'openregio'); ?>
                </a>
            </div>
            
            <div class="openregio-plan openregio-plan-pro openregio-plan-featured">
                <div class="openregio-badge"><?php _e('Populair', 'openregio'); ?></div>
                <h3><?php _e('Pro', 'openregio'); ?></h3>
                <div class="openregio-price">
                    <?php echo openregio_format_price($price_pro); ?>
                    <span class="openregio-period"><?php _e('per maand', 'openregio'); ?></span>
                </div>
                <ul class="openregio-plan-features">
                    <li><?php _e('Alles van Basic', 'openregio'); ?></li>
                    <li><strong><?php _e('RegioBot AI assistent', 'openregio'); ?></strong></li>
                    <li><?php _e('Content generatie', 'openregio'); ?></li>
                    <li><?php _e('SEO optimalisatie', 'openregio'); ?></li>
                    <li><?php _e('Marketing advies', 'openregio'); ?></li>
                </ul>
                <a href="<?php echo esc_url(add_query_arg('plan', 'pro', home_url('/start'))); ?>" 
                   class="openregio-button openregio-button-pro">
                    <?php _e('Word Pro', 'openregio'); ?>
                </a>
            </div>
        </div>
    </div>
    
    <div class="openregio-cta">
        <p>
            <?php _e('Heb je al een account?', 'openregio'); ?>
            <a href="<?php echo wp_login_url(); ?>"><?php _e('Log hier in', 'openregio'); ?></a>
        </p>
    </div>
</div>
