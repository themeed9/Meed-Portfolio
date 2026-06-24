import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
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
  const transporter = getTransporter();
  if (!transporter) return;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
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
  });
}
