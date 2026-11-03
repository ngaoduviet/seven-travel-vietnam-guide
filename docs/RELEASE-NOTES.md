# Article Publisher upgrade 1.0 - Release notes

## Adds
- Directory-based Article Package format under `content/article-packs/`.
- Sanity articles and GitHub-hosted article packages on one website.
- Duplicate slug rule: Sanity remains authoritative unless `replaceSanity: true`.
- Restricted and validated HTML fragments; local article images are copied into build assets.
- Automatic headings-based table of contents, local tips, photos, FAQ, and CTA styling.
- Publication date, estimated reading time, photo caption, internal linking, search index, and sitemap.
- `sevenTip` editor object in Sanity schema (optional for future Sanity articles).
- Offline regression and security tests.

## Unchanged
- Page URLs, `/vietnam-travel-tips/` routing, Sanity datasets, production environment variables.
- Existing published Sanity articles.
- SITE_LIVE preview/noindex behavior.

## Not in this release
- Automatic Sanity Publish -> Vercel rebuild (requires explicit Vercel hook setup).
- Domain rewrite from `www.seventravel.vn` (requires safe change to main-site Vercel routing).
- Auto-importing Article Packages into Sanity Studio (packages remain GitHub-managed).
