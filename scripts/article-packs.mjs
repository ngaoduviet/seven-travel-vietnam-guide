/**
 * Seven Travel Article Packages v1.
 * Package folders are trusted editorial source files committed by the repository owner.
 * HTML is validated and reconstructed against a restricted tag/attribute allowlist at build time.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const imageExts = new Set(['.jpg','.jpeg','.png','.webp','.avif']);
const tags = new Set(['p','h2','h3','h4','ul','ol','li','strong','em','b','i','a','figure','figcaption','img','blockquote','aside','div','section','span','hr','br','code','pre','details','summary','table','thead','tbody','tr','th','td']);
const voidTags = new Set(['img','hr','br']);
const attrs = new Set(['href','src','alt','title','class','id','loading','width','height','target','rel','colspan','rowspan']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const escapeAttr = v => String(v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const assert = (pass, message) => { if (!pass) throw new Error(message); };
const localImage = p => /^images\/[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(p) && imageExts.has(path.extname(p).toLowerCase());
const safeExternalUrl = v => { try {const u = new URL(v); return ['https:','http:'].includes(u.protocol);} catch {return false;} };

/** Reject unsupported HTML instead of accidentally deploying unsafe user markup. */
export function validateAndRewriteHtml(html,{slug,base,availableImages}){
  assert(typeof html==='string' && html.trim(),`[${slug}] article.html is empty`);
  assert(!/<\s*!|<\s*\?/.test(html),`[${slug}] HTML declarations, comments and processing instructions are not allowed`);
  let result=''; let cursor=0;
  const re=/<\/?[A-Za-z][^>]*>/g;
  for(const match of html.matchAll(re)){
    const before=html.slice(cursor,match.index);
    assert(!before.includes('<'),`[${slug}] Malformed HTML or an unsupported opening tag`);
    result+=before;
    const raw=match[0];
    const tagMatch=raw.match(/^<(\/)?([A-Za-z][a-zA-Z0-9-]*)([\s\S]*?)(\/?)>$/);
    assert(tagMatch,`[${slug}] Invalid HTML tag: ${raw.slice(0,80)}`);
    const [,closing,tagRaw,attrRaw]=tagMatch;
    const tag=tagRaw.toLowerCase();
    assert(tags.has(tag),`[${slug}] Unsupported <${tag}>; use article fragments, not scripts, iframes or a full HTML document`);
    if(closing){
      assert(!attrRaw.trim(),`[${slug}] Closing </${tag}> must not have attributes`);
      result+=`</${tag}>`;
    } else {
      let remaining=attrRaw.replace(/\/$/,'');
      const found=[];
      const attrRe=/\s+([A-Za-z][A-Za-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
      for(const am of remaining.matchAll(attrRe)){
        const name=am[1].toLowerCase();
        const val=am[2]??am[3];
        assert(attrs.has(name),`[${slug}] Unsupported attribute ${name} on <${tag}>`);
        assert(!found.some(x=>x[0]===name),`[${slug}] Duplicate ${name} on <${tag}>`);
        if(name==='src'){
          assert(tag==='img',`[${slug}] src is only allowed on images`);
          assert(localImage(val),`[${slug}] Images must use local images/filename.jpg|webp|png|avif`);
          assert(availableImages.has(val.slice('images/'.length)),`[${slug}] Missing image file ${val}`);
          found.push([name,`${base}/assets/articles/${slug}/${val.slice('images/'.length)}`]);
        } else if(name==='href'){
          assert(tag==='a',`[${slug}] href is only allowed on links`);
          assert(safeExternalUrl(val) || /^#[a-zA-Z0-9_-]+$/.test(val) || /^mailto:[^\s<>]+$/.test(val) || (val.startsWith(base+'/') && !val.includes('//')),`[${slug}] Unsupported or unsafe URL in href`);
          found.push([name,val]);
        } else if(name==='class' || name==='id'){
          assert(/^[a-zA-Z0-9 _-]{1,120}$/.test(val),`[${slug}] Invalid ${name} value`);
          found.push([name,val]);
        } else if(name==='target') {
          assert(val==='_blank' || val==='_self',`[${slug}] Invalid link target`);
          found.push([name,val]);
        } else if(['width','height','colspan','rowspan'].includes(name)){
          assert(/^\d{1,4}$/.test(val),`[${slug}] ${name} must be numeric`);
          found.push([name,val]);
        } else if(name==='loading'){
          assert(val==='lazy'||val==='eager',`[${slug}] loading must be lazy or eager`);
          found.push([name,val]);
        } else {
          assert(!/[<>]/.test(val),`[${slug}] Invalid attribute value`);
          found.push([name,val]);
        }
      }
      remaining=remaining.replace(attrRe,'');
      assert(!remaining.trim(),`[${slug}] Bad or unquoted attributes in <${tag}>: ${remaining.trim().slice(0,70)}`);
      if(tag==='a' && found.some(([name,value])=>name==='href'&&safeExternalUrl(value))){
        const target=found.find(([name])=>name==='target');
        if(target && target[1]==='_blank' && !found.some(([name])=>name==='rel')) found.push(['rel','noopener noreferrer']);
      }
      if(tag==='img'){
        assert(found.some(([name])=>name==='src'),`[${slug}] img needs a src`);
        assert(found.some(([name])=>name==='alt'),`[${slug}] img needs alt text`);
        if(!found.some(([name])=>name==='loading')) found.push(['loading','lazy']);
      }
      result+=`<${tag}${found.map(([name,value])=>` ${name}="${escapeAttr(value)}"`).join('')}>`;
    }
    cursor=match.index+raw.length;
  }
  const rest=html.slice(cursor);
  assert(!rest.includes('<'),`[${slug}] Malformed HTML at end of article`);
  result+=rest;
  return result;
}

export async function loadArticlePacks({root,siteRoot,base,categorySlugs}){
  const folder=path.join(root,'content','article-packs');
  const entries=await fs.readdir(folder,{withFileTypes:true}).catch(error=>error.code==='ENOENT'?[]:Promise.reject(error));
  const posts=[]; const messages=[];
  for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name))){
    if(entry.name.startsWith('_') || entry.name.startsWith('.') || !entry.isDirectory()) continue;
    const packRoot=path.join(folder,entry.name);
    const meta=JSON.parse(await fs.readFile(path.join(packRoot,'article.json'),'utf8'));
    assert(meta.status==='draft'||meta.status==='published',`[${entry.name}] status must be draft or published`);
    if(meta.status==='draft'){
      messages.push(`Draft article package skipped: ${entry.name}`);continue;
    }
    assert(slugPattern.test(meta.slug) && meta.slug.length<=96,`[${entry.name}] slug must be lowercase letters, numbers and hyphens only`);
    assert(entry.name===meta.slug,`[${entry.name}] Folder name must match article slug ${meta.slug}`);
    assert(typeof meta.title==='string' && meta.title.length>=12 && meta.title.length<=140,`[${entry.name}] Missing or invalid title`);
    assert(typeof meta.excerpt==='string' && meta.excerpt.length>=50 && meta.excerpt.length<=300,`[${entry.name}] Missing or invalid excerpt`);
    assert(categorySlugs.includes(meta.category),`[${entry.name}] Unknown category ${meta.category}`);
    assert(typeof meta.publishedAt==='string' && !Number.isNaN(Date.parse(meta.publishedAt)),`[${entry.name}] Invalid publishedAt date`);
    assert(Number.isInteger(meta.readingTime) && meta.readingTime>=1 && meta.readingTime<=45,`[${entry.name}] readingTime must be 1–45`);
    assert(typeof meta.imageAlt==='string' && meta.imageAlt.trim(),`[${entry.name}] imageAlt is required`);
    if(meta.imageCreditUrl) assert(safeExternalUrl(meta.imageCreditUrl),`[${entry.name}] imageCreditUrl must be http(s)`);
    assert(localImage(meta.coverImage),`[${entry.name}] coverImage must be in images/`);
    const imgRoot=path.join(packRoot,'images');
    const images=await fs.readdir(imgRoot,{withFileTypes:true}).catch(error=>error.code==='ENOENT'?[]:Promise.reject(error));
    const imageFiles=new Set();
    for(const image of images){
      assert(image.isFile() && imageExts.has(path.extname(image.name).toLowerCase()) && /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(image.name),`[${entry.name}] Invalid image file ${image.name}`);
      const file=path.join(imgRoot,image.name);
      const info=await fs.stat(file);
      assert(info.size<=8*1024*1024,`[${entry.name}] ${image.name} exceeds 8MB; optimize it first`);
      imageFiles.add(image.name);
    }
    assert(imageFiles.has(meta.coverImage.slice('images/'.length)),`[${entry.name}] Missing cover image ${meta.coverImage}`);
    const html=await fs.readFile(path.join(packRoot,'article.html'),'utf8');
    const bodyHtml=validateAndRewriteHtml(html,{slug:meta.slug,base,availableImages:imageFiles});
    const dest=path.join(siteRoot,'assets','articles',meta.slug);
    await fs.mkdir(dest,{recursive:true});
    for(const img of imageFiles) await fs.copyFile(path.join(imgRoot,img),path.join(dest,img));
    posts.push({
      slug:meta.slug,title:meta.title,excerpt:meta.excerpt,category:meta.category,
      featured:Boolean(meta.featured),author:meta.author||'Seven Travel Editorial Team',
      date:meta.publishedAt,updatedAt:meta.updatedAt||meta.publishedAt,
      readingTime:meta.readingTime,image:`/assets/articles/${meta.slug}/${meta.coverImage.slice('images/'.length)}`,
      imageAlt:meta.imageAlt,imageCaption:meta.imageCaption||'',imageCredit:meta.imageCredit||'',
      imageCreditUrl:meta.imageCreditUrl||'',bodyHtml,_source:'package',replaceSanity:meta.replaceSanity===true
    });
  }
  return {posts,messages};
}

export function mergeArticleSources(sanityPosts,packagePosts,log=console.warn){
  const bySlug=new Map();
  for(const post of sanityPosts) bySlug.set(post.slug,post);
  for(const pack of packagePosts){
    if(bySlug.has(pack.slug)) {
      if(pack.replaceSanity){ log(`Article pack overrides existing Sanity slug: ${pack.slug}`);bySlug.set(pack.slug,pack);}
      else log(`Skipped article pack ${pack.slug}: slug already exists in Sanity. Set replaceSanity: true in article.json to intentionally override.`);
    } else bySlug.set(pack.slug,pack);
  }
  return [...bySlug.values()];
}
