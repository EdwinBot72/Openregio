<?php
/**
 * Email Template: Welcome email
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

$onboarding_url = home_url('/onboarding');
$login_url = wp_login_url();
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2c3e50; margin-top: 0;">
            Welkom bij OpenRegio<?php echo $plan === 'pro' ? ' Pro' : ''; ?>! 🎉
        </h1>
        
        <p>Hoi <?php echo esc_html($user->display_name); ?>,</p>
        
        <p>
            Je betaling is succesvol verwerkt en je account is aangemaakt! 
            Welkom in de OpenRegio community van lokale ondernemers.
        </p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Je login gegevens:</h2>
            <p>
                <strong>E-mail:</strong> <?php echo esc_html($user->user_email); ?><br>
                <strong>Gebruikersnaam:</strong> <?php echo esc_html($user->user_login); ?><br>
                <strong>Tijdelijk wachtwoord:</strong> <code style="background-color: #f8f9fa; padding: 5px 10px; border-radius: 3px;"><?php echo esc_html($temp_password); ?></code>
            </p>
        </div>
        
        <h3>Volgende stappen:</h3>
        <ol>
            <li>Klik op de knop hieronder om je profiel compleet te maken</li>
            <li>Kies een nieuw wachtwoord (veiliger dan het tijdelijke wachtwoord)</li>
            <li>Vul je bedrijfsgegevens in</li>
            <li>Ontdek het platform!</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="<?php echo esc_url($onboarding_url); ?>" 
               style="display: inline-block; background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Start met onboarding
            </a>
        </div>
        
        <?php if ($plan === 'pro'): ?>
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">🤖 RegioBot is beschikbaar!</h3>
            <p>
                Als Pro lid heb je direct toegang tot RegioBot, je AI marketing assistent. 
                RegioBot helpt je met content creatie, SEO tips en marketing strategie.
            </p>
        </div>
        <?php endif; ?>
        
        <p>
            Heb je vragen? Neem gerust contact met ons op. We helpen je graag verder!
        </p>
        
        <p>
            Succes en welkom in de OpenRegio community!
        </p>
        
        <p style="color: #7f8c8d; font-size: 0.9em; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            Dit is een geautomatiseerde e-mail van OpenRegio.<br>
            Je ontvangt deze omdat je je hebt aangemeld voor een lidmaatschap.
        </p>
    </div>
</body>
</html>
