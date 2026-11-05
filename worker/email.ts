// Transactional email (login codes, receipts, cancellation choices) through Resend's HTTP API,
// whose free tier covers IMC's volume. Without RESEND_API_KEY nothing is sent; locally,
// EMAIL_DEV_ECHO=1 in .dev.vars logs the message so flows can be tested.
import type { Env } from "./env";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export function emailEnabled(env: Env) {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

export async function sendEmail(env: Env, mail: Mail): Promise<boolean> {
  if (!emailEnabled(env)) {
    if (env.EMAIL_DEV_ECHO === "1") console.log(`[email to ${mail.to}] ${mail.subject}\n${mail.text}`);
    return env.EMAIL_DEV_ECHO === "1";
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [mail.to], subject: mail.subject, text: mail.text, html: mail.html ?? textToHtml(mail.text) }),
  });
  if (!res.ok) console.error("email failed", res.status, await res.text().catch(() => ""));
  return res.ok;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function textToHtml(text: string) {
  const body = esc(text)
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color:#c2410c">$1</a>')
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#1c1917;max-width:520px">
<p style="margin:0 0 18px;font-weight:bold;font-size:18px">IMC <span style="color:#c2410c">TIRUPATI</span></p>${body}
<p style="margin:24px 0 0;font-size:12px;color:#78716c">IMC Tirupati, It's My Community. You get this email because of a booking or sign-in on imctirupati.com.</p></div>`;
}

export const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
