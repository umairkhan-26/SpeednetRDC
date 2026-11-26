// The first-party cookies the advertising and analytics tools leave on our
// domain: Meta (_fbp, _fbc), Google (_ga, _ga_*, _gid, _gat*, _gcl_*) and
// TikTok (_ttp, _tt_*, ttclid). Browser-only.

const TRACKER_COOKIE = /^(_fbp$|_fbc$|_ga($|_)|_gid$|_gat|_gcl_|_ttp$|_tt_|ttclid$)/;

/** Removes those cookies (after the visitor withdraws consent). */
export function clearTrackingCookies(): void {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  const names = document.cookie.split("; ").map((part) => part.split("=")[0]);
  for (const name of names.filter((n) => TRACKER_COOKIE.test(n))) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}
