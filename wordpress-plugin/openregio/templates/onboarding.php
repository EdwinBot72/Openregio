<?php
/**
 * Template: Onboarding
 * Shortcode: [openregio_onboarding]
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

$user_id = get_current_user_id();
$user = get_userdata($user_id);
$plan = OpenRegio_Roles::get_user_plan($user_id);
$categories = openregio_get_categories();
?>

<div class="openregio-onboarding">
    <h1><?php _e('Welkom bij OpenRegio!', 'openregio'); ?></h1>
    <p class="openregio-subtitle">
        <?php _e('Laten we je profiel compleet maken', 'openregio'); ?>
    </p>
    
    <form method="post" class="openregio-onboarding-form">
        <?php wp_nonce_field('openregio_onboarding', 'openregio_onboarding_nonce'); ?>
        
        <div class="openregio-form-section">
            <h2><?php _e('1. Kies een nieuw wachtwoord', 'openregio'); ?></h2>
            <p><?php _e('Je hebt een tijdelijk wachtwoord ontvangen. Kies hier je eigen wachtwoord.', 'openregio'); ?></p>
            
            <div class="openregio-form-group">
                <label for="new_password"><?php _e('Nieuw wachtwoord', 'openregio'); ?></label>
                <input type="password" 
                       id="new_password" 
                       name="new_password" 
                       required
                       minlength="8">
                <p class="openregio-form-help">
                    <?php _e('Minimaal 8 karakters', 'openregio'); ?>
                </p>
            </div>
        </div>
        
        <div class="openregio-form-section">
            <h2><?php _e('2. Jouw bedrijfsgegevens', 'openregio'); ?></h2>
            
            <div class="openregio-form-group">
                <label for="company_name"><?php _e('Bedrijfsnaam', 'openregio'); ?></label>
                <input type="text" 
                       id="company_name" 
                       name="company_name" 
                       required>
            </div>
            
            <div class="openregio-form-group">
                <label for="category"><?php _e('Categorie', 'openregio'); ?></label>
                <select id="category" name="category" required>
                    <option value=""><?php _e('Kies een categorie', 'openregio'); ?></option>
                    <?php foreach ($categories as $value => $label): ?>
                    <option value="<?php echo esc_attr($value); ?>">
                        <?php echo esc_html($label); ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="openregio-form-group">
                <label for="bio"><?php _e('Beschrijving', 'openregio'); ?></label>
                <textarea id="bio" 
                          name="bio" 
                          rows="5"
                          placeholder="<?php esc_attr_e('Vertel iets over je bedrijf...', 'openregio'); ?>"></textarea>
                <p class="openregio-form-help">
                    <?php _e('Deze tekst is zichtbaar op je profiel', 'openregio'); ?>
                </p>
            </div>
        </div>
        
        <div class="openregio-form-actions">
            <button type="submit" name="openregio_onboarding_submit" class="openregio-button openregio-button-primary">
                <?php _e('Opslaan en doorgaan', 'openregio'); ?>
            </button>
        </div>
    </form>
</div>
