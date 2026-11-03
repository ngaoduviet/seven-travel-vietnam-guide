import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadArticlePacks, mergeArticleSources } from './article-packs.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(await fs.readFile(path.join(root,'content/site.json'), 'utf8'));
const base = (process.env.PUBLIC_BASE_PATH || site.basePath).replace(/\/$/, '');
const domain = (process.env.PUBLIC_SITE_URL || site.publicDomain).replace(/\/$/, '');
const isLive = process.env.SITE_LIVE === 'true';
const hasSanity = Boolean((process.env.SANITY_PROJECT_ID || '').trim());
const source = hasSanity ? 'Sanity CMS + article packages' : 'article packages / demo';
const output = path.join(root,'dist');
const siteRoot = path.join(output,base.replace(/^\//,''));
await fs.rm(output, {recursive:true,force:true});
await fs.mkdir(siteRoot,{recursive:true});
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const strip = v => String(v || '').replace(/<[^>]*>/g,'');
const u = relative => base + (relative === '/' ? '/' : '/' + relative.replace(/^\//,'').replace(/\/$/,'') + '/');
const canonical = relative => domain + u(relative);
const asset = name => `${base}/assets/${name}`;
const prettyDate = raw => { const d=new Date(raw || '2026-11-01'); return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('en-US',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(d);};
const getCat = key => site.categories.find(c=>c.slug===key) || site.categories[0];
const categoryUrl = key => u(`category/${key}`);
const postUrl = post => u(`guides/${post.slug}`);
const imageUrl = post => post.image?.startsWith('/assets/') ? asset(post.image.slice('/assets/'.length)) : (post.image || asset('hero-vietnam.svg'));

async function readPosts(){
  if(!hasSanity) return []; 
  const id=process.env.SANITY_PROJECT_ID.trim();
  const ds=process.env.SANITY_DATASET || 'production';
  const version=process.env.SANITY_API_VERSION || '2026-03-01';
  const query=`*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))] | order(publishedAt desc) {title, "slug": slug.current, excerpt, category, featured, "image": coverImage.asset->url, "imageAlt": coverImage.alt, publishedAt, readingTime, author, body}`;
  const url=`https://${id}.api.sanity.io/v${version}/data/query/${encodeURIComponent(ds)}?query=${encodeURIComponent(query)}`;
  const headers={}; if(process.env.SANITY_READ_TOKEN) headers.Authorization=`Bearer ${process.env.SANITY_READ_TOKEN}`;
  const res=await fetch(url,{headers,signal:AbortSignal.timeout(20000)});
  if(!res.ok) throw Error(`Sanity query failed (${res.status}). Check project ID, dataset visibility and read token.`);
  const json=await res.json();
  if(!Array.isArray(json.result)) throw Error('Sanity did not return an article array');
  return json.result.map(p=>({
    ...p,
    date:p.publishedAt || new Date().toISOString(),
    image:p.image || '/assets/hero-vietnam.svg',
    author:p.author || 'Seven Travel Editorial Team',
    readingTime:p.readingTime || 5,
    body:p.body || []
  }));
}
const sanityPosts=(await readPosts()).filter(x=>x.slug && x.title);
const packs=await loadArticlePacks({root,siteRoot,base,categorySlugs:site.categories.map(c=>c.slug)});
for(const msg of packs.messages) console.log(msg);
const merged=mergeArticleSources(sanityPosts,packs.posts,message=>console.warn('WARNING: '+message));
// Demo only when no Sanity project and no published packages are configured.
const posts=(merged.length || hasSanity ? merged : JSON.parse(await fs.readFile(path.join(root,'content/demo-posts.json'),'utf8')))
 .sort((a,b)=> new Date(b.date)-new Date(a.date));

function nav(active='') {return `<header class="site-header"><div class="top-strip"><div class="container top-strip-inner"><span>THE SEVEN TRAVEL JOURNAL</span><span class="top-strip-right"><span class="status-dot"></span> LOCAL PERSPECTIVES · MEMORABLE JOURNEYS</span></div></div>
<div class="container header-main"><a href="${u('/')}" class="brand" aria-label="Seven Travel Guide home"><img src="${asset('seven-travel-logo.png')}" alt="Seven Travel" width="209" height="69"/><span class="brand-line">VIETNAM TRAVEL GUIDE</span></a>
<nav class="nav-links" aria-label="Primary navigation"><a href="${u('/')}" ${active==='home'?'aria-current="page"':''}>Home</a><a href="${categoryUrl('destinations')}">Destinations</a><a href="${categoryUrl('travel-essentials')}">Travel Tips</a><a href="${categoryUrl('itineraries')}">Itineraries</a><a href="${u('about')}">Our Story</a></nav>
<div class="header-actions"><a class="icon-search" href="${u('search')}" title="Search articles" aria-label="Search articles"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 5 5"/></svg></a><a class="header-cta" href="${esc(site.consultationUrl)}" target="_blank" rel="noopener noreferrer">Explore with us <span aria-hidden="true">↗</span></a><button id="menu-toggle" class="menu-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button></div></div>
<div id="mobile-menu" class="mobile-menu" hidden><a href="${u('/')}" >Home</a><a href="${categoryUrl('destinations')}">Destinations</a><a href="${categoryUrl('travel-essentials')}">Travel Tips</a><a href="${categoryUrl('itineraries')}">Itineraries</a><a href="${u('about')}">Our Story</a><a href="${u('search')}">Search articles</a></div></header>`;}
function footer(){const categories=site.categories.slice(0,4);return `<footer class="footer"><div class="container footer-grid"><div class="footer-about"><a href="${u('/')}" class="footer-brand"><img src="${asset('seven-mark.png')}" alt="Seven Travel symbol" width="50" height="50"/><span><strong>Seven Travel</strong><small>VIETNAM TRAVEL GUIDE</small></span></a><p>Thoughtful guides to Vietnam, written with an eye for what makes a journey truly memorable.</p><span class="footer-muted">A travel guide from Seven Travel.</span></div><div><h4>Discover</h4>${categories.map(c=>`<a href="${categoryUrl(c.slug)}">${esc(c.name)}</a>`).join('')}</div><div><h4>Quick links</h4><a href="${u('about')}">About this guide</a><a href="${u('start-here')}">Start here</a><a href="${u('search')}">Search the journal</a><a href="${esc(site.mainWebsite)}" target="_blank" rel="noopener noreferrer">Seven Travel website ↗</a></div><div class="footer-last"><h4>Travel with intention</h4><p>Planning a private trip to Vietnam? Discover the people behind the journey.</p><a href="${esc(site.consultationUrl)}" target="_blank" rel="noopener noreferrer">Visit Seven Travel ↗</a></div></div><div class="container footer-bottom"><span>© ${new Date().getUTCFullYear()} Seven Travel. All rights reserved.</span><span>Made for curious travellers · Vietnam</span></div></footer>`;}
const pendingWarning = !isLive ? `<div class="preview-alert">Editorial preview · Sample articles and illustrations must be reviewed before launch. Search indexing is disabled.</div>` : '';
function layout({title,description,relative='/',body,active='',image,htmlType='website',jsonLd=[],noindex=!isLive}) {
 const fullTitle= title ? `${title} | Seven Travel Vietnam Travel Guide` : 'Vietnam Travel Guide | Seven Travel';
 const url=canonical(relative); const imageHref=image || canonical('/')+'assets/hero-vietnam.svg';
 const ld = jsonLd.map(json=>`<script type="application/ld+json">${JSON.stringify(json).replace(/</g,'\\u003c')}</script>`).join('');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(fullTitle)}</title><meta name="description" content="${esc(description || site.description)}"><link rel="canonical" href="${esc(url)}"><meta name="robots" content="${noindex?'noindex,nofollow':'index,follow,max-image-preview:large'}"><meta property="og:type" content="${htmlType}"><meta property="og:site_name" content="Seven Travel Vietnam Travel Guide"><meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(description || site.description)}"><meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(imageHref)}"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#0B3D6D"><link rel="icon" type="image/png" href="${asset('seven-mark.png')}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><link rel="stylesheet" href="${asset('style.css')}">${ld}</head><body>${pendingWarning}${nav(active)}<main id="main-content">${body}</main>${footer()}<script src="${asset('main.js')}" defer></script></body></html>`;
}
function sectionHeading(eyebrow,title,lead,more=''){return `<div class="section-heading"><div><div class="eyebrow"><span class="orange-stroke"></span>${esc(eyebrow)}</div><h2>${esc(title)}</h2>${lead?`<p>${esc(lead)}</p>`:''}</div>${more||''}</div>`;}
function label(text){return `<span class="card-category">${esc(text)}</span>`;}
function articleCard(post,variant=''){const cat=getCat(post.category);return `<a class="article-card ${variant}" href="${postUrl(post)}"><div class="article-image"><img src="${esc(imageUrl(post))}" alt="${esc(post.imageAlt || post.title)}" loading="lazy" width="600" height="380"/><span class="article-image-arrow" aria-hidden="true">↗</span></div><div class="article-card-body"><div class="card-meta">${label(cat.name)}<span class="meta-divider"></span><span>${esc(post.readingTime || 5)} min read</span></div><h3>${esc(post.title)}</h3><p>${esc(post.excerpt || '')}</p><span class="article-date">${esc(prettyDate(post.date))}</span></div></a>`;}
function breadcrumb(parts){return `<nav aria-label="Breadcrumb" class="breadcrumb"><a href="${u('/')}" >Home</a>${parts.map(part=>`<span aria-hidden="true">/</span>${part.href?`<a href="${esc(part.href)}">${esc(part.label)}</a>`:`<span>${esc(part.label)}</span>`}`).join('')}</nav>`;}
function homePage(){
  const spotlight=posts.find(p=>p.featured)||posts[0];
  const stories=posts.filter(p=>p.slug!==spotlight?.slug).slice(0,6);
  const featuredPost=spotlight || {title:'Start your journey through Vietnam',excerpt:site.description,slug:'',category:'destinations',date:'2026-11-01',readingTime:5,image:'/assets/hero-vietnam.svg'};
  const overview = `<section class="hero-section"><div class="container hero-shell"><div class="hero-copy"><div class="hero-tag"><span class="tag-circle">✦</span> THE LOCAL WAY TO EXPLORE VIETNAM</div><h1>Stories for the <em>journey</em> of a lifetime<span class="orange-dot">.</span></h1><p>Unhurried itineraries, honest travel advice and local perspectives—everything you need to discover Vietnam with confidence.</p><div class="hero-actions"><a class="button-primary" href="${u('start-here')}">Start exploring <span>↗</span></a><a class="button-text" href="${categoryUrl('destinations')}">Browse destinations <span>→</span></a></div><div class="hero-trust"><span class="trust-avatar">7</span><div><strong>From the team at Seven Travel</strong><small>Inspired by real journeys across Vietnam</small></div></div></div><div class="hero-photo" role="img" aria-label="Stylized illustration of Vietnam limestone landscape"><img src="${asset('hero-vietnam.svg')}" alt="A peaceful river surrounded by Vietnamese limestone hills" width="1440" height="900"/><div class="hero-photo-note"><span class="pin-icon">⌾</span><div><strong>Vietnam, beyond the ordinary</strong><small>Local insight · Authentic journeys</small></div></div><div class="hero-photo-corner">VIETNAM <span>↗</span></div></div></div></section>`;
  const secondaryBar=`<section class="container editorial-strip" aria-label="Editorial values"><div><span>01</span><strong>Practical local advice</strong><small>Details that matter</small></div><div><span>02</span><strong>Travel thoughtfully</strong><small>At your own pace</small></div><div><span>03</span><strong>See beyond the obvious</strong><small>Discover hidden layers</small></div></section>`;
  const featured=`<section class="section-pad section-tint"><div class="container">${sectionHeading('THE EDITOR’S PICK','Start with a story worth sharing','Fresh perspectives and useful advice for your next Vietnam adventure.',`<a class="section-link" href="${u('search')}">View all articles <span>↗</span></a>`)}<a class="spotlight-card" href="${postUrl(featuredPost)}"><div class="spotlight-image"><img src="${esc(imageUrl(featuredPost))}" alt="${esc(featuredPost.imageAlt || featuredPost.title)}" width="900" height="620" loading="lazy"/></div><div class="spotlight-content"><span class="eyebrow highlight">FEATURED GUIDE · ${esc(getCat(featuredPost.category).name.toUpperCase())}</span><h3>${esc(featuredPost.title)}</h3><p>${esc(featuredPost.excerpt || '')}</p><div class="spotlight-bottom"><span>${esc(prettyDate(featuredPost.date))} · ${esc(featuredPost.readingTime)} min read</span><span class="round-arrow">↗</span></div></div></a></div></section>`;
  const categoryArt={'travel-essentials':'hero-vietnam.svg','destinations':'ninh-binh.svg','culture-food':'vietnam-food.svg','itineraries':'vietnam-itinerary.svg'};
  const cats=`<section class="section-pad"><div class="container">${sectionHeading('FIND YOUR INSPIRATION','Explore by interest','Whatever brings you to Vietnam, begin with the stories that speak to you.')}<div class="category-grid">${site.categories.filter(c=>c.slug!=='travel-updates').map((c,i)=>`<a class="category-tile" href="${categoryUrl(c.slug)}"><div class="category-art"><img src="${asset(categoryArt[c.slug]||'hero-vietnam.svg')}" alt="" loading="lazy" width="420" height="260"/></div><div class="category-content"><span>0${i+1} / ${esc(c.short)}</span><h3>${esc(c.name)} <b aria-hidden="true">↗</b></h3></div></a>`).join('')}</div></div></section>`;
  const latest=`<section class="section-pad latest-section"><div class="container">${sectionHeading('THE JOURNAL','Good reads for curious travellers','Ideas, insights and little discoveries from across Vietnam.',`<a class="section-link" href="${u('search')}">Explore the journal <span>↗</span></a>`)}<div class="article-grid">${stories.length?stories.map(p=>articleCard(p)).join(''):'<p>Our travel stories are coming soon.</p>'}</div></div></section>`;
  const cta=`<section class="container cta-panel"><div class="cta-decor">✳</div><div><span class="cta-eyebrow">MAKE IT YOUR JOURNEY</span><h2>More than a place to visit.<br><em>A place to remember.</em></h2><p>Considering a private journey through Vietnam? Meet the local team behind Seven Travel.</p></div><a class="button-light" href="${esc(site.consultationUrl)}" target="_blank" rel="noopener noreferrer">Discover Seven Travel <span>↗</span></a></section>`;
  const ld=[{'@context':'https://schema.org','@type':'Organization',name:'Seven Travel',url:site.mainWebsite,logo:`${domain}${asset('seven-travel-logo.png')}`},{'@context':'https://schema.org','@type':'WebSite',name:'Seven Travel Vietnam Travel Guide',url:canonical('/'),potentialAction:{'@type':'SearchAction',target:canonical('search')+'?q={search_term_string}','query-input':'required name=search_term_string'}}];
  return layout({body:overview+secondaryBar+featured+cats+latest+cta,active:'home',relative:'/',jsonLd:ld});
}
function renderPortableText(block){
  if(block._type==='sevenTip') return `<aside class="editorial-tip"><span>✦ SEVEN TRAVEL TIP</span><p>${esc(block.text||'')}</p></aside>`;
  if(block._type==='image') {const src=block.asset?.url||block.url;return src?`<figure><img loading="lazy" src="${esc(src)}" alt="${esc(block.alt||'Vietnam travel photograph')}"><figcaption>${esc(block.caption||'')}</figcaption></figure>`:'';}
  const children=block.children || [];
  const marks=new Map((block.markDefs||[]).map(m=>[m._key,m]));
  const text=children.map(child=>{
    let val=esc(child.text||'');
    for(const mark of child.marks||[]){
      if(mark==='strong') val=`<strong>${val}</strong>`;
      if(mark==='em') val=`<em>${val}</em>`;
      if(mark==='code') val=`<code>${val}</code>`;
      const def=marks.get(mark);
      if(def?._type==='link' && /^https?:\/\//.test(def.href||'')) val=`<a href="${esc(def.href)}" rel="nofollow noopener" target="_blank">${val}</a>`;
    }
    return val;
  }).join('');
  if(block.style==='h2') return `<h2>${text}</h2>`;
  if(block.style==='h3') return `<h3>${text}</h3>`;
  if(block.listItem==='bullet') return `<p class="bullet-block">• ${text}</p>`;
  if(block.listItem==='number') return `<p class="bullet-block">${text}</p>`;
  return `<p>${text}</p>`;
}
function articleBody(post){if(post.bodyHtml) return post.bodyHtml;const blocks=post.body||[];if(blocks.length===0)return '<p>Article coming soon.</p>';
 return blocks.map(b=>{
 if(b._type==='block' || b._type==='image') return renderPortableText(b);
 if(b.type==='lead')return `<p class="article-lead">${esc(b.text)}</p>`;
 if(b.type==='heading')return `<h2>${esc(b.text)}</h2>`;
 if(b.type==='paragraph')return `<p>${esc(b.text)}</p>`;
 if(b.type==='tip')return `<aside class="editorial-tip"><span>✦ SEVEN TRAVEL TIP</span><p>${esc(b.text)}</p></aside>`;
 return '';}).join('');}
function articleWithAnchors(post){
 const used=new Set();const toc=[];
 const html=articleBody(post).replace(/<h([23])(?:\s+[^>]*)?>([\s\S]*?)<\/h\1>/gi,(match,level,inner)=>{
   const title=strip(inner).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
   let id=title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 -]/g,'').trim().replace(/\s+/g,'-').slice(0,78)||'section';
   const plain=id;let number=2;while(used.has(id)) id=plain+'-'+number++;
   used.add(id);toc.push({level:Number(level),title,id});
   return `<h${level} id="${esc(id)}">${inner}</h${level}>`;
 });
 return {html,toc};
}
function articlePage(post){
 const cat=getCat(post.category);
 const related=posts.filter(p=>p.slug!==post.slug).sort((a,b)=>Number(b.category===post.category)-Number(a.category===post.category)).slice(0,3);
 const content=articleWithAnchors(post);
 const tocHtml=content.toc.length?`<nav class="article-toc" aria-label="On this page"><span class="toc-eyebrow">IN THIS GUIDE</span><ol>${content.toc.map(t=>`<li class="toc-level-${t.level}"><a href="#${t.id}">${esc(t.title)}</a></li>`).join('')}</ol></nav>`:'';
 const credit=post.imageCredit?(post.imageCreditUrl && /^https?:\/\//.test(post.imageCreditUrl)?`Photo: <a href="${esc(post.imageCreditUrl)}" target="_blank" rel="noopener noreferrer">${esc(post.imageCredit)}</a>`:`Photo: ${esc(post.imageCredit)}`):'';
 const coverCaption=[post.imageCaption?esc(post.imageCaption):'',credit].filter(Boolean).join(' · ');
 const coverCaptionHtml=coverCaption?`<figcaption>${coverCaption}</figcaption>`:'';
 const body=`<div class="container article-page">${breadcrumb([{label:cat.name,href:categoryUrl(cat.slug)},{label:post.title}])}<div class="article-head"><div class="eyebrow"><span class="orange-stroke"></span>${esc(cat.name.toUpperCase())} · TRAVEL GUIDE</div><h1>${esc(post.title)}</h1><p>${esc(post.excerpt || '')}</p><div class="article-byline"><span class="author-avatar">7</span><div><strong>${esc(post.author||'Seven Travel Editorial Team')}</strong><small>${esc(prettyDate(post.date))} <span>·</span> ${esc(post.readingTime||5)} min read</small></div></div></div><figure class="article-hero"><img src="${esc(imageUrl(post))}" alt="${esc(post.imageAlt||post.title)}" width="1440" height="900"/>${coverCaptionHtml}</figure><div class="article-content-grid"><aside class="article-sidebar">${tocHtml}<div class="sidebar-card"><span>THE JOURNAL</span><h3>A better way to see Vietnam.</h3><p>Explore at your pace with thoughtful local guidance.</p><a href="${u('start-here')}">Plan with confidence ↗</a></div><a class="back-link" href="${categoryUrl(cat.slug)}">← More in ${esc(cat.name)}</a></aside><article class="prose">${content.html}<div class="article-end"><span>Enjoyed this guide?</span><p>There is always more to discover. Keep exploring the Seven Travel journal.</p><a href="${u('search')}">Browse more stories ↗</a></div></article></div></div><section class="section-pad section-tint related-section"><div class="container">${sectionHeading('KEEP EXPLORING','You might also enjoy','More local insight for your Vietnam journey.')}<div class="article-grid">${related.map(p=>articleCard(p)).join('')}</div></div></section>`;
 const ld=[{'@context':'https://schema.org','@type':'BlogPosting',headline:post.title,description:post.excerpt||'',datePublished:post.date,dateModified:post.updatedAt||post.date,mainEntityOfPage:canonical(`guides/${post.slug}`),author:{'@type':'Organization',name:post.author||'Seven Travel'},publisher:{'@type':'Organization',name:'Seven Travel'},image:[imageUrl(post).startsWith('http')?imageUrl(post):`${domain}${imageUrl(post)}`]},{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{ '@type':'ListItem',position:1,name:'Home',item:canonical('/')},{'@type':'ListItem',position:2,name:cat.name,item:canonical(`category/${cat.slug}`)},{'@type':'ListItem',position:3,name:post.title,item:canonical(`guides/${post.slug}`)}]}];
 return layout({title:post.title,description:post.excerpt,relative:`guides/${post.slug}`,body,htmlType:'article',jsonLd:ld,image:imageUrl(post).startsWith('http')?imageUrl(post):`${domain}${imageUrl(post)}`});
}
function categoryPage(cat){const subset=posts.filter(p=>p.category===cat.slug);const body=`<section class="category-hero"><div class="container">${breadcrumb([{label:cat.name}])}<div class="eyebrow"><span class="orange-stroke"></span>EXPLORE THE JOURNAL</div><h1>${esc(cat.name)}<span class="orange-dot">.</span></h1><p>${esc(cat.description)}</p><span class="category-count">${subset.length} ${subset.length===1?'ARTICLE':'ARTICLES'}</span></div></section><section class="section-pad"><div class="container"><div class="category-select">${site.categories.map(c=>`<a href="${categoryUrl(c.slug)}" ${c.slug===cat.slug?'class="selected"':''}>${esc(c.name)}</a>`).join('')}</div><div class="article-grid">${subset.length?subset.map(p=>articleCard(p)).join(''):'<p>New articles in this category are coming soon.</p>'}</div></div></section>`;
 return layout({title:cat.name,description:cat.description,relative:`category/${cat.slug}`,body});}
function searchPage(){const body=`<section class="category-hero search-hero"><div class="container">${breadcrumb([{label:'Search'}])}<div class="eyebrow"><span class="orange-stroke"></span>THE SEVEN TRAVEL JOURNAL</div><h1>Find your next <em>inspiration.</em></h1><p>Search useful tips, places and thoughtful Vietnam itineraries.</p><form class="search-form" id="search-form" action="${u('search')}" method="get"><label for="search-field" class="sr-only">Search articles</label><input type="search" id="search-field" name="q" placeholder="Try 'Ninh Binh', 'train', 'first-time'..." autocomplete="off"><button type="submit">Search ↗</button></form></div></section><section class="container search-results-wrap"><p id="search-summary" class="search-summary">All travel guides</p><div id="search-results" class="article-grid"></div><noscript><p>Please enable JavaScript to search the journal.</p></noscript></section><script>window.SEVEN_SEARCH_CONFIG=${JSON.stringify({index:`${base}/search-index.json`,base})}</script>`;
 return layout({title:'Search the journal',description:'Find Vietnam travel tips and destination guides by Seven Travel.',relative:'search',body});}
function aboutPage(){const body=`<section class="about-page"><div class="container about-grid"><div><div class="eyebrow"><span class="orange-stroke"></span>OUR STORY</div><h1>Travel advice from people who know <em>the journey.</em></h1><p>We believe the best journeys are shaped by curiosity, thoughtful planning and the small local details that make a difference.</p><p>This independent guide is a publication from Seven Travel, created to share useful, clear and engaging information for international travellers exploring Vietnam.</p><a class="button-primary" href="${u('start-here')}">Start exploring <span>↗</span></a></div><div class="about-art"><img src="${asset('hue.svg')}" alt="Illustrated historic architecture in Vietnam"></div></div></section><section class="section-pad section-tint"><div class="container">${sectionHeading('WHAT WE BELIEVE','Helpful first. Inspiring always.','A good travel guide should help you make better decisions, not overwhelm you with lists.')}<div class="values-grid"><div><span>01.</span><h3>Thoughtful planning</h3><p>Honest perspectives on timing, pacing and logistics.</p></div><div><span>02.</span><h3>Local curiosity</h3><p>More context, stories and respectful cultural discovery.</p></div><div><span>03.</span><h3>Useful details</h3><p>Practical information you can actually use on your trip.</p></div></div></div></section>`;
 return layout({title:'Our Story',relative:'about',body});}
function startHere(){const essentials=posts.filter(p=>p.category==='travel-essentials').slice(0,3);const body=`<section class="category-hero"><div class="container">${breadcrumb([{label:'Start here'}])}<div class="eyebrow"><span class="orange-stroke"></span>HELLO, VIETNAM</div><h1>Your journey <em>starts here.</em></h1><p>New to Vietnam? Begin with the practical essentials, then explore destinations and shape a route that feels right for you.</p></div></section><section class="section-pad"><div class="container"><div class="steps-grid"><div><span>01 / PREPARE</span><h3>Get the basics right</h3><p>Entry rules, packing, transport and money: start with a plan that makes the journey easier.</p></div><div><span>02 / EXPLORE</span><h3>Choose what excites you</h3><p>Mountains, food, cities, coastlines or heritage—travel with your interests in mind.</p></div><div><span>03 / ENJOY</span><h3>Give yourself breathing room</h3><p>Leave time for unexpected moments, conversations and slow discoveries.</p></div></div>${sectionHeading('READ FIRST','A few good places to begin','The essentials we recommend reading before you arrive.')}<div class="article-grid">${essentials.map(p=>articleCard(p)).join('')}</div></div></section><section class="container cta-panel"><div><span class="cta-eyebrow">LOOKING FOR A PERSONAL ROUTE?</span><h2>A journey shaped <em>around you.</em></h2><p>Meet Seven Travel and explore private itinerary options.</p></div><a class="button-light" href="${esc(site.consultationUrl)}" target="_blank" rel="noopener noreferrer">Explore Seven Travel ↗</a></section>`;
 return layout({title:'Start Here',relative:'start-here',body});}
async function write(relative,html){const dir=path.join(siteRoot,relative.replace(/^\//,''));await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'index.html'),html,'utf8');}
await fs.cp(path.join(root,'assets'),path.join(siteRoot,'assets'),{recursive:true});
await write('',homePage());
await write('about',aboutPage());
await write('start-here',startHere());
await write('search',searchPage());
for(const cat of site.categories) await write('category/'+cat.slug,categoryPage(cat));
for(const post of posts) await write('guides/'+post.slug,articlePage(post));
await fs.writeFile(path.join(siteRoot,'search-index.json'),JSON.stringify(posts.map(p=>({title:p.title,slug:p.slug,excerpt:p.excerpt,category:getCat(p.category).name,categorySlug:p.category,image:imageUrl(p),date:prettyDate(p.date),readTime:p.readingTime}))), 'utf8');
const allUrls=[canonical('/'),canonical('about'),canonical('start-here'),canonical('search'),...site.categories.map(c=>canonical(`category/${c.slug}`)),...posts.map(p=>canonical(`guides/${p.slug}`))];
await fs.writeFile(path.join(siteRoot,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls.map(x=>`<url><loc>${esc(x)}</loc></url>`).join('\n')}\n</urlset>`, 'utf8');
await fs.writeFile(path.join(output,'robots.txt'),isLive ? `User-agent: *\nAllow: /\nSitemap: ${domain}${base}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
await fs.writeFile(path.join(output,'index.html'),`<html><head><meta http-equiv="refresh" content="0; url=${esc(u('/'))}"></head><body><a href="${esc(u('/'))}">Open Vietnam Travel Guide</a></body></html>`);
console.log(`Seven Travel journal built: ${posts.length} posts, ${site.categories.length} categories, mode ${source}, indexing ${isLive?'enabled':'disabled'}`);
console.log(`Output: ${siteRoot}`);
