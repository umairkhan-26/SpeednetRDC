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

interface EmailSection {
  title: string;
  /** A plain sentence under the title. */
  text?: string;
  /** Numbered steps, shown as a list. */
  steps?: string[];
  /** A link under the text. */
  link?: { label: string; url: string };
}

function layout(opts: { heading: string; paragraphs: string[]; sections?: EmailSection[]; button?: { label: string; url: string }; footnote?: string }): string {
  const paragraphs = opts.paragraphs
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#0a0a0a;">${escapeHtml(p)}</p>`)
    .join("");
  const sections = (opts.sections ?? [])
    .map((sec) => {
      const text = sec.text ? `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#0a0a0a;">${escapeHtml(sec.text)}</p>` : "";
      const steps = sec.steps?.length
        ? `<ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;color:#0a0a0a;">${sec.steps.map((x) => `<li style="margin:0 0 4px;">${escapeHtml(x)}</li>`).join("")}</ol>`
        : "";
      const link = sec.link
        ? `<p style="margin:0;font-size:14px;"><a href="${escapeHtml(sec.link.url)}" style="color:#f06104;font-weight:600;">${escapeHtml(sec.link.label)}</a></p>`
        : "";
      return `<div style="margin:0 0 16px;padding:14px 16px;background:#fcf0e6;border-radius:12px;"><p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#0a0a0a;">${escapeHtml(sec.title)}</p>${text}${steps}${link}</div>`;
    })
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
${paragraphs}${sections}${button}${footnote}
</td></tr></table></td></tr></table></body></html>`;
}

function plain(lines: (string | false | undefined)[]): string {
  return lines.filter(Boolean).join("\n\n") + "\n\n— SpeedNetRDC\n";
}

export function orderReadyEmail(opts: {
  customerName: string;
  planName: string;
  orderNumber: number;
  orderUrl: string;
  /** Where "Report a problem" lives (the customer account's support section). */
  reportProblemUrl?: string;
  /** Every place the plan works in, by name. Empty when unknown. */
  coveredCountries?: string[];
  /** Set when the customer gave the checkout's withdrawal-right consent: confirmed here, as EU law requires. */
  withdrawalConsentAt?: string | null;
}): EmailContent {
  const intro = `Hi ${opts.customerName}, your eSIM for ${opts.planName} (order ORD-${opts.orderNumber}) is ready to install.`;
  const how = "Open your order page to see your QR code and step-by-step install instructions. Install it while you have Wi-Fi, ideally before you travel. Your plan only starts the first time you connect in a country it covers.";
  const covered = opts.coveredCountries ?? [];
  const where: EmailSection | undefined = covered.length
    ? {
        title: "Where this plan works",
        text:
          covered.length === 1
            ? `Your data only works in ${covered[0]}. Anywhere else you will have no internet, even if your phone shows a signal.`
            : `Your data only works in these ${covered.length} places: ${covered.join(", ")}. Anywhere else you will have no internet, even if your phone shows a signal.`,
      }
    : undefined;
  const noInternetSteps = [
    "Turn the eSIM line on: Settings → Mobile data (Cellular) → select this eSIM.",
    "Choose this eSIM for mobile data and turn on Data roaming for that line.",
    "Check that you are in one of the countries listed above.",
    "Restart your phone and wait a minute. If it still doesn’t work, report a problem with your order number.",
  ];
  const keep = "Please don’t delete the eSIM from your phone, even if it isn’t working: it can’t be installed again. Contact us first.";
  const reportText = "Still no internet? Tell us from your account (sign in with this email address) and we will see which eSIM it is.";
  const consent = opts.withdrawalConsentAt
    ? "At checkout you asked for your eSIM to be delivered immediately and acknowledged that you lose your 14-day right of withdrawal once it has been delivered."
    : undefined;
  const warn = "Keep this link private: anyone with it can install your eSIM, and it can only be installed once.";
  const footnote = consent ? `${warn} ${consent}` : warn;
  const sections: EmailSection[] = [
    ...(where ? [where] : []),
    { title: "No internet?", steps: noInternetSteps },
    { title: "Please keep your eSIM", text: keep },
    ...(opts.reportProblemUrl ? [{ title: "Report a problem", text: reportText, link: { label: "Report a problem", url: opts.reportProblemUrl } }] : []),
  ];
  return {
    subject: `Your eSIM is ready — order ORD-${opts.orderNumber}`,
    html: layout({ heading: "Your eSIM is ready", paragraphs: [intro, how], sections, button: { label: "View my eSIM", url: opts.orderUrl }, footnote }),
    text: plain([
      intro,
      how,
      `Your order page: ${opts.orderUrl}`,
      where && `${where.title}\n${where.text}`,
      `No internet?\n${noInternetSteps.map((x, i) => `${i + 1}. ${x}`).join("\n")}`,
      keep,
      opts.reportProblemUrl && `${reportText}\nReport a problem: ${opts.reportProblemUrl}`,
      warn,
      consent,
    ]),
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

// --- Physical SIM cards and top-ups ------------------------------------------

export function simOnItsWayEmail(opts: {
  customerName: string;
  orderNumber: number;
  orderUrl: string;
  deliveryEstimate: string;
  shipsFrom: string;
  returnsText: string;
}): EmailContent {
  const intro = `Hi ${opts.customerName}, thanks for your order ORD-${opts.orderNumber}. Your SpeedNetRDC SIM card is being prepared and ships from ${opts.shipsFrom}.`;
  const when = `It usually arrives within ${opts.deliveryEstimate} of posting. We'll email you again when it's on its way.`;
  const next = "It comes with 1 GB of international data. When it arrives: insert it in any unlocked phone and turn on data roaming. Need more data later? Buy a plan on our site and choose “Add to my SIM”.";
  return {
    subject: `Your SIM is on its way — order ORD-${opts.orderNumber}`,
    html: layout({ heading: "Your SIM is on its way", paragraphs: [intro, when, next], button: { label: "View my order", url: opts.orderUrl }, footnote: opts.returnsText }),
    text: plain([intro, when, next, `Your order: ${opts.orderUrl}`, opts.returnsText]),
  };
}

export function simShippedEmail(opts: {
  customerName: string;
  orderNumber: number;
  orderUrl: string;
  trackingNumber: string | null;
  deliveryEstimate: string;
}): EmailContent {
  const intro = `Hi ${opts.customerName}, your SIM card (order ORD-${opts.orderNumber}) has been posted. It should arrive within ${opts.deliveryEstimate}.`;
  const tracking = opts.trackingNumber ? `Tracking number: ${opts.trackingNumber}` : undefined;
  const next = "Your 1 GB of international data is already on the card: once it arrives, insert it and turn on data roaming. Your SIM is listed under My SIMs when you sign in with this email address.";
  return {
    subject: `Your SIM has shipped — order ORD-${opts.orderNumber}`,
    html: layout({ heading: "Your SIM has shipped", paragraphs: tracking ? [intro, tracking, next] : [intro, next], button: { label: "View my order", url: opts.orderUrl } }),
    text: plain([intro, tracking, next, `Your order: ${opts.orderUrl}`]),
  };
}

export function topUpReadyEmail(opts: {
  customerName: string;
  planName: string;
  orderNumber: number;
  simEnding: string;
  orderUrl: string;
  startWindowText: string;
  withdrawalConsentAt?: string | null;
}): EmailContent {
  const intro = `Hi ${opts.customerName}, your ${opts.planName} plan (order ORD-${opts.orderNumber}) has been added to your SIM ending ${opts.simEnding}.`;
  const how = `There's nothing to install: the plan starts the first time your phone connects in a country it covers ${opts.startWindowText}. Make sure data roaming is on for this SIM.`;
  const consent = opts.withdrawalConsentAt
    ? "At checkout you asked for your plan to be delivered immediately and acknowledged that you lose your 14-day right of withdrawal once it has been delivered."
    : undefined;
  return {
    subject: `Data added to your SIM — order ORD-${opts.orderNumber}`,
    html: layout({ heading: "Your data plan is on your SIM", paragraphs: [intro, how], button: { label: "View my order", url: opts.orderUrl }, footnote: consent }),
    text: plain([intro, how, `Your order: ${opts.orderUrl}`, consent]),
  };
}
