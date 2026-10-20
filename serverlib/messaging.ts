/**
 * Outgoing messages for login codes (OTP): Email (SMTP) and WhatsApp (Meta WhatsApp Cloud API).
 *
 * EMAIL (any SMTP provider — Hostinger mail, Gmail app password, Zoho, Brevo...)
 *   SMTP_HOST=smtp.hostinger.com
 *   SMTP_PORT=465
 *   SMTP_SECURE=true
 *   SMTP_USER=no-reply@plushcomfort.uk
 *   SMTP_PASS=your-mailbox-password
 *   SMTP_FROM="Plush Comfort UK <no-reply@plushcomfort.uk>"
 *
 * WHATSAPP (Meta WhatsApp Cloud API — https://developers.facebook.com/docs/whatsapp/cloud-api)
 *   WHATSAPP_TOKEN=EAAG...            (permanent system-user token)
 *   WHATSAPP_PHONE_NUMBER_ID=1234567890
 *   WHATSAPP_OTP_TEMPLATE=login_code   (an approved "Authentication" template with one {{1}} code variable)
 *   WHATSAPP_TEMPLATE_LANG=en_GB
 */
import nodemailer from 'nodemailer';

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
  if (!isEmailConfigured()) throw new Error('Email (SMTP) is not configured on the server.');
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

export async function sendOtpEmail(to: string, code: string, purpose: 'login' | 'reset'): Promise<void> {
  const title = purpose === 'login' ? 'Your sign-in code' : 'Your password reset code';
  const action = purpose === 'login' ? 'sign in to the Plush Comfort staff portal' : 'reset your Plush Comfort master password';
  const text = `${title}: ${code}\n\nUse this code to ${action}. It expires in 10 minutes.\nIf you did not request this, you can ignore this email — your account is safe.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:460px;margin:auto;padding:24px;border:1px solid #E8E0D5;border-radius:16px">
    <h2 style="font-family:Georgia,serif;color:#221C18;margin:0 0 8px">${title}</h2>
    <p style="color:#5A4F46;font-size:14px">Use this code to ${action}:</p>
    <div style="font-size:32px;letter-spacing:8px;font-weight:700;color:#A25828;padding:12px 0">${code}</div>
    <p style="color:#8A786A;font-size:12px">The code expires in 10 minutes. If you did not request it, ignore this email.</p>
  </div>`;
  await sendEmail(to, `${title} — Plush Comfort UK`, text, html);
}

export async function sendOtpWhatsApp(phone: string, code: string): Promise<void> {
  if (!isWhatsAppConfigured()) throw new Error('WhatsApp Cloud API is not configured on the server.');
  const to = phone.replace(/[^0-9]/g, '');
  const template = process.env.WHATSAPP_OTP_TEMPLATE;
  const body = template
    ? {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en_GB' },
          components: [
            { type: 'body', parameters: [{ type: 'text', text: code }] },
            // Authentication templates with a "copy code" button need the code again here
            { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] },
          ],
        },
      }
    : {
        // Plain text only works inside a 24h customer-service window — use a template in production
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: `Plush Comfort sign-in code: ${code} (expires in 10 minutes)` },
      };
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${txt.slice(0, 300)}`);
  }
}

/** Google reCAPTCHA v2 ("I'm not a robot") server-side verification. */
export function isRecaptchaConfigured(): boolean {
  return Boolean(process.env.RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY);
}

export async function verifyRecaptcha(token: string | undefined, ip?: string): Promise<boolean> {
  if (!isRecaptchaConfigured()) return true; // not configured -> not enforced
  if (!token) return false;
  try {
    const params = new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY!, response: token });
    if (ip) params.set('remoteip', ip);
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data: any = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('[recaptcha] verification failed:', err);
    return false;
  }
}
