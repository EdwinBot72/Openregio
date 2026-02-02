import * as postmark from 'postmark';

const POSTMARK_API_KEY = process.env.POSTMARK_API_KEY;
const FROM_EMAIL = 'OpenRegio <info@openregio.nl>';
const BASE_URL = process.env.APP_BASE_URL || 'https://openregio.replit.app';

let client: postmark.ServerClient | null = null;

if (POSTMARK_API_KEY) {
  client = new postmark.ServerClient(POSTMARK_API_KEY);
  console.log('[Email] Postmark client initialized');
} else {
  console.warn('[Email] POSTMARK_API_KEY not set - emails will not be sent');
}

async function sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
  if (!client) {
    console.error('[Email] Postmark client not initialized');
    return false;
  }

  try {
    const result = await client.sendEmail({
      From: FROM_EMAIL,
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log(`[Email] Sent to ${to}: ${subject} (MessageID: ${result.MessageID})`);
    return true;
  } catch (error: any) {
    console.error(`[Email] Failed to send to ${to}:`, error.message || error);
    return false;
  }
}

export async function sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Welkom bij OpenRegio!</h1>
        </div>
        <div class="content">
          <p>Beste ${firstName || 'ondernemer'},</p>
          <p>Welkom bij OpenRegio - het coöperatieve platform voor regionale ondernemers!</p>
          <p>Je bent nu onderdeel van een groeiend netwerk van lokale ondernemers die samen sterker staan. Dit is wat je kunt verwachten:</p>
          <ul>
            <li><strong>RegioMarkt</strong> - Werk delen binnen je regio</li>
            <li><strong>Netwerken</strong> - Verbind met ondernemers bij jou in de buurt</li>
            <li><strong>AI-tools</strong> - Slimme ondersteuning voor je bedrijf</li>
            <li><strong>Democratisch bestuur</strong> - Jouw stem telt mee</li>
          </ul>
          <p style="text-align: center;">
            <a href="${BASE_URL}/dashboard" class="button" style="color: white;">Ga naar je Dashboard</a>
          </p>
          <p>Heb je vragen? Neem gerust contact met ons op via info@openregio.nl.</p>
          <p>Met vriendelijke groet,<br>Het OpenRegio Team</p>
        </div>
        <div class="footer">
          <p>OpenRegio - Werk blijft in de regio</p>
          <p>Je ontvangt deze e-mail omdat je lid bent geworden van OpenRegio.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, 'Welkom bij OpenRegio!', html);
}

export async function sendOnboardingEmail(to: string, tempPassword: string, onboardingLink: string, plan: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .credentials { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .credential-item { margin: 10px 0; }
        .credential-label { color: #6b7280; font-size: 14px; }
        .credential-value { font-family: monospace; font-size: 16px; font-weight: 600; color: #1a1a1a; background: white; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 4px; }
        .plan-badge { display: inline-block; background: ${plan === 'pro' ? '#8b5cf6' : '#10b981'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Welkom bij OpenRegio!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Je betaling is ontvangen</p>
        </div>
        <div class="content">
          <p>Beste ondernemer,</p>
          <p>Gefeliciteerd! Je bent nu officieel lid van OpenRegio als <span class="plan-badge">${plan === 'pro' ? 'Pro-bijdrager' : 'Basis-lid'}</span>.</p>
          
          <div class="credentials">
            <p style="margin: 0 0 15px 0; font-weight: 600;">Je inloggegevens:</p>
            <div class="credential-item">
              <div class="credential-label">E-mailadres</div>
              <div class="credential-value">${to}</div>
            </div>
            <div class="credential-item">
              <div class="credential-label">Tijdelijk wachtwoord</div>
              <div class="credential-value">${tempPassword}</div>
            </div>
          </div>

          <p><strong>Volgende stap:</strong> Klik op de onderstaande knop om je profiel te voltooien en een eigen wachtwoord in te stellen.</p>
          
          <p style="text-align: center;">
            <a href="${onboardingLink}" class="button" style="color: white;">Activeer je Account</a>
          </p>

          <p style="font-size: 14px; color: #6b7280;">Deze link is 7 dagen geldig. Bewaar je tijdelijke wachtwoord totdat je een nieuw wachtwoord hebt ingesteld.</p>
          
          <p>Heb je vragen? Neem gerust contact met ons op via info@openregio.nl.</p>
          <p>Met vriendelijke groet,<br>Het OpenRegio Team</p>
        </div>
        <div class="footer">
          <p>OpenRegio - Werk blijft in de regio</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, 'Welkom bij OpenRegio - Je account is klaar!', html);
}

export async function sendPasswordResetEmail(to: string, resetToken: string, firstName: string): Promise<boolean> {
  const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Wachtwoord Herstellen</h1>
        </div>
        <div class="content">
          <p>Beste ${firstName || 'ondernemer'},</p>
          <p>Je hebt een verzoek ingediend om je wachtwoord te herstellen. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button" style="color: white;">Wachtwoord Herstellen</a>
          </p>
          <div class="warning">
            <strong>Let op:</strong> Deze link is 1 uur geldig. Heb je geen wachtwoordherstel aangevraagd? Negeer dan deze e-mail.
          </div>
          <p>Met vriendelijke groet,<br>Het OpenRegio Team</p>
        </div>
        <div class="footer">
          <p>OpenRegio - Werk blijft in de regio</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, 'Wachtwoord herstellen - OpenRegio', html);
}

export async function sendNotificationEmail(to: string, subject: string, message: string, firstName: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">${subject}</h1>
        </div>
        <div class="content">
          <p>Beste ${firstName || 'ondernemer'},</p>
          <p>${message}</p>
          <p style="text-align: center;">
            <a href="${BASE_URL}/dashboard" class="button" style="color: white;">Bekijk in Dashboard</a>
          </p>
          <p>Met vriendelijke groet,<br>Het OpenRegio Team</p>
        </div>
        <div class="footer">
          <p>OpenRegio - Werk blijft in de regio</p>
          <p><a href="${BASE_URL}/privacy-dashboard" style="color: #6b7280;">E-mailvoorkeuren beheren</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, `${subject} - OpenRegio`, html);
}

export async function sendNewsletterEmail(to: string, subject: string, content: string, firstName: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">OpenRegio Nieuwsbrief</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${subject}</p>
        </div>
        <div class="content">
          <p>Beste ${firstName || 'ondernemer'},</p>
          ${content}
          <p style="text-align: center;">
            <a href="${BASE_URL}" class="button" style="color: white;">Bezoek OpenRegio</a>
          </p>
          <p>Met vriendelijke groet,<br>Het OpenRegio Team</p>
        </div>
        <div class="footer">
          <p>OpenRegio - Werk blijft in de regio</p>
          <p><a href="${BASE_URL}/privacy-dashboard" style="color: #6b7280;">Uitschrijven van nieuwsbrief</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, `${subject} - OpenRegio Nieuwsbrief`, html);
}

export async function testEmailConnection(): Promise<boolean> {
  if (!client) {
    console.error('[Email] Postmark client not initialized');
    return false;
  }
  
  try {
    const server = await client.getServer();
    console.log(`[Email] Postmark connection verified - Server: ${server.Name}`);
    return true;
  } catch (error: any) {
    console.error('[Email] Postmark connection failed:', error.message || error);
    return false;
  }
}

export async function sendTestEmail(to: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Test E-mail</h1>
        </div>
        <div class="content">
          <p>Dit is een test e-mail van OpenRegio via Postmark.</p>
          <p>Als je deze e-mail ontvangt, werkt de e-mail configuratie correct!</p>
          <p>Met vriendelijke groet,<br>Het OpenRegio Team</p>
        </div>
        <div class="footer">
          <p>OpenRegio - Werk blijft in de regio</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, 'OpenRegio Test E-mail', html);
}
