# AutoBroker

Aktuelle Marktpreise und Preisverläufe für Gebrauchtwagen, berechnet aus aktuellen Inseraten.

```bash
npm install
npm run dev
```

Ohne Supabase-Zugangsdaten läuft die App mit generierten Demo-Daten.

## Wie die Preise entstehen

```
mobile.de Search API ─┐
                      ├─► Edge Function `refresh-prices` ─► price_snapshots ─► Frontend
eBay Browse API ──────┘   (täglich, API-Keys nur serverseitig)   (1 Zeile/Modell/Quelle/Tag)
```

- Pro Modell werden aktuelle Inserate abgefragt, Ausreißer entfernt (IQR) und Durchschnitt,
  Median, Min/Max, Anzahl und Ø Kilometerstand gespeichert.
- Der Preisverlauf entsteht aus den eigenen täglichen Snapshots, er wächst also ab dem ersten Lauf.
- Die Quellen liefern **Angebotspreise**, keine Verkaufspreise.

### Datenquellen

| Quelle      | Zugang |
|-------------|--------|
| mobile.de   | [Search API](https://services.mobile.de/manual/search-api.html), Zugangsdaten nur für Händler/Partner über mobile.de |
| eBay        | [Browse API](https://developer.ebay.com/api-docs/buy/browse/overview.html), Keyset im eBay Developer Program anlegen |
| AutoScout24 | Keine öffentliche Such-API (nur Listing-Creation für Händler), daher nicht angebunden |

Neue Quellen: `PriceProvider` in `supabase/functions/refresh-prices/providers.ts` implementieren
und zu `providers` hinzufügen.

## Supabase einrichten

1. Projekt anlegen, `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` in `.env` eintragen (siehe `.env.example`).
2. Schema anlegen: `supabase db push` (legt Tabellen, View und die 10 Startmodelle an).
3. Secrets für die Edge Function setzen und deployen:
   ```bash
   supabase secrets set CRON_SECRET=... EBAY_CLIENT_ID=... EBAY_CLIENT_SECRET=... \
     MOBILE_DE_USERNAME=... MOBILE_DE_PASSWORD=...
   supabase functions deploy refresh-prices
   ```
4. Für mobile.de die Make/Model-Keys je Modell in `car_models.mobile_make_key` /
   `mobile_model_key` eintragen (Werte aus `https://services.mobile.de/refdata/classes/Car/makes`).
   Modelle ohne Keys werden bei mobile.de übersprungen.
5. Manuell testen:
   ```bash
   curl -X POST https://<project-ref>.supabase.co/functions/v1/refresh-prices \
     -H "Authorization: Bearer <anon-key>" -H "x-cron-secret: <CRON_SECRET>"
   ```
6. Täglich ausführen (SQL-Editor, Erweiterungen `pg_cron` und `pg_net` aktivieren):
   ```sql
   select cron.schedule('refresh-prices', '0 5 * * *', $$
     select net.http_post(
       url := 'https://<project-ref>.supabase.co/functions/v1/refresh-prices',
       headers := jsonb_build_object(
         'Authorization', 'Bearer <anon-key>',
         'x-cron-secret', '<CRON_SECRET>'
       )
     );
   $$);
   ```

## Konten und Favoriten

- Anmeldung per E-Mail und Passwort über Supabase Auth. Favoriten liegen in der Tabelle
  `favorites`; per Row Level Security sieht und ändert jeder Nutzer nur seine eigenen.
- Im Supabase-Dashboard unter **Authentication → URL Configuration** die Site URL und die
  Redirect-URLs auf die Adresse der App setzen (lokal `http://localhost:5173`), sonst führen
  die Bestätigungslinks aus den Registrierungs-Mails ins Leere.
- **Authentication → Providers → Email**: „Confirm email“ an lassen. Die App zeigt nach der
  Registrierung dann den Hinweis, die E-Mail zu bestätigen.
- Die mitgelieferte Supabase-Mail hat ein niedriges Stundenlimit. Für den Livebetrieb unter
  **Authentication → SMTP Settings** einen eigenen Mailversand eintragen.
- Im Demo-Modus (ohne Supabase) gibt es keine Konten; Favoriten werden dann nur im Browser gespeichert.
