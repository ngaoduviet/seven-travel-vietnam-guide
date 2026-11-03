import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateAndRewriteHtml, mergeArticleSources } from './article-packs.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const slug='example-hoi-an-relaxed-day';
const example=path.join(root,'content','article-packs','_example-hoi-an-relaxed-day');
const testDir=path.join(root,'content','article-packs',slug);
const publicRoot=path.join(root,'dist','vietnam-travel-tips');
const env={...process.env};
delete env.SANITY_PROJECT_ID;
// Unit tests: reject active content and unsafe URL.
for(const bad of ['<script>alert(1)</script>','<p onclick="hack()">Test</p>','<img src="javascript:alert(1)" alt="x">','<a href="javascript:alert(1)">Click</a>','<iframe src="https://example.com"></iframe>']) {
  assert.throws(()=>validateAndRewriteHtml(bad,{slug,base:'/vietnam-travel-tips',availableImages:new Set(['cover.webp'])}));
}
const old=[{slug:'same',title:'Sanity title'}];
assert.equal(mergeArticleSources(old,[{slug:'same',title:'ZIP title'}],()=>{})[0].title,'Sanity title');
assert.equal(mergeArticleSources(old,[{slug:'same',title:'ZIP title',replaceSanity:true}],()=>{})[0].title,'ZIP title');
await fs.cp(example,testDir,{recursive:true});
try{
  const metaFile=path.join(testDir,'article.json');
  const meta=JSON.parse(await fs.readFile(metaFile,'utf8'));
  meta.status='published';
  await fs.writeFile(metaFile,JSON.stringify(meta,null,2));
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root,env,stdio:'inherit'});
  const file=path.join(publicRoot,'guides',slug,'index.html');
  const html=await fs.readFile(file,'utf8');
  assert.match(html,/A Relaxed Day in Hoi An/);
  assert.match(html,/class="article-toc"/);
  assert.match(html,/class="seven-tip"/);
  assert.match(html,/class="seven-faq"/);
  assert.match(html,/class="seven-cta"/);
  assert.match(html,/assets\/articles\/example-hoi-an-relaxed-day\/cover.webp/);
  assert.match(html,/id="enjoy-the-old-town-at-a-slower-pace"/);
  assert.match(await fs.readFile(path.join(publicRoot,'search-index.json'),'utf8'),/example-hoi-an-relaxed-day/);
  assert.match(await fs.readFile(path.join(publicRoot,'sitemap.xml'),'utf8'),/example-hoi-an-relaxed-day/);
  console.log('PASS Article Package: HTML, photos, tips, FAQ, TOC, SEO index, sitemap, safe merging');
}finally{
  await fs.rm(testDir,{recursive:true,force:true});
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root,env,stdio:'inherit'});
}
