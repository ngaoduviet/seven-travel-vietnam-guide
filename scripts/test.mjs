import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist/vietnam-travel-tips');
const files=[
  'index.html','about/index.html','start-here/index.html','search/index.html',
  'category/destinations/index.html','guides/first-time-visitor-checklist-vietnam/index.html',
  'assets/style.css','assets/main.js','assets/seven-travel-logo.png','sitemap.xml','search-index.json'
];
for(const file of files) assert.ok(fs.existsSync(path.join(root,file)),`Missing ${file}`);
for(const file of files.filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  assert.match(html,/<html lang="en">/);
  assert.match(html,/<link rel="canonical" href="https:\/\/www.seventravel.vn\/vietnam-travel-tips\//);
  assert.match(html,/<meta name="description"/);
  assert.match(html,/<meta name="robots" content="noindex,nofollow"/);
}
const index=JSON.parse(fs.readFileSync(path.join(root,'search-index.json'),'utf8'));
assert.ok(index.length>=8,'Expected demonstration articles');
console.log(`PASS: ${files.length} files, ${index.length} sample articles, SEO metadata and canonical links`);
