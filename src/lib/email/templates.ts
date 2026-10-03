// Email content: every message has an HTML and a plain-text version.
// Interpolated values are always HTML-escaped. Plain tables and inline
// styles only, for email-client compatibility. English for now (like the
// rest of the checkout and account pages).

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function layout(opts: { heading: string; paragraphs: string[]; button?: { label: string; url: string }; footnote?: string }): string {
  const paragraphs = opts.paragraphs
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#0a0a0a;">${escapeHtml(p)}</p>`)
    .join("");
  const button = opts.button
    ? `<p style="margin:24px 0;"><a href="${escapeHtml(opts.button.url)}" style="display:inline-block;background:#f06104;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:999px;">${escapeHtml(opts.button.label)}</a></p>
       <p style="margin:0 0 16px;font-size:12px;line-height:1.5;color:#6b6b6b;">Or copy this link into your browser:<br><span style="word-break:break-all;">${escapeHtml(opts.button.url)}</span></p>`
    : "";
  const footnote = opts.footnote
    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6b6b6b;">${escapeHtml(opts.footnote)}</p>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#fcf0e6;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fcf0e6;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px;">
<tr><td>
<p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#0a0a0a;">SpeedNet<span style="color:#f06104;">RDC</span></p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0a0a0a;">${escapeHtml(opts.heading)}</h1>
${paragraphs}${button}${footnote}
</td></tr></table></td></tr></table></body></html>`;
}

function plain(lines: (string | false | undefined)[]): string {
  return lines.filter(Boolean).join("\n\n") + "\n\n— SpeedNetRDC\n";
}

export function orderReadyEmail(opts: { customerName: string; planName: string; orderNumber: number; orderUrl: string }): EmailContent {
  const intro = `Hi ${opts.customerName}, your eSIM for ${opts.planName} (order ORD-${opts.orderNumber}) is ready to install.`;
  const how = "Open your order page to see your QR code and step-by-step install instructions. Install it while you have Wi-Fi, ideally before you travel. Your plan only starts the first time you connect in a country it covers.";
  const warn = "Keep this link private: anyone with it can install your eSIM, and it can only be installed once.";
  return {
    subject: `Your eSIM is ready — order ORD-${opts.orderNumber}`,
    html: layout({ heading: "Your eSIM is ready", paragraphs: [intro, how], button: { label: "View my eSIM", url: opts.orderUrl }, footnote: warn }),
    text: plain([intro, how, `Your order page: ${opts.orderUrl}`, warn]),
  };
}

export function customerLoginEmail(opts: { url: string }): EmailContent {
  const intro = "Use the button below to sign in to your SpeedNetRDC account. The link works once and expires in 15 minutes.";
  const ignore = "If you didn't ask to sign in, you can ignore this email — nobody can sign in without this link.";
  return {
    subject: "Your SpeedNetRDC sign-in link",
    html: layout({ heading: "Sign in to SpeedNetRDC", paragraphs: [intro], button: { label: "Sign in", url: opts.url }, footnote: ignore }),
    text: plain([intro, `Sign in: ${opts.url}`, ignore]),
  };
}

export function staffInviteEmail(opts: { name: string; inviterName: string; role: "admin" | "staff"; url: string }): EmailContent {
  const intro = `Hi ${opts.name}, ${opts.inviterName} has invited you to the SpeedNetRDC ${opts.role === "admin" ? "admin panel" : "staff portal"}.`;
  const next = "Use the button below to choose your password and sign in. The link works once and expires in 24 hours.";
  const ignore = "If you weren't expecting this invitation, you can ignore this email.";
  return {
    subject: "You've been invited to SpeedNetRDC",
    html: layout({ heading: "You're invited", paragraphs: [intro, next], button: { label: "Set my password", url: opts.url }, footnote: ignore }),
    text: plain([intro, next, `Set your password: ${opts.url}`, ignore]),
  };
}

export function passwordResetEmail(opts: { url: string }): EmailContent {
  const intro = "Someone (hopefully you) asked to reset the password for your SpeedNetRDC team account.";
  const next = "Use the button below to choose a new one. The link works once and expires in 1 hour.";
  const ignore = "If you didn't ask for this, ignore this email — your password stays the same.";
  return {
    subject: "Reset your SpeedNetRDC password",
    html: layout({ heading: "Reset your password", paragraphs: [intro, next], button: { label: "Choose a new password", url: opts.url }, footnote: ignore }),
    text: plain([intro, next, `Reset your password: ${opts.url}`, ignore]),
  };
}

export function emailChangeConfirmEmail(opts: { url: string; newEmail: string }): EmailContent {
  const intro = `Confirm that you want to use ${opts.newEmail} for your SpeedNetRDC team account.`;
  const next = "Your email only changes once you open this link. It works once and expires in 24 hours.";
  const ignore = "If you didn't ask for this, ignore this email and nothing will change.";
  return {
    subject: "Confirm your new SpeedNetRDC email address",
    html: layout({ heading: "Confirm your new email", paragraphs: [intro, next], button: { label: "Confirm this address", url: opts.url }, footnote: ignore }),
    text: plain([intro, next, `Confirm: ${opts.url}`, ignore]),
  };
}

export function emailChangedNoticeEmail(opts: { newEmail: string }): EmailContent {
  const intro = `The email address for your SpeedNetRDC team account was just changed to ${opts.newEmail}. You won't receive account emails at this address anymore.`;
  const warn = "If you didn't make this change, contact another SpeedNetRDC admin immediately — your account may be compromised.";
  return {
    subject: "Your SpeedNetRDC email address was changed",
    html: layout({ heading: "Your email address was changed", paragraphs: [intro, warn] }),
    text: plain([intro, warn]),
  };
}

export function passwordChangedNoticeEmail(): EmailContent {
  const intro = "The password for your SpeedNetRDC team account was just changed, and you were signed out on your other devices.";
  const warn = "If you didn't make this change, reset your password from the sign-in page and tell another admin right away.";
  return {
    subject: "Your SpeedNetRDC password was changed",
    html: layout({ heading: "Your password was changed", paragraphs: [intro, warn] }),
    text: plain([intro, warn]),
  };
}
