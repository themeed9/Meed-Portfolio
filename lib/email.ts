const RESEND_API_URL = "https://api.resend.com/emails";

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  const from = process.env.RESEND_FROM_EMAIL || "Meed Portfolio <onboarding@resend.dev>";
  return { apiKey, from };
}

export async function sendContactNotification({
  name,
  email,
  subject,
  message,
  recipientEmail,
}: {
  name: string;
  email: string;
  subject: string | undefined | null;
  message: string;
  recipientEmail: string;
}) {
  const config = getResendConfig();
  if (!config) return;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: recipientEmail,
      subject: `Portfolio Contact: ${subject || "New Message"} from ${name}`,
      html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#333;">New Contact Message</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;font-weight:600;color:#555;">Name</td><td style="padding:8px 0;">${name}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;color:#555;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          ${subject ? `<tr><td style="padding:8px 0;font-weight:600;color:#555;">Subject</td><td style="padding:8px 0;">${subject}</td></tr>` : ""}
        </table>
        <div style="margin-top:16px;padding:16px;background:#f5f5f5;border-radius:8px;">
          <p style="margin:0;color:#333;white-space:pre-wrap;">${message}</p>
        </div>
        <hr style="margin-top:24px;border:none;border-top:1px solid #eee;" />
        <p style="font-size:12px;color:#999;">Sent from your portfolio contact form</p>
      </div>
    `,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send email notification: ${res.status}`);
  }
}
