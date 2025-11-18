<?php
/**
 * Template: Start flow (payment)
 * Shortcode: [openregio_start]
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

$plan = isset($_GET['plan']) && in_array($_GET['plan'], array('basic', 'pro')) 
    ? sanitize_text_field($_GET['plan']) 
    : 'basic';

$settings = get_option('openregio_settings', array());
$price = $plan === 'pro' 
    ? (isset($settings['price_pro']) ? $settings['price_pro'] : '19.95')
    : (isset($settings['price_basic']) ? $settings['price_basic'] : '9.95');

$plan_name = $plan === 'pro' ? __('Pro', 'openregio') : __('Basic', 'openregio');

// Check for errors
$error = apply_filters('openregio_error', '');
?>

<div class="openregio-start">
    <h1><?php printf(__('Word %s lid', 'openregio'), $plan_name); ?></h1>
    
    <div class="openregio-start-summary">
        <h2><?php _e('Je keuze:', 'openregio'); ?></h2>
        <p class="openregio-plan-name">OpenRegio <?php echo esc_html($plan_name); ?></p>
        <p class="openregio-plan-price"><?php echo openregio_format_price($price); ?> <?php _e('per maand', 'openregio'); ?></p>
        
        <?php if ($plan === 'pro'): ?>
        <p class="openregio-plan-note">
            <?php _e('Inclusief RegioBot AI assistent', 'openregio'); ?>
        </p>
        <?php endif; ?>
    </div>
    
    <?php if (!empty($error)): ?>
    <div class="openregio-error">
        <?php echo esc_html($error); ?>
    </div>
    <?php endif; ?>
    
    <form method="post" class="openregio-start-form">
        <?php wp_nonce_field('openregio_start', 'openregio_start_nonce'); ?>
        <input type="hidden" name="plan" value="<?php echo esc_attr($plan); ?>">
        
        <div class="openregio-form-group">
            <label for="email"><?php _e('E-mailadres', 'openregio'); ?></label>
            <input type="email" 
                   id="email" 
                   name="email" 
                   required
                   placeholder="<?php esc_attr_e('je@email.nl', 'openregio'); ?>">
            <p class="openregio-form-help">
                <?php _e('We sturen je login gegevens naar dit adres', 'openregio'); ?>
            </p>
        </div>
        
        <div class="openregio-form-group">
            <button type="submit" name="openregio_start_submit" class="openregio-button openregio-button-primary">
                <?php printf(__('Betaal %s en word lid', 'openregio'), openregio_format_price($price)); ?>
            </button>
        </div>
        
        <p class="openregio-payment-info">
            <?php _e('Je wordt doorgestuurd naar Mollie voor een veilige betaling.', 'openregio'); ?>
        </p>
    </form>
    
    <p class="openregio-back-link">
        <a href="<?php echo home_url(); ?>">&larr; <?php _e('Terug naar home', 'openregio'); ?></a>
    </p>
</div>
