/**
 * fetch-fx-rates — Supabase Edge Function
 *
 * Runs on a daily cron (configured in supabase/functions/fetch-fx-rates/config.toml).
 * Fetches live exchange rates from the free Open Exchange Rates API and upserts
 * them into the `fx_rates` table so clients can sync on app open.
 *
 * Required env var: OPEN_EXCHANGE_RATES_APP_ID
 * (Get a free key at https://openexchangerates.org — 1,000 requests/month free)
 *
 * Alternatively swap the fetch URL for any other rates API that returns JSON like:
 *   { "rates": { "EUR": 0.92, "GBP": 0.78, ... } }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BASE_CURRENCY = 'USD';

// Currencies the app supports (matches parser.ts CURRENCY_SYMBOLS)
const SUPPORTED_QUOTES = ['EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'HKD', 'SGD', 'MXN', 'JPY', 'CNY', 'KRW', 'IDR'];

Deno.serve(async () => {
  const appId = Deno.env.get('OPEN_EXCHANGE_RATES_APP_ID');
  if (!appId) {
    return new Response('Missing OPEN_EXCHANGE_RATES_APP_ID', { status: 500 });
  }

  // Fetch latest rates with USD as base
  const res = await fetch(
    `https://openexchangerates.org/api/latest.json?app_id=${appId}&base=${BASE_CURRENCY}&symbols=${SUPPORTED_QUOTES.join(',')}`,
  );
  if (!res.ok) {
    return new Response(`Rates API error: ${res.status}`, { status: 502 });
  }

  const json = await res.json() as { timestamp: number; rates: Record<string, number> };
  const asOf = new Date(json.timestamp * 1000).toISOString().slice(0, 10);
  const now = new Date().toISOString();

  const rows = Object.entries(json.rates)
    .filter(([quote]) => SUPPORTED_QUOTES.includes(quote))
    .map(([quote, rate]) => ({
      base: BASE_CURRENCY,
      quote,
      // rate here = how many quote units equal 1 USD
      // We store it inverted: how many USD equal 1 quote unit
      rate: 1 / rate,
      as_of: asOf,
      updated_at: now,
    }));

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { error } = await supabase
    .from('fx_rates')
    .upsert(rows, { onConflict: 'base,quote' });

  if (error) {
    return new Response(`DB upsert error: ${error.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ updated: rows.length, asOf }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
