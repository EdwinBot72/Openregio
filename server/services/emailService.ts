import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.soverin.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'info@openregio.nl',
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || 'OpenRegio <info@openregio.nl>';
const BASE_URL = process.env.APP_BASE_URL || 'https://openregio.nl';

export async function sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: 'Welkom bij OpenRegio!',
      html: `
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
                <a href="https://openregio.nl/dashboard" class="button" style="color: white;">Ga naar je Dashboard</a>
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
      `,
    });
    console.log(`Welcome email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(to: string, resetToken: string, firstName: string): Promise<boolean> {
  const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;
  
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: 'Wachtwoord herstellen - OpenRegio',
      html: `
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
      `,
    });
    console.log(`Password reset email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

export async function sendNotificationEmail(to: string, subject: string, message: string, firstName: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: `${subject} - OpenRegio`,
      html: `
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
                <a href="https://openregio.nl/dashboard" class="button" style="color: white;">Bekijk in Dashboard</a>
              </p>
              <p>Met vriendelijke groet,<br>Het OpenRegio Team</p>
            </div>
            <div class="footer">
              <p>OpenRegio - Werk blijft in de regio</p>
              <p><a href="https://openregio.nl/privacy-dashboard" style="color: #6b7280;">E-mailvoorkeuren beheren</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Notification email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
}

export async function sendNewsletterEmail(to: string, subject: string, content: string, firstName: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: `${subject} - OpenRegio Nieuwsbrief`,
      html: `
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
                <a href="https://openregio.nl" class="button" style="color: white;">Bezoek OpenRegio</a>
              </p>
              <p>Met vriendelijke groet,<br>Het OpenRegio Team</p>
            </div>
            <div class="footer">
              <p>OpenRegio - Werk blijft in de regio</p>
              <p><a href="https://openregio.nl/privacy-dashboard" style="color: #6b7280;">Uitschrijven van nieuwsbrief</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Newsletter sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Failed to send newsletter:', error);
    return false;
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
}
