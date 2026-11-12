// One-tap eSIM install ("eSIM Carrier Activation" universal link).
//
// Apple: on iOS 17.4 and later, opening
//   https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=<LPA string>
// on the iPhone itself starts the eSIM setup with the code pre-filled — the
// same as scanning the QR code, without needing a second screen.
//
// Android has no equivalent link we have been able to verify across
// manufacturers, so Android customers keep the QR code and manual codes.

const IOS_MIN_MAJOR = 17;
const IOS_MIN_MINOR = 4;

/**
 * True when the user agent is an iPhone/iPod (or an iPad sending a mobile
 * user agent) on iOS 17.4 or later. iPads in desktop mode identify as macOS
 * and are deliberately not matched: we can't tell their iOS version.
 */
export function supportsAppleOneTapInstall(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  const match = /\b(?:iPhone|iPod|iPad)\b.*?\bOS (\d+)_(\d+)/.exec(userAgent);
  if (!match) return false;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  return major > IOS_MIN_MAJOR || (major === IOS_MIN_MAJOR && minor >= IOS_MIN_MINOR);
}

/** The Apple universal link for an `LPA:1$<SM-DP+>$<matching ID>` code. */
export function appleOneTapInstallUrl(lpaActivationCode: string): string {
  return `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(lpaActivationCode)}`;
}
