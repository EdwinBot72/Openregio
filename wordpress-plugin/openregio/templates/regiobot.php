<?php
/**
 * Template: RegioBot (Pro only)
 * Shortcode: [openregio_regiobot]
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

$user_id = get_current_user_id();
$profile = OpenRegio_User::get_business_profile($user_id);
?>

<div class="openregio-regiobot">
    <h1><?php _e('RegioBot', 'openregio'); ?></h1>
    <p class="openregio-subtitle">
        <?php _e('Je AI marketing assistent', 'openregio'); ?>
    </p>
    
    <div class="openregio-regiobot-container">
        <div class="openregio-card">
            <h2><?php _e('Chat met RegioBot', 'openregio'); ?></h2>
            <p><?php _e('RegioBot is je persoonlijke AI assistent voor marketing en content creatie.', 'openregio'); ?></p>
            
            <div class="openregio-regiobot-chat">
                <div id="openregio-chat-messages" class="openregio-chat-messages">
                    <div class="openregio-chat-message openregio-chat-bot">
                        <p><?php printf(
                            __('Hoi! Ik ben RegioBot, je AI marketing assistent. Hoe kan ik je helpen met %s?', 'openregio'),
                            esc_html($profile['company_name'] ?: __('je bedrijf', 'openregio'))
                        ); ?></p>
                    </div>
                </div>
                
                <form id="openregio-chat-form" class="openregio-chat-form">
                    <textarea id="openregio-chat-input" 
                              placeholder="<?php esc_attr_e('Stel een vraag...', 'openregio'); ?>"
                              rows="3"></textarea>
                    <button type="submit" class="openregio-button openregio-button-primary">
                        <?php _e('Verstuur', 'openregio'); ?>
                    </button>
                </form>
            </div>
            
            <div class="openregio-regiobot-suggestions">
                <p><strong><?php _e('Vraag bijvoorbeeld:', 'openregio'); ?></strong></p>
                <ul>
                    <li><?php _e('Schrijf een social media post voor mijn bedrijf', 'openregio'); ?></li>
                    <li><?php _e('Geef me tips voor lokale SEO', 'openregio'); ?></li>
                    <li><?php _e('Help me met een nieuwsbrief tekst', 'openregio'); ?></li>
                    <li><?php _e('Wat zijn goede marketing kanalen voor mijn sector?', 'openregio'); ?></li>
                </ul>
            </div>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    $('#openregio-chat-form').on('submit', function(e) {
        e.preventDefault();
        
        var message = $('#openregio-chat-input').val().trim();
        if (!message) return;
        
        // Add user message
        $('#openregio-chat-messages').append(
            '<div class="openregio-chat-message openregio-chat-user"><p>' + 
            $('<div>').text(message).html() + 
            '</p></div>'
        );
        
        // Clear input
        $('#openregio-chat-input').val('');
        
        // Scroll to bottom
        $('#openregio-chat-messages').scrollTop($('#openregio-chat-messages')[0].scrollHeight);
        
        // TODO: Integrate with actual AI API
        // For now, show a placeholder response
        setTimeout(function() {
            $('#openregio-chat-messages').append(
                '<div class="openregio-chat-message openregio-chat-bot"><p>' +
                '<?php _e('RegioBot AI integratie moet nog geconfigureerd worden in je WordPress omgeving.', 'openregio'); ?>' +
                '</p></div>'
            );
            $('#openregio-chat-messages').scrollTop($('#openregio-chat-messages')[0].scrollHeight);
        }, 500);
    });
});
</script>
