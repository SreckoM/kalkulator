# Termoplast BGD — Kalkulator v2

PVC i ALU stolarija kalkulator sa admin panelom.

## Pokretanje lokalno

```bash
npm install
npm run dev
```

Otvori http://localhost:3000 → redirect na `/kalkulator`

## Vercel deploy

1. Push na GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
# kreiraj repo na github.com pa:
git remote add origin https://github.com/TVOJ_USERNAME/termoplast.git
git push -u origin main
```

2. Idi na vercel.com → New Project → importuj repo → Deploy

3. U Vercel dashboard → Settings → Environment Variables dodaj:
```
RESEND_API_KEY = re_xxxxxxxxxxxx
ADMIN_PASSWORD = tvoja_lozinka
```

## Admin panel

URL: `/admin`  
Default lozinka: `termoplast2024`

### Šta možeš menjati:
- **Proizvodi** — naziv i faktor (Prozor, Balkon, Podizno/Klizni)
- **Tipovi** — naziv, faktor i za koje proizvode važi
- **Materijali** — naziv i cena po cm²
- **Profili** — naziv, faktor i slika (URL)
- **Dodaci** — cene i aktivacija (Komarnik, Roletna, Okapnica, Pod-prozorska daska)

## Formula za cenu

```
cena = materijal(€/cm²) × širina(cm) × visina(cm) × faktor_proizvoda × faktor_tipa × faktor_profila
     + komarnik (€/cm² × površina)
     + roletna  (€/cm² × površina)
     + okapnica (€/cm × širina)
     + pod-prozorska daska (€/cm × širina)
```

## Struktura projekta

```
termoplast/
├── app/
│   ├── kalkulator/page.tsx     # Kalkulator
│   ├── admin/page.tsx          # Admin panel
│   └── api/
│       ├── config/route.ts     # GET/PUT konfiguracija
│       ├── cities/route.ts     # GET gradovi
│       └── quote/route.ts      # POST slanje emaila
├── data/
│   ├── config.json             # Sve cene i faktori
│   └── cities.json             # Lista gradova
└── lib/
    └── config.ts               # TypeScript tipovi i file helpers
```

## Email (Resend)

1. Nalog na resend.com (besplatno, 3000 email/mesec)
2. API ključ → dodaj u `.env.local` ili Vercel env vars
3. Verifikuj domenu termoplastbgd.com u Resend dashboard
