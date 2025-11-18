# OpenRegio WordPress Plugin - Snelle Installatie Gids

## 📦 Stap 1: Download en Upload

1. Download de complete `openregio` folder
2. Upload naar: `/wp-content/plugins/openregio/`
3. Of zip de folder en upload via WordPress Admin

## 🔧 Stap 2: Installeer Mollie Library

**Optie A: Met Composer (aanbevolen)**
```bash
cd wp-content/plugins/openregio
composer install
```

**Optie B: Zonder Composer**
1. Download: https://github.com/mollie/mollie-api-php/releases
2. Unzip in: `openregio/vendor/`

## ✅ Stap 3: Activeer Plugin

WordPress Admin > Plugins > Activeer "OpenRegio Platform"

## ⚙️ Stap 4: Configureer Settings

Ga naar: **Admin > OpenRegio > Instellingen**

### Mollie API Key
Haal deze op in je Mollie Dashboard:
- Test: `test_xxxxxxxxx`
- Live: `live_xxxxxxxxx`

### Prijzen
- Basic: €9.95
- Pro: €19.95

### Email
- Afzender naam: "OpenRegio"
- Afzender email: `noreply@jouwdomein.nl`

## 📄 Stap 5: Maak Pagina's

Maak deze WordPress pagina's met shortcodes:

| Pagina      | Shortcode                  | URL       |
|-------------|----------------------------|-----------|
| Home        | `[openregio_home]`         | `/`       |
| Start       | `[openregio_start]`        | `/start`  |
| Onboarding  | `[openregio_onboarding]`   | `/onboarding` |
| Dashboard   | `[openregio_dashboard]`    | `/dashboard` |
| Netwerk     | `[openregio_netwerk]`      | `/netwerk` |
| Community   | `[openregio_community]`    | `/community` |
| Chat        | `[openregio_chat]`         | `/chat` |
| RegioBot    | `[openregio_regiobot]`     | `/regiobot` |

**Let op**: URL slugs moeten exact `/start` en `/onboarding` zijn!

## 🧪 Stap 6: Test

1. Gebruik **test** API key van Mollie
2. Ga naar home pagina
3. Klik "Word lid - Basic"
4. Vul email in
5. Betaal met test card: `5555 5555 5555 4444`
6. Check email voor login gegevens
7. Login en voltooi onboarding

## ✅ Klaar!

Je OpenRegio platform draait nu op WordPress!

### Support
- Check `README.md` voor complete documentatie
- Email: support@openregio.nl

### Mollie Webhook
Automatisch ingesteld op: `https://jouwsite.nl/?openregio_webhook=mollie`

Geen extra configuratie nodig!
