# OpenRegio WordPress Plugin

Complete WordPress plugin die je Replit OpenRegio platform functionaliteit omzet naar WordPress met Mollie betalingen, membership management en RegioBot AI.

## Functionaliteiten

### ✅ Betaalsysteem
- Mollie integratie voor eenmalige betalingen
- Automatische user creatie na betaling
- Basic (€9,95) en Pro (€19,95) lidmaatschappen
- Webhook voor payment confirmatie

### ✅ User Management
- Automatische WordPress user aanmaak
- Custom rollen: `openregio_basic` en `openregio_pro`
- Onboarding flow met wachtwoord reset
- Business profiel opslag in user meta

### ✅ Shortcodes
- `[openregio_home]` - Homepage met uitleg en prijzen
- `[openregio_start]` - Startflow met email + betaling
- `[openregio_onboarding]` - Onboarding formulier
- `[openregio_dashboard]` - Dashboard voor leden
- `[openregio_netwerk]` - Netwerk overzicht
- `[openregio_community]` - Community pagina
- `[openregio_chat]` - Chat functionaliteit
- `[openregio_regiobot]` - RegioBot AI (Pro-only)

### ✅ Admin Functionaliteit
- Instellingen pagina voor Mollie API, prijzen, email
- Leden overzicht met status
- Betalingen overzicht
- Complete member management

### ✅ Email Notificaties
- Welkom email met login gegevens
- Onboarding reminder
- Aanpasbare email templates

## Installatie

### 1. Upload Plugin

1. Download de hele `openregio` map
2. Upload naar `/wp-content/plugins/` op je WordPress installatie
3. Of zip de map en upload via WordPress Admin > Plugins > Add New

### 2. Installeer Dependencies

De plugin gebruikt de Mollie API library. Je hebt twee opties:

**Optie A: Met Composer (aanbevolen)**

```bash
cd wp-content/plugins/openregio
composer install
```

**Optie B: Handmatig**

1. Download [Mollie API PHP](https://github.com/mollie/mollie-api-php/releases)
2. Unzip in `wp-content/plugins/openregio/vendor/`

### 3. Activeer Plugin

1. Ga naar WordPress Admin > Plugins
2. Zoek "OpenRegio Platform"
3. Klik op "Activate"

De plugin maakt automatisch:
- Custom rollen (`openregio_basic`, `openregio_pro`)
- Database tabel voor pending payments
- Alle benodigde capabilities

### 4. Configureer Plugin

Ga naar **WordPress Admin > OpenRegio > Instellingen**

#### Mollie Instellingen
- **Mollie API Key**: Vul je Mollie API key in (test of live)
  - Verkrijg deze in je [Mollie Dashboard](https://www.mollie.com/dashboard)
  - Test key: `test_xxxxx`
  - Live key: `live_xxxxx`

#### Prijzen
- **Prijs Basic**: Standaard €9.95
- **Prijs Pro**: Standaard €19.95

#### Email Instellingen
- **Afzender Naam**: Bijvoorbeeld "OpenRegio"
- **Afzender Email**: Bijvoorbeeld `noreply@openregio.nl`

### 5. Maak Pagina's Aan

Maak de volgende WordPress pagina's aan met de shortcodes:

| Pagina | Shortcode | URL Slug |
|--------|-----------|----------|
| Home | `[openregio_home]` | `/` of `/openregio` |
| Start | `[openregio_start]` | `/start` |
| Onboarding | `[openregio_onboarding]` | `/onboarding` |
| Dashboard | `[openregio_dashboard]` | `/dashboard` |
| Netwerk | `[openregio_netwerk]` | `/netwerk` |
| Community | `[openregio_community]` | `/community` |
| Chat | `[openregio_chat]` | `/chat` |
| RegioBot | `[openregio_regiobot]` | `/regiobot` |

**Belangrijk**: De URL slugs moeten exact `/start` en `/onboarding` zijn, want die worden gebruikt in de payment flow!

### 6. Test de Flow

#### Test Mode (Aanbevolen)

1. Gebruik een Mollie **test** API key
2. Ga naar de home pagina
3. Klik op "Word lid" of "Word Pro"
4. Vul een email in
5. Je wordt doorgestuurd naar Mollie test payment
6. Gebruik test creditcard: `5555 5555 5555 4444`, vervaldatum: `12/25`, CVC: `123`
7. Na succesvolle betaling wordt de user aangemaakt en krijg je een email

#### Live Mode

1. Vervang test API key met **live** API key
2. Test met echte betaling
3. Monitor betalingen in Admin > OpenRegio > Betalingen

## Gebruik

### Voor Bezoekers

1. **Kies een plan** op de homepage
2. **Vul email in** op `/start?plan=basic` of `/start?plan=pro`
3. **Betaal via Mollie** - veilige betaling
4. **Ontvang email** met login gegevens
5. **Voltooi onboarding** - stel wachtwoord in en vul profiel in
6. **Toegang tot platform** - dashboard, netwerk, community, chat
7. **Pro leden** krijgen ook toegang tot RegioBot

### Voor Beheerders

**Leden Beheren**
- Ga naar Admin > OpenRegio > Leden
- Bekijk alle leden met status
- Zie wie onboarding heeft voltooid
- Edit user profiles

**Betalingen Monitoren**
- Ga naar Admin > OpenRegio > Betalingen
- Bekijk alle betalingen en hun status
- Zie pending, completed, failed, expired

**Instellingen Aanpassen**
- Ga naar Admin > OpenRegio > Instellingen
- Wijzig Mollie API key
- Pas prijzen aan
- Configureer email afzender

## Templates Aanpassen

Alle templates zijn bewust in een `/templates/` directory geplaatst zodat jij ze kunt aanpassen:

```
openregio/
├── templates/
│   ├── home.php              # Homepage met prijzen
│   ├── start.php             # Payment start flow
│   ├── onboarding.php        # Onboarding formulier
│   ├── dashboard.php         # Member dashboard
│   ├── network.php           # Netwerk overzicht
│   ├── community.php         # Community pagina
│   ├── chat.php              # Chat interface
│   ├── regiobot.php          # RegioBot AI
│   ├── upgrade-to-pro.php    # Upgrade banner
│   ├── emails/
│   │   ├── welcome.php       # Welkom email
│   │   └── onboarding-reminder.php
│   └── admin/
│       ├── members.php       # Admin leden overzicht
│       └── payments.php      # Admin betalingen overzicht
```

**Tip**: Kopieer een template naar je child theme om updates te overleven:
```
wp-content/themes/jouw-theme/openregio/templates/home.php
```

## Styling Aanpassen

De plugin gebruikt basis CSS in `assets/css/openregio.css`. Je kunt:

1. **Overschrijf styles** in je theme CSS
2. **Bewerk direct** `openregio/assets/css/openregio.css`
3. **Voeg toe** aan je theme en dequeue plugin CSS:

```php
// In je theme functions.php
function dequeue_openregio_styles() {
    wp_dequeue_style('openregio-styles');
}
add_action('wp_enqueue_scripts', 'dequeue_openregio_styles', 100);
```

## Mollie Webhook

De webhook URL is automatisch:
```
https://jouwsite.nl/?openregio_webhook=mollie
```

Deze wordt automatisch meegegeven bij het aanmaken van een payment. **Geen configuratie nodig!**

### Webhook Troubleshooting

Als de webhook niet werkt:

1. **Check permalink settings**: Ga naar Settings > Permalinks en klik "Save"
2. **Check error log**: Kijk in WordPress debug.log voor errors
3. **Test webhook**: In Mollie dashboard kun je webhooks testen
4. **Firewall**: Controleer of Mollie IPs niet geblokkeerd zijn

## Veiligheid

- ✅ Nonce verificatie op alle forms
- ✅ Sanitization van alle input
- ✅ Capability checks voor admin pages
- ✅ SQL queries via prepared statements
- ✅ Mollie webhook validatie
- ✅ Passwords via wp_generate_password()
- ✅ XSS protectie via esc_* functies

## Veelgestelde Vragen

### Kan ik recurring betalingen toevoegen?

Ja! De code is voorbereid op recurring. Je moet:
1. In `class-openregio-mollie.php` de payment method wijzigen naar `subscriptions->create()`
2. Een cron job toevoegen voor subscription management
3. Mollie Subscriptions API gebruiken

### Hoe upgrade ik een Basic naar Pro?

Momenteel moet je dit handmatig doen:
1. Ga naar Users > Select user
2. Wijzig role naar `openregio_pro`

Of bouw een upgrade flow met betaling.

### Werkt dit met WooCommerce?

Deze plugin is standalone, maar je kunt het combineren met WooCommerce door:
- WooCommerce products te maken voor Basic/Pro
- Na payment de user role aanpassen
- De OpenRegio shortcodes gebruiken voor content restrictions

### Hoe integreer ik RegioBot met echte AI?

De `templates/regiobot.php` heeft een placeholder. Integreer met:
- OpenAI API
- Je eigen AI backend
- Een WordPress AI plugin

Voeg AJAX endpoint toe in `classes/` en update het JavaScript.

## Support

Voor vragen of hulp:
- Email: support@openregio.nl
- GitHub: [Open een issue]
- Documentatie: https://docs.openregio.nl

## Licentie

GPL v2 or later

## Credits

Gebouwd voor OpenRegio - Het coöperatieve platform voor lokale ondernemers
