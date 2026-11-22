# WornSecret — guida per Claude Code

Marketplace anonimo italiano per indumenti usati. Live su https://wornsecret.vercel.app
Proprietario: Francesco (non scrive codice — spiegagli le cose in italiano, in modo semplice).
Stato: beta, ~6 iscritti reali arrivati col passaparola.

## Stack

- Sito statico: HTML + CSS + JavaScript vanilla, nessun framework, nessun build step.
- Hosting: Vercel (progetto `wornsecret`, team `francesco-s-projects11`), auto-deploy da `main`.
- Repo: GitHub `Frex17/wornsecret`.
- Contatore iscritti: Supabase (tabella `counter`, colonna `value` int8, funzione SQL `increment_counter()`), letto/scritto solo via `api/counter.js`.
- Email registrazioni e annunci: Formspree, ID `xeedjjbd`.
- PWA: `manifest.json`, `sw.js`, `offline.html`, icone in `icons/`.
- Font: Cormorant Garamond (titoli) + DM Sans (testo).
- Palette: `--noir #0d0b0e`, `--deep #1a1520`, `--rose #c9768a`, `--rose2 #e8a0b0`, `--gold #c9a96e`.

## Mappa dei file

| File | Cosa fa |
|---|---|
| `index.html` | Homepage: hero, contatore, anteprima blog, recensioni, 8 annunci demo scorrevoli, modal Registrati/Vendi |
| `annunci.html` | Pagina annunci: tab Esplora/Salvati, filtri categoria, regione, 12 annunci demo (alcuni bloccati), modal dettaglio |
| `blog/index.html` | Elenco articoli in griglia 2 colonne |
| `blog/*.html` | 4 articoli SEO, ognuno con versione IT e EN nello stesso file |
| `blog/images/` | `envelope.jpg`, `fabric.jpg`, `boxes.jpg`, `locker.jpg` (immagini AI) |
| `api/counter.js` | Vercel Function: `GET` legge il contatore, `POST` lo incrementa |
| `sw.js` | Service worker: network-first per le pagine, cache-first per il resto |
| `vercel.json` | Rewrite `/blog`, `/annunci` + header per `sw.js` e `manifest.json` |
| `sitemap.xml` | 7 URL, inviata a Google Search Console (proprietà verificata con meta tag) |

## Come funziona la lingua (IT/EN)

- Lingua salvata in `localStorage` con chiave `ws_lang`, così resta uguale tra le pagine.
- `index.html` e `annunci.html`: oggetto `T = { it: {...}, en: {...} }` + `applyLang()` con selettori espliciti. Voci del menu mobile marcate con `data-mm`.
- `blog/index.html` e articoli: navbar con `data-i18n`, contenuti in blocchi paralleli `data-lang-it` / `data-lang-en` (uno dei due nascosto).
- Card annunci: `hpCat()`/`hpTitle()` in `index.html`, `catLabel()`/`titleLabel()`/`genderLabel()`/`ageLabel()` in `annunci.html`. `applyLang()` ridisegna le card.

## Regole da rispettare (bug già successi più volte)

1. **Mai** HTML con apici annidati o CSS inline (es. `font-family:'Cormorant Garamond'`) dentro le stringhe dell'oggetto `T`. Rompe tutto lo script in silenzio e i pulsanti smettono di funzionare.
2. Dopo ogni modifica: estrai ogni blocco `<script>` e controllalo con `node --check`; cerca funzioni definite due volte.
3. `vercel.json`: niente rewrite globale verso `index.html`. Rompe `sitemap.xml`, `sw.js` e `manifest.json`.
4. `sw.js` non deve mettere in cache `/api/`, Formspree o Supabase. Se cambi file importanti, alza la versione `CACHE` in `sw.js`.
5. Blog e articoli non hanno i modal: "Vendi" e "Registrati" portano a `/?open=sell` e `/?open=auth`, e la homepage apre il modal giusto.
6. Navbar e menu mobile usano `env(safe-area-inset-*)` per il notch dell'iPhone (`viewport-fit=cover`). Non toglierlo.
7. Modal: `max-height: calc(100vh - 3rem)` + `overflow-y: auto`; su mobile (<600px) a schermo intero. Il bottone in fondo deve restare raggiungibile.
8. Annunci homepage: `scroll-snap-type: x proximity` (non `mandatory`, blocca lo scroll) e padding verticale sul contenitore (altrimenti l'hover taglia il bordo).
9. Le pagine sono duplicate a mano (navbar, menu, script PWA ripetuti in 7 file). Una modifica alla navbar va fatta in tutti e 7.
10. Mai scrivere chiavi segrete nel codice: il repo è pubblico. La chiave Supabase sta solo nella env var Vercel `SUPABASE_SERVICE_KEY`.

## Cosa NON esiste ancora

- Database annunci, login reale, profili utente, chat, pagamenti. Registrazioni e annunci arrivano solo per email via Formspree.
- Gli annunci sono demo statici (array `LISTINGS`) con emoji al posto delle foto.
- Le recensioni in homepage sono inventate per la beta.

## Cose da verificare subito

- [ ] Il contatore funziona ancora? Il 30 ottobre 2026 Supabase ha cambiato i default della Data API. `api/counter.js` usa la chiave secret, quindi dovrebbe andare, ma va controllato (`GET /api/counter`).
- [ ] Supabase segnala la tabella `counter` con RLS disattivato. Valutare: attivare RLS (la chiave secret lo bypassa comunque) o lasciarlo.
- [ ] La chiave secret Supabase è comparsa in screenshot condivisi. Valutare di ruotarla e aggiornare la env var su Vercel.
- [ ] Dati Google Search Console: indicizzazione delle 7 pagine.

## Idee di miglioramento in coda

- Template condiviso per navbar/menu/footer/script PWA (oggi copiati in 7 file).
- Annunci veri: tabella `listings` su Supabase + upload foto + moderazione.
- Login vero (Supabase Auth) al posto del form Formspree.
- Bottom bar mobile (Home / Annunci / Vendi / Profilo) quando ci saranno annunci reali.
- Pulsante "traduci" nel dettaglio annuncio quando i testi saranno scritti dagli utenti.
- Dominio proprio (wornsecret.com o .it).
- Pagamenti con processore high-risk (CCBill/Segpay) dopo apertura partita IVA forfettaria.
- Foto annunci più realistiche (Midjourney con `--style raw`).
