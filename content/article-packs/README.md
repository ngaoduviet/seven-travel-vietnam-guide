# Article packages

Each **published** article is a folder named exactly as its URL slug:

```
content/article-packs/<article-slug>/
  article.json
  article.html
  images/
    cover.webp
    photo-1.webp
```

The `_example-hoi-an-relaxed-day` folder is a safe example (status `draft`, starts with `_`). It is **not** publicly rendered. Do not turn it into a public article without reviewing content and replacing the clearly marked illustration placeholders with photos licensed for your use.

## Authoring rules
- `article.json`: title, slug, excerpt, category, publication date, estimated reading time, cover details.
- `article.html`: **HTML fragment only**, not `<html>`, `<head>`, `<body>`, CSS, JavaScript or embeds.
- Build accepts a curated subset of HTML tags and attributes. It rejects scripts, inline styles, event handlers and unsafe links.
- Local image references must use `images/filename.webp`, `images/filename.jpg` or `images/filename.png`.
- Images up to 8 MB each. Use real licensed photos and keep a source/credit record.
- Set `status: "draft"` while editing; switch to `"published"` after editorial review.
- A package slug matching a Sanity slug is skipped by default. Use `"replaceSanity": true` ONLY when you intentionally want the package to take precedence. Otherwise change the slug.
- Commit & push using GitHub Desktop. Vercel will build from the production branch.

Supported CSS classes: `article-lead`, `seven-tip`, `tip-label`, `seven-warning`, `seven-faq`, `seven-cta`, `article-photo`, `guide-checklist`.

See `docs/HUONG-DAN-DANG-BAI-ZIP.md` for step-by-step Vietnamese instructions.
