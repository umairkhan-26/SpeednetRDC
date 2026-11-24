import localFont from "next/font/local";

/**
 * Manrope (SIL Open Font License), served from our own files instead of being
 * downloaded from Google while the site is built. The Google download could
 * come back different for the server and the browser parts of one build, so
 * the page asked for a font class the stylesheet did not define and visitors
 * got the system font. This file is the variable "latin" file (weights 200-800),
 * which covers English, French, Spanish and Portuguese.
 */
export const manrope = localFont({
  src: [{ path: "./Manrope-latin-variable.woff2", weight: "200 800", style: "normal" }],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});
