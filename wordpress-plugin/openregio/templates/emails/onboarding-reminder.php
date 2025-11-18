<?php
/**
 * Email Template: Onboarding reminder
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

$onboarding_url = home_url('/onboarding');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2c3e50; margin-top: 0;">Voltooi je OpenRegio profiel</h1>
        
        <p>Hoi <?php echo esc_html($user->display_name); ?>,</p>
        
        <p>
            We zien dat je je nog niet hebt aangemeld bij OpenRegio. 
            Voltooi je profiel om het meeste uit het platform te halen!
        </p>
        
        <h3>Waarom je profiel voltooien?</h3>
        <ul>
            <li>Andere ondernemers kunnen je vinden</li>
            <li>Je kunt netwerken met lokale bedrijven</li>
            <li>Toegang tot alle platform features</li>
            <li>Meedoen aan de coöperatie</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="<?php echo esc_url($onboarding_url); ?>" 
               style="display: inline-block; background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Profiel voltooien
            </a>
        </div>
        
        <p>Het duurt maar een paar minuten!</p>
        
        <p>Tot snel op het platform,</p>
        <p>Het OpenRegio team</p>
        
        <p style="color: #7f8c8d; font-size: 0.9em; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            Dit is een geautomatiseerde herinnering van OpenRegio.
        </p>
    </div>
</body>
</html>
