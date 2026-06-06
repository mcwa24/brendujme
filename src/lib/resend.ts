import { Resend } from "resend";

const SITE_LABEL = "Bilbord Shop (shop.bilbord.rs)";
const DEFAULT_FROM_EMAIL = "Bilbord Shop <objave@bilbord.rs>";

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing.");
  }
  return new Resend(apiKey);
}

function contactRecipients(): string[] {
  const configuredTo =
    process.env.RESEND_CONTACT_TO?.trim() ||
    process.env.RESEND_NOTIFY_EMAIL?.trim() ||
    "bilbord.rs@gmail.com";

  return Array.from(
    new Set(
      configuredTo
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean)
        .concat("imarcetic@gmail.com")
    )
  );
}

export type ContactTopic = "general" | "brand";

export async function sendContactFormEmail(params: {
  topic: ContactTopic;
  name: string;
  email: string;
  message: string;
  brandName?: string;
  website?: string;
  country?: string;
  availability?: string;
}) {
  const safeName = escapeHtml(params.name.trim());
  const safeEmail = escapeHtml(params.email.trim());
  const safeMessage = escapeHtml(params.message.trim()).replaceAll("\n", "<br />");

  const isBrand = params.topic === "brand";
  const subject = isBrand
    ? `${SITE_LABEL} — Prijava brenda: ${params.brandName?.trim() || params.name.trim()}`
    : `${SITE_LABEL} — Kontakt: ${params.name.trim()}`;

  const extraBrandFields = isBrand
    ? `
    <p style="margin:0 0 12px;"><strong>Brend:</strong> ${escapeHtml(params.brandName?.trim() || "—")}</p>
    <p style="margin:0 0 12px;"><strong>Veb sajt:</strong> ${escapeHtml(params.website?.trim() || "—")}</p>
    <p style="margin:0 0 12px;"><strong>Zemlja porekla:</strong> ${escapeHtml(params.country?.trim() || "—")}</p>
    <p style="margin:0 0 12px;"><strong>Dostupnost u Srbiji:</strong></p>
    <p style="margin:0 0 12px;">${escapeHtml(params.availability?.trim() || "—").replaceAll("\n", "<br />")}</p>
    `
    : "";

  const from = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from,
    to: contactRecipients(),
    replyTo: params.email.trim(),
    subject,
    html: `
<!DOCTYPE html>
<html lang="sr">
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.5;color:#111827;">
    <p style="margin:0 0 16px;padding:10px 12px;background:#f5f5f3;border-radius:8px;">
      <strong>Izvor:</strong> ${SITE_LABEL}
    </p>
    <p style="margin:0 0 12px;"><strong>Tip:</strong> ${isBrand ? "Prijava brenda" : "Opšti kontakt"}</p>
    <p style="margin:0 0 12px;"><strong>Ime:</strong> ${safeName}</p>
    <p style="margin:0 0 12px;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
    ${extraBrandFields}
    <p style="margin:0 0 8px;"><strong>Poruka:</strong></p>
    <p style="margin:0;white-space:pre-wrap;">${safeMessage}</p>
  </body>
</html>
    `.trim(),
  });

  if (error) {
    throw new Error(error.message || "Resend contact email failed.");
  }
}
