// Adds third-party tracking scripts to the page, and lets the payment success
// page wait for them before it leaves (a page change right away would lose the
// purchase event). Browser-only.

const loading: Promise<void>[] = [];

export function addTrackingScript(src: string): void {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  loading.push(
    new Promise((resolve) => {
      script.addEventListener("load", () => resolve());
      script.addEventListener("error", () => resolve()); // blocked by the browser: don't wait for it
    })
  );
  document.head.appendChild(script);
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const filesLoaded = () => performance.getEntriesByType("resource").length;
const QUIET_MS = 1500;
const LONGEST_MS = 6000;

/**
 * Resolves once the tools have had the chance to send: their scripts have
 * loaded, and (as they load more files before sending) nothing new has finished
 * loading for 1.5 seconds. At most about 6 seconds; at once if no tool was loaded.
 */
export async function trackingSettled(): Promise<void> {
  if (loading.length === 0) return;
  const deadline = Date.now() + LONGEST_MS;
  await Promise.race([Promise.all(loading), wait(LONGEST_MS - QUIET_MS)]);
  let count = filesLoaded();
  let quietSince = Date.now();
  while (Date.now() < deadline && Date.now() - quietSince < QUIET_MS) {
    await wait(250);
    if (filesLoaded() !== count) {
      count = filesLoaded();
      quietSince = Date.now();
    }
  }
}
