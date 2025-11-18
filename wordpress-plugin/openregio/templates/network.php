<?php
/**
 * Template: Network
 * Shortcode: [openregio_netwerk]
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

$members = openregio_get_members();
$categories = openregio_get_categories();
?>

<div class="openregio-network">
    <h1><?php _e('Netwerk', 'openregio'); ?></h1>
    <p class="openregio-subtitle">
        <?php printf(__('Ontdek %d ondernemers in jouw regio', 'openregio'), count($members)); ?>
    </p>
    
    <div class="openregio-network-filters">
        <input type="text" 
               id="openregio-search" 
               placeholder="<?php esc_attr_e('Zoek op naam of bedrijf...', 'openregio'); ?>"
               class="openregio-search-input">
        
        <select id="openregio-filter-category" class="openregio-filter-select">
            <option value=""><?php _e('Alle categorieën', 'openregio'); ?></option>
            <?php foreach ($categories as $value => $label): ?>
            <option value="<?php echo esc_attr($value); ?>">
                <?php echo esc_html($label); ?>
            </option>
            <?php endforeach; ?>
        </select>
    </div>
    
    <div class="openregio-network-grid">
        <?php if (!empty($members)): ?>
            <?php foreach ($members as $member): ?>
                <?php 
                $profile = OpenRegio_User::get_business_profile($member->ID);
                $plan = OpenRegio_Roles::get_user_plan($member->ID);
                ?>
                <div class="openregio-member-card" 
                     data-category="<?php echo esc_attr($profile['category']); ?>">
                    <div class="openregio-member-header">
                        <h3><?php echo esc_html($profile['company_name'] ?: $member->display_name); ?></h3>
                        <?php if ($plan === 'pro'): ?>
                        <span class="openregio-pro-badge"><?php _e('Pro', 'openregio'); ?></span>
                        <?php endif; ?>
                    </div>
                    
                    <?php if (!empty($profile['category'])): ?>
                    <p class="openregio-member-category">
                        <?php echo isset($categories[$profile['category']]) 
                            ? esc_html($categories[$profile['category']]) 
                            : esc_html($profile['category']); ?>
                    </p>
                    <?php endif; ?>
                    
                    <?php if (!empty($profile['bio'])): ?>
                    <p class="openregio-member-bio">
                        <?php echo esc_html(wp_trim_words($profile['bio'], 20)); ?>
                    </p>
                    <?php endif; ?>
                    
                    <div class="openregio-member-actions">
                        <a href="<?php echo home_url('/chat?user=' . $member->ID); ?>" 
                           class="openregio-button openregio-button-small">
                            <?php _e('Bericht sturen', 'openregio'); ?>
                        </a>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p><?php _e('Er zijn nog geen leden in het netwerk.', 'openregio'); ?></p>
        <?php endif; ?>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Simple search and filter
    $('#openregio-search, #openregio-filter-category').on('input change', function() {
        var searchTerm = $('#openregio-search').val().toLowerCase();
        var category = $('#openregio-filter-category').val();
        
        $('.openregio-member-card').each(function() {
            var $card = $(this);
            var text = $card.text().toLowerCase();
            var cardCategory = $card.data('category');
            
            var matchesSearch = searchTerm === '' || text.indexOf(searchTerm) > -1;
            var matchesCategory = category === '' || cardCategory === category;
            
            if (matchesSearch && matchesCategory) {
                $card.show();
            } else {
                $card.hide();
            }
        });
    });
});
</script>
