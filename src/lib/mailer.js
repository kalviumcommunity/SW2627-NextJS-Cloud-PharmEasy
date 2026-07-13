const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// Same Brevo-based email sender used in AuthHub's utility/Email.js.
// Configure these in .env:
//   BREVO_API_KEY - your Brevo API key
//   MAIL          - verified sender email address in Brevo

export async function sendMail({ to, subject, text, html }) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("Email service is not configured on the server. Please set BREVO_API_KEY.");
  }
  if (!process.env.MAIL) {
    throw new Error("Email service is not configured on the server. Please set MAIL (verified sender email).");
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "PharmEasy", email: process.env.MAIL },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html || undefined,
    }),
  });

  if (!response.ok) {
    let details = "";
    try {
      const errBody = await response.json();
      details = errBody.message || JSON.stringify(errBody);
    } catch {
      details = await response.text();
    }
    throw new Error(`Failed to send email via Brevo: ${details}`);
  }

  return response.json();
}