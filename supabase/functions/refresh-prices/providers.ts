import type { Listing } from './stats.ts';

export type Source = 'mobile_de' | 'ebay';

export interface CarModelRow {
  id: string;
  name: string;
  variant: string | null;
  year: number;
  fuel_type: string;
  search_query: string | null;
  mobile_make_key: string | null;
  mobile_model_key: string | null;
  brand: { name: string };
}

export interface PriceProvider {
  source: Source;
  isConfigured(): boolean;
  // Returns null when this provider cannot search for the model (missing keys).
  fetchListings(model: CarModelRow): Promise<Listing[] | null>;
}

// ---------------------------------------------------------------------------
// mobile.de Search API — https://services.mobile.de/manual/search-api.html
// Requires API credentials from mobile.de (dealer / partner account).
// ---------------------------------------------------------------------------

const MOBILE_DE_FUEL: Record<string, string> = {
  Benzin: 'PETROL',
  Diesel: 'DIESEL',
  Elektro: 'ELECTRICITY',
  Hybrid: 'HYBRID',
};

const MOBILE_DE_MAX_PAGES = 3;

export const mobileDeProvider: PriceProvider = {
  source: 'mobile_de',

  isConfigured() {
    return Boolean(Deno.env.get('MOBILE_DE_USERNAME') && Deno.env.get('MOBILE_DE_PASSWORD'));
  },

  async fetchListings(model) {
    if (!model.mobile_make_key || !model.mobile_model_key) return null;

    const auth = btoa(`${Deno.env.get('MOBILE_DE_USERNAME')}:${Deno.env.get('MOBILE_DE_PASSWORD')}`);
    const listings: Listing[] = [];

    for (let page = 1; page <= MOBILE_DE_MAX_PAGES; page++) {
      const params = new URLSearchParams({
        classification: `refdata/classes/Car/makes/${model.mobile_make_key}/models/${model.mobile_model_key}`,
        'firstRegistrationDate.min': `${model.year}-01`,
        'firstRegistrationDate.max': `${model.year}-12`,
        'page.size': '100',
        'page.number': String(page),
      });
      const fuel = MOBILE_DE_FUEL[model.fuel_type];
      if (fuel) params.set('fuel', fuel);

      const res = await fetch(`https://services.mobile.de/search-api/search?${params}`, {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/vnd.de.mobile.api+json',
        },
      });
      if (!res.ok) throw new Error(`mobile.de ${res.status}: ${await res.text()}`);

      const body = await res.json();
      const ads: Array<{ price?: { consumerPriceGross?: string }; mileage?: number }> =
        body.ads ?? [];
      for (const ad of ads) {
        const price = Number(ad.price?.consumerPriceGross);
        if (price > 0) listings.push({ price, mileage: ad.mileage });
      }
      if (ads.length < 100) break;
    }

    return listings;
  },
};

// ---------------------------------------------------------------------------
// eBay Browse API — https://developer.ebay.com/api-docs/buy/browse/overview.html
// Uses an application token (client credentials) on the German marketplace.
// ---------------------------------------------------------------------------

const EBAY_CARS_CATEGORY_DE = '9801'; // "Autos" on ebay.de
const EBAY_MIN_PRICE = 2000; // filters out parts and accessories

let ebayToken: { value: string; expiresAt: number } | null = null;

async function getEbayToken(): Promise<string> {
  if (ebayToken && ebayToken.expiresAt > Date.now() + 60_000) return ebayToken.value;

  const auth = btoa(`${Deno.env.get('EBAY_CLIENT_ID')}:${Deno.env.get('EBAY_CLIENT_SECRET')}`);
  const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'https://api.ebay.com/oauth/api_scope',
    }),
  });
  if (!res.ok) throw new Error(`eBay OAuth ${res.status}: ${await res.text()}`);

  const body = await res.json();
  ebayToken = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return ebayToken.value;
}

export const ebayProvider: PriceProvider = {
  source: 'ebay',

  isConfigured() {
    return Boolean(Deno.env.get('EBAY_CLIENT_ID') && Deno.env.get('EBAY_CLIENT_SECRET'));
  },

  async fetchListings(model) {
    const query =
      model.search_query ??
      [model.brand.name, model.name, model.variant, model.year].filter(Boolean).join(' ');

    const params = new URLSearchParams({
      q: query,
      category_ids: EBAY_CARS_CATEGORY_DE,
      filter: `price:[${EBAY_MIN_PRICE}..],priceCurrency:EUR,buyingOptions:{FIXED_PRICE|BEST_OFFER}`,
      limit: '200',
    });

    const res = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`, {
      headers: {
        Authorization: `Bearer ${await getEbayToken()}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE',
      },
    });
    if (!res.ok) throw new Error(`eBay ${res.status}: ${await res.text()}`);

    const body = await res.json();
    const items: Array<{ price?: { value?: string; currency?: string } }> =
      body.itemSummaries ?? [];
    return items
      .filter((item) => item.price?.currency === 'EUR')
      .map((item) => ({ price: Number(item.price?.value) }));
  },
};

export const providers: PriceProvider[] = [mobileDeProvider, ebayProvider];
