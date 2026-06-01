# Ornamental Value

Website for Ornamental Value — vintage homewares by Zoe.
Built with React + Vite, deployed on Vercel, pulling listings live from Etsy.

---

## Stack

- **React + Vite** — frontend
- **Etsy Open API v3** — live product listings
- **Vercel** — hosting + auto-deploy from GitHub
- **Domain** — ornamentalvalue.com.au (configure in Vercel dashboard)

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get your Etsy API key

1. Go to [etsy.com/developers](https://www.etsy.com/developers) and sign in with Zoe's Etsy account
2. Click **Create a New App**
3. Fill in:
   - App name: `Ornamental Value Website`
   - Description: `Portfolio website pulling active listings`
   - Other fields: leave as default or fill as required
4. After creation, copy the **API Key (Keystring)**

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and paste your API key:

```
VITE_ETSY_API_KEY=your_key_here
VITE_ETSY_SHOP_ID=ornamentalvalue
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploying to Vercel

### First deploy

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
3. Vercel will auto-detect Vite — no config needed
4. Add environment variables in Vercel dashboard:
   - `VITE_ETSY_API_KEY` → your Etsy API key
   - `VITE_ETSY_SHOP_ID` → `ornamentalvalue`
5. Click Deploy

### After first deploy

Every `git push` to `main` will auto-deploy. No action needed.

### Custom domain (ornamentalvalue.com.au)

1. In Vercel dashboard → your project → Settings → Domains
2. Add `ornamentalvalue.com.au`
3. Vercel will show you DNS records to add at your domain registrar
4. Once DNS propagates (up to 48h), the site goes live at your domain

---

## Etsy listing tags

For a listing to appear under a category filter, it needs one of these exact tags:

| Category | Tag to use on Etsy |
|---|---|
| Candle Holders | `candle-holders` |
| Vases | `vases` |
| Trays & Catch-alls | `trays` |
| Objet | `objet` |
| Jewellery | `jewellery` |

Each listing can have up to 13 tags total — use the remaining tags however you like
(materials, era, style etc.) for Etsy search. A listing can have multiple category tags
and will appear under each matching filter.

---

## Adding the favicon

The `OVFavicon.png` is used in the footer. To also use it as the browser tab icon:

1. Copy `src/assets/OVFavicon.png` to `public/favicon.png`
2. It's already referenced in `index.html`

---

## Fonts

- **Alte Haas Grotesk** — loaded via cdnfonts.com CDN. If you have the `.ttf` files,
  drop them in `src/assets/fonts/` and update the `@font-face` in `src/index.css`
  to use local paths for better performance.
- **Cormorant Garamond** — loaded from Google Fonts (headings, About text, price labels)

---

## Contact email

Update `hello@ornamentalvalue.com.au` in:
- `src/components/Header.jsx`
- `src/components/Footer.jsx`

if Zoe uses a different address.
