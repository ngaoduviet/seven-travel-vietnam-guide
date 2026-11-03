(()=>{
 const button=document.getElementById('menu-toggle');const menu=document.getElementById('mobile-menu');
 if(button&&menu){button.addEventListener('click',()=>{const isOpen=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!isOpen));menu.hidden=isOpen;});}
 const config=window.SEVEN_SEARCH_CONFIG;if(!config)return;
 const resultEl=document.getElementById('search-results');const summary=document.getElementById('search-summary');const input=document.getElementById('search-field');
 const query=new URLSearchParams(window.location.search).get('q')||'';if(input)input.value=query;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 function card(post){
  const a=el('a','article-card');a.href=`${config.base}/guides/${encodeURIComponent(post.slug)}/`;
  const image=el('div','article-image');const img=el('img');img.src=post.image;img.alt=post.title;img.loading='lazy';image.append(img,el('span','article-image-arrow','↗'));
  const body=el('div','article-card-body');const meta=el('div','card-meta');meta.append(el('span','card-category',post.category),el('span','meta-divider'),el('span','',`${post.readTime||5} min read`));body.append(meta,el('h3','',post.title),el('p','',post.excerpt),el('span','article-date',post.date));a.append(image,body);return a;
 }
 fetch(config.index).then(r=>{if(!r.ok)throw new Error('Index not available');return r.json()}).then(posts=>{
  const q=query.trim().toLowerCase();const filtered=q?posts.filter(p=>[p.title,p.excerpt,p.category].join(' ').toLowerCase().includes(q)):posts;
  summary.textContent=q?`${filtered.length} ${filtered.length===1?'result':'results'} for “${query}”`:`${filtered.length} travel guides`;
  resultEl.replaceChildren(...filtered.map(card));
  if(!filtered.length)resultEl.append(el('p','search-empty','No matching articles yet. Try another destination or travel topic.'));
 }).catch(()=>{summary.textContent='Search is temporarily unavailable. Please try again.'});
})();
