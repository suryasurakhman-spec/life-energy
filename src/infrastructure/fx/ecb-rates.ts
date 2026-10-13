/** European Central Bank daily reference rates: a public file, no key, no user data sent. */
const ECB_DAILY_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
const TIMEOUT_MS = 10_000;

/** The ECB daily rates file, or null when offline or the request fails. */
export async function fetchEcbDaily(): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ECB_DAILY_URL, { signal: controller.signal });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
