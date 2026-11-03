## NEW: GitHub Article Package Publisher (2026-11-03)

This version **preserves existing Sanity content** and adds independently authored article folders under `content/article-packs/`. Each published folder contains `article.json`, a safe `article.html` fragment, and local photographs. The build merges Sanity posts with article packages, with Sanity winning any duplicate slug unless a package explicitly sets `replaceSanity: true`.

- Beginner guide: `docs/HUONG-DAN-DANG-BAI-ZIP.md`
- Article format: `content/article-packs/README.md`
- Future ChatGPT prompt: `docs/MASTER-PROMPT-VI.md`
- Safe sample: `content/article-packs/_example-hoi-an-relaxed-day` (Draft; never published)
- Tests: `npm run build`, `npm run test:article-packs`

The existing Sanity Studio project remains connected; no new environment variables are needed. Continue using GitHub Desktop -> Commit -> Push to deploy changes on Vercel. Keep `SITE_LIVE=false` until domain mapping, content, images and canonical URLs are approved.

---

# Seven Travel — Vietnam Travel Guide

**Standalone, English-first, SEO-oriented travel journal** for visitors to Vietnam. Designed using Seven Travel's supplied brand assets, with **Travel Blue #0B3D6D**, **Sunrise Orange #FF8A00**, Nunito headings and Inter body text.

This is a **separate website and GitHub repository**, not a folder inside the existing React/Vite codebase. It appears to visitors at `https://www.seventravel.vn/vietnam-travel-tips/` using Vercel external rewrites.

## What is already built

- Responsive homepage, destination/category pages, individual SEO-friendly articles, search, "Start Here", "Our Story", navigation and CTA.
- Static, indexable HTML generated at build time, with unique titles, descriptions, canonicals, Open Graph tags, organization and article JSON-LD, breadcrumbs and a sitemap.
- A working **Sanity CMS integration** in the build script and a Sanity Studio schema for editors.
- Original vector illustration **placeholders** to avoid using unlicensed travel photography. Replace them with properly licensed original/agency photographs in Sanity.
- Eight sample *demonstration* articles. These are editorial scaffolding, **not approved travel advice**.
- SEO safety switch: `SITE_LIVE` defaults to `false`; demo pages include `noindex` until approved.

**Not completed on your behalf:** creating your GitHub/Vercel/Sanity accounts, uploading articles to your Sanity account, adding Vercel rewrites to the main website, or publishing to the live domain. These require access to your accounts. No passwords or tokens should be shared in chat.

## A. Preview locally

Requires Node.js >= 20.

```bash
npm run build
python3 -m http.server 3000 --directory dist
```

Open `http://localhost:3000/vietnam-travel-tips/` in your browser.

No `npm install` is needed for the public frontend build, which uses Node.js built-ins. To test the article search, open `/vietnam-travel-tips/search/`.

## B. Push to its own GitHub repository

Create a new repository, e.g. `seven-travel-vietnam-guide`, then from this folder:

```bash
git init
git add .
git commit -m "Initial Seven Travel Vietnam Travel Guide"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/seven-travel-vietnam-guide.git
git push -u origin main
```

Do not copy the original SevenTravel React/Vite files into this repository.

## C. Deploy the public site to Vercel (separate project)

1. Vercel → **Add New → Project** → Import the new GitHub repository.
2. Framework preset: **Other** (this is a standalone static site generator, not a Next.js or Vite app).
3. Build Command: `npm run build`; Output Directory: `dist`.
4. Environment variables:

   - `PUBLIC_SITE_URL=https://www.seventravel.vn`
   - `PUBLIC_BASE_PATH=/vietnam-travel-tips`
   - `SITE_LIVE=false` initially
   - `SANITY_PROJECT_ID` and `SANITY_DATASET` when CMS is ready
   - `SANITY_READ_TOKEN` only if the dataset is private; keep it in Vercel secrets.

5. Deploy. The standalone Vercel URL will serve the site at:

   `https://YOUR-BLOG-PROJECT.vercel.app/vietnam-travel-tips/`

6. Test internal links and images before connecting the main domain.

The standalone project does **not** take ownership of `www.seventravel.vn`; the main site stays as the only project assigned that domain.

## D. CMS dashboard: Sanity Studio

The `studio/` folder is a **separate editor application**. It has a post schema with SEO slug, summary, category, featured flag, cover photo, alt text, publishing date, author, reading time and formatted article content.

1. Create a Sanity project in your own account: <https://www.sanity.io/manage>.
2. Note your **Project ID** and `production` dataset (or choose another dataset and update both apps).
3. Open the `studio/` folder and create `studio/.env` from `studio/.env.example` using **your** Project ID.
4. Run:

   ```bash
   cd studio
   npm install
   npm run dev
   ```

5. Sign in yourself in the Studio browser. Create and publish your first `Travel Journal Articles` document.
6. For an online CMS dashboard, run `npm run deploy` from `studio/` after Sanity login, or deploy Studio as its own Vercel project. The dashboard's own URL does not need to share the blog subfolder.
7. Add `SANITY_PROJECT_ID=...` and `SANITY_DATASET=production` to the **public blog project** in Vercel and redeploy. From then onward, only published CMS articles are used. Demo posts are not used when this setting is populated.
8. If your dataset is not public, create a read-only Viewer token and set `SANITY_READ_TOKEN` server-side in Vercel; **never place it in frontend JavaScript**.

**Publishing workflow:** After an editor publishes a post in Sanity, the public website needs a rebuild. Create a **Deploy Hook** for the public Vercel project and configure a Sanity webhook for published post changes to send a POST to that hook. Test creation, edit and unpublish. Do not expose the hook URL publicly.

**Operational note:** The supplied Sanity Studio code is an integration starter. The public static build has been exercised locally, but installing and running Studio itself requires an authenticated Sanity environment and has not been tested inside your account.

## E. Put the independent blog under your existing domain

Your uploaded `SevenTravel-React-Vite-Source.zip` contains **React 18 + Vite 6**, deployed to Vercel. The original root project already uses external rewrites, including `/sanpham`.

**Change only two route rules** in its existing root `vercel.json`. Put them **before** the last catch-all rule `{ "source": "/(.*)", "destination": "/index.html" }`:

```json
{
  "source": "/vietnam-travel-tips",
  "destination": "https://YOUR-BLOG-PROJECT.vercel.app/vietnam-travel-tips/"
},
{
  "source": "/vietnam-travel-tips/:path*",
  "destination": "https://YOUR-BLOG-PROJECT.vercel.app/vietnam-travel-tips/:path*"
}
```

**Do not overwrite** the existing route list. Leave `/sanpham`, Canton Fair and the existing fallback as they are. Replace `YOUR-BLOG-PROJECT` with the actual standalone deployment hostname. The example JSON is in `docs/VERCEL-MAIN-REWRITE.json`.

Once these two rules are deployed in the **main Vercel project**, visiting `https://www.seventravel.vn/vietnam-travel-tips/` will retrieve the separate site's pages via proxy, without changing the visible URL. DNS cannot assign a URL path to a different project, so this small routing change is unavoidable unless you put a separate reverse proxy in front of both projects.

## F. SEO go-live checks

1. Replace demonstration articles with reviewed, original content (including visa, transport and time-sensitive details).
2. Upload real Vietnam photos, verify usage rights, and use accurate alt text. The supplied SVGs are placeholders.
3. Update `content/site.json`: set the correct inbound enquiry URL and any verified contact details.
4. Test all routes under the **real** `www.seventravel.vn/vietnam-travel-tips/` domain (not only `.vercel.app`).
5. Check canonical, social preview images, Open Graph and redirects on the real domain.
6. Ensure the existing root project's `/robots.txt` permits `/vietnam-travel-tips/` (the blog project's own `/robots.txt` does not control the main domain).
7. Set `SITE_LIVE=true` in the **blog** Vercel project only after launch review, then redeploy.
8. Submit `https://www.seventravel.vn/vietnam-travel-tips/sitemap.xml` in Google Search Console for the main domain property.
9. Measure organic clicks, search impressions, article engagement and qualified enquiries using GA4/Search Console after adding measurement IDs with appropriate privacy/cookie handling.
10. Test sample pages via the URL inspection tool and verify that the source HTML contains the article text.

**Preview URL caution:** The independent `.vercel.app` frontend canonical URLs point at `www.seventravel.vn` by design; keep preview URLs out of your public navigation.

## Project structure

```text
seven-travel-vietnam-guide/
├── assets/                   # CSS, JS, supplied logos, illustration placeholders
├── content/
│   ├── site.json             # title, domain, CTAs, categories
│   └── demo-posts.json       # preview articles only
├── scripts/
│   ├── build.mjs             # static SEO page generation + Sanity fetch
│   └── artwork.py            # illustrative graphics generator
├── studio/
│   ├── schemas/post.js       # CMS post editor fields
│   └── sanity.config.js
├── docs/                     # rewrites reference
├── vercel.json               # standalone Vercel deployment
└── dist/                     # generated output, not committed
```

## Important limitation

This version is **a functional independent starter**, not a verified live production deployment. It intentionally prioritizes uncomplicated static SEO delivery and a beginner-friendly publishing workflow over dynamic Next.js features. If you later need travel price inventory, multi-language personalization, complex forms, live-search suggestions or a customer portal, those can be added as separate capabilities.
