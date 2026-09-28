// Fetches current listings for every tracked car model from all configured
// providers and stores one aggregated snapshot per model, source and day.
//
// Invoke daily (see README) with the header `x-cron-secret: <CRON_SECRET>`.
// Optional JSON body: { "carModelId": "<uuid>" } to refresh a single model.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { providers, type CarModelRow } from './providers.ts';
import { computeStats, type Listing } from './stats.ts';

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (!cronSecret || req.headers.get('x-cron-secret') !== cronSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const activeProviders = providers.filter((p) => p.isConfigured());
  if (activeProviders.length === 0) {
    return Response.json({ error: 'No price provider is configured' }, { status: 500 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const body = req.headers.get('content-type')?.includes('application/json')
    ? await req.json()
    : {};

  let query = supabase
    .from('car_models')
    .select('id, name, variant, year, fuel_type, search_query, mobile_make_key, mobile_model_key, brand:car_brands(name)');
  if (body.carModelId) query = query.eq('id', body.carModelId);

  const { data: models, error } = await query.returns<CarModelRow[]>();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const recordedAt = new Date().toISOString();
  const recordedOn = recordedAt.slice(0, 10);
  const results: Record<string, Record<string, number | string>> = {};
  const rows = [];

  for (const model of models ?? []) {
    const combined: Listing[] = [];
    const modelResult: Record<string, number | string> = {};

    // Sources are queried in parallel; one failing source doesn't block the others.
    const settled = await Promise.allSettled(activeProviders.map((p) => p.fetchListings(model)));

    settled.forEach((outcome, i) => {
      const source = activeProviders[i].source;
      if (outcome.status === 'rejected') {
        modelResult[source] = `error: ${outcome.reason}`;
        return;
      }
      if (outcome.value === null) {
        modelResult[source] = 'skipped';
        return;
      }
      combined.push(...outcome.value);
      const stats = computeStats(outcome.value);
      modelResult[source] = outcome.value.length;
      if (stats) rows.push({ car_model_id: model.id, source, recorded_on: recordedOn, recorded_at: recordedAt, ...stats });
    });

    const combinedStats = computeStats(combined);
    if (combinedStats) {
      rows.push({ car_model_id: model.id, source: 'all', recorded_on: recordedOn, recorded_at: recordedAt, ...combinedStats });
    }
    results[`${model.brand.name} ${model.name} ${model.variant ?? ''}`.trim()] = modelResult;
  }

  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from('price_snapshots')
      .upsert(rows, { onConflict: 'car_model_id,source,recorded_on' });
    if (upsertError) return Response.json({ error: upsertError.message }, { status: 500 });
  }

  return Response.json({ snapshots: rows.length, results });
});
