/* Cortec Middle East — site script (multi-page). Website by Velorien. */
(()=>{
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const html=document.documentElement;
const CFG=window.CX_CFG||{};
const R=html.dataset.root||'';
const LR=html.dataset.lroot||R;
const lang=html.lang==='ar'?'ar':'en';
const hasG=!!(window.gsap&&window.ScrollTrigger);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const ARR='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ui=k=>(UI[lang]&&UI[lang][k]!=null)?UI[lang][k]:UI.en[k];
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const pslug=n=>n.toLowerCase().replace(/[®™]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const prodUrl=p=>LR+'products/'+pslug(p.n)+'/';
const contactUrl=(type,o={})=>{const q=new URLSearchParams({type});if(o.product)q.set('product',o.product);if(o.msg)q.set('msg',o.msg);if(o.sample)q.set('sample','1');return LR+'contact/?'+q.toString()+'#contact'};

/* ---------- i18n strings captured from the page (used by drawers) ---------- */
const EN={};
$$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(!(k in EN))EN[k]=el.innerHTML});
const t=k=>EN[k]!=null?EN[k]:(lang==='ar'&&window.AR&&AR[k]!=null?AR[k]:'');

/* ---------- split text ---------- */
function split(el,mode){
  const walk=node=>{[...node.childNodes].forEach(n=>{
    if(n.nodeType===3){
      const f=document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(p=>{
        if(!p)return; if(/^\s+$/.test(p)){f.append(' ');return}
        if(mode==='w'){const o=document.createElement('span');o.className='w';const i=document.createElement('span');i.textContent=p;o.append(i);f.append(o)}
        else{const s=document.createElement('span');s.className='sw';s.textContent=p;f.append(s)}
      });
      n.replaceWith(f);
    }else if(n.nodeType===1&&n.tagName!=='BR'&&n.tagName!=='A'&&!n.classList.contains('w'))walk(n);
  })};
  walk(el);
}
$$('[data-split]').forEach(el=>split(el,'w'));

/* ---------- smooth scroll ---------- */
let lenis=null;
if(hasG){gsap.registerPlugin(ScrollTrigger);}
if(hasG&&window.Lenis&&!reduce){
  lenis=new Lenis({lerp:.1,smoothWheel:true,wheelMultiplier:1});
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(tm=>lenis.raf(tm*1000));gsap.ticker.lagSmoothing(0);
}
$$('.ovl__box,.mega,.srch__res,.hs__res').forEach(e=>e.setAttribute('data-lenis-prevent',''));
const lockScroll=on=>{if(lenis){on?lenis.stop():lenis.start()}document.body.style.overflow=on?'hidden':''};
const hdrOff=()=>($('.subnav')?125:80);
let revealPass=()=>{};
function flash(el){el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),2300)}
function goTo(el,smooth=true){
  if(typeof el==='string')el=document.getElementById(el.replace(/^#/,''));
  if(!el)return;
  const top=el.id==='top'?0:el.getBoundingClientRect().top+scrollY-hdrOff();
  if(lenis){lenis.resize&&lenis.resize();smooth?lenis.scrollTo(top,{duration:1.4,easing:x=>1-Math.pow(1-x,4),force:true}):lenis.scrollTo(top,{immediate:true,force:true})}
  else scrollTo({top,behavior:smooth&&!reduce?'smooth':'auto'});
  setTimeout(()=>revealPass(),smooth?1500:200);
  if(el.matches('[data-st],.case,.pcard,.office2,.pcard2,.tile,.gate'))setTimeout(()=>flash(el),smooth?1000:400);
}

/* ---------- page transitions (curtain) ---------- */
const curtain=$('#curtain');
function isInternal(a){
  if(!a||a.target==='_blank'||a.hasAttribute('download'))return false;
  const h=a.getAttribute('href')||'';if(!h||h.startsWith('#')||/^(mailto:|tel:|javascript:)/.test(h))return false;
  let u;try{u=new URL(a.href,location.href)}catch(e){return false}
  if(u.origin!==location.origin)return false;
  if(/\.(pdf|zip|jpe?g|png|mp4|webp|svg)$/i.test(u.pathname))return false;
  if(u.pathname===location.pathname&&u.search===location.search&&u.hash)return false;
  return true;
}
document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const a=e.target.closest('a[href]');if(!a)return;
  const h=a.getAttribute('href');
  // same-page anchors
  if(h.startsWith('#')){
    if(h.length<2){e.preventDefault();return}
    const el=document.getElementById(h.slice(1));if(!el)return;
    e.preventDefault();
    const wasOpen=html.classList.contains('menu-open');if(wasOpen)toggleMenu(false);closeAll();
    history.replaceState(null,'',h);
    setTimeout(()=>goTo(el),wasOpen?450:0);return;
  }
  if(!isInternal(a))return;
  e.preventDefault();leave(a.href);
});
function leave(url){
  if(html.classList.contains('menu-open'))toggleMenu(false);
  if(reduce||!curtain){location.href=url;return}
  try{sessionStorage.setItem('cx-tr','1')}catch(e){}
  html.classList.add('tr-out');
  setTimeout(()=>{location.href=url},560);
}
addEventListener('pageshow',e=>{if(e.persisted){html.classList.remove('tr-out','tr-in')}});
if(html.classList.contains('tr-in'))setTimeout(()=>html.classList.remove('tr-in'),1200);

/* ---------- sub-navigation highlight ---------- */
const snLinks=$$('.subnav a');
if(snLinks.length&&'IntersectionObserver' in window){
  const obs=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){snLinks.forEach(l=>l.classList.toggle('on',l.dataset.sn===en.target.id));const on=snLinks.find(l=>l.dataset.sn===en.target.id);if(on){const p=on.parentElement;p.scrollTo({left:on.offsetLeft-p.clientWidth/2+on.offsetWidth/2,behavior:'smooth'})}}}),{rootMargin:'-45% 0px -50% 0px'});
  snLinks.forEach(l=>{const s=document.getElementById(l.dataset.sn);if(s)obs.observe(s)});
}

/* ---------- reveal everything (fallback) ---------- */
function revealAll(){
  html.classList.remove('js-anim');
  $$('.w>span').forEach(s=>s.style.transform='none');
  $$('[data-fade],[data-clip]').forEach(s=>{s.style.opacity='';s.style.transform='';s.style.filter='';s.style.clipPath=''});
  const l=$('#loader');if(l)l.style.display='none';
  lockScroll(false);
}
if(!hasG||reduce){revealAll();$$('.statement .sw').forEach(s=>s.style.opacity=1)}

/* ---------- header ---------- */
const hdr=$('#hdr');let lastY=0;const toTop=$('#toTop');
const onScroll=()=>{
  const y=scrollY;
  hdr.classList.toggle('solid',y>40);
  if(!html.classList.contains('menu-open')&&!(document.activeElement&&document.activeElement.id==='hsIn'))hdr.classList.toggle('hide',y>lastY&&y>400);
  html.classList.toggle('hdr-hidden',hdr.classList.contains('hide'));
  if(toTop)toTop.classList.toggle('show',y>900);
  lastY=y;
};
addEventListener('scroll',onScroll,{passive:true});onScroll();
if(toTop)toTop.addEventListener('click',()=>{if(lenis)lenis.scrollTo(0,{duration:1.4});else scrollTo({top:0,behavior:'smooth'})});

/* ---------- desktop dropdowns ---------- */
const nvs=$$('.nv');
const closeNv=()=>nvs.forEach(n=>{n.classList.remove('open');clearTimeout(n._t)});
nvs.forEach(n=>{
  n.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse')return;nvs.forEach(o=>{if(o!==n){o.classList.remove('open');clearTimeout(o._t)}});clearTimeout(n._t);n.classList.add('open')});
  n.addEventListener('pointerleave',e=>{if(e.pointerType!=='mouse')return;clearTimeout(n._t);n._t=setTimeout(()=>n.classList.remove('open'),120)});
  n.addEventListener('click',e=>{if(e.target.closest('a')){closeNv();setTimeout(()=>{const a=document.activeElement;if(a&&n.contains(a))a.blur()},0)}});
});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.nv'))closeNv()});
addEventListener('scroll',()=>{if(nvs.some(n=>n.classList.contains('open'))&&!document.querySelector('.nv:hover'))closeNv()},{passive:true});

/* ---------- mega menu ---------- */
const mega=$('#mega'),burger=$('#burger');
function toggleMenu(open){
  html.classList.toggle('menu-open',open);burger.setAttribute('aria-expanded',open);mega.setAttribute('aria-hidden',!open);
  hdr.classList.remove('hide');
  if(hasG&&!reduce){
    if(open){
      gsap.set(mega,{visibility:'visible'});
      gsap.to(mega,{clipPath:'inset(0 0 0% 0)',duration:.9,ease:'expo.inOut'});
      gsap.fromTo($$('.mm span',mega),{yPercent:110,y:0},{yPercent:0,y:0,duration:.9,stagger:.05,ease:'expo.out',delay:.35});
      gsap.fromTo($$('.mega__cols>div,.mega__foot',mega),{opacity:0,y:20},{opacity:1,y:0,duration:.8,stagger:.05,delay:.5,ease:'power3.out'});
    }else gsap.to(mega,{clipPath:'inset(0 0 100% 0)',duration:.8,ease:'expo.inOut',onComplete:()=>gsap.set(mega,{visibility:'hidden'})});
  }else{mega.style.visibility=open?'visible':'hidden';mega.style.clipPath=open?'inset(0 0 0% 0)':''}
  lockScroll(open);
}
burger.addEventListener('click',()=>toggleMenu(!html.classList.contains('menu-open')));

/* ---------- overlays ---------- */
let lastFocus=null;
function openOvl(id){
  const o=$(id);if(!o)return;lastFocus=document.activeElement;o.classList.add('open');lockScroll(true);
  if(hasG&&!reduce){gsap.fromTo($('.ovl__bg',o),{opacity:0},{opacity:1,duration:.4});gsap.fromTo($('.ovl__box',o),{y:40,opacity:0,scale:.97},{y:0,opacity:1,scale:1,duration:.7,ease:'expo.out'})}
  const f=$('.ovl__x,input,button',o);if(f)setTimeout(()=>f.focus({preventScroll:true}),60);
}
function closeOvl(o){
  if(!o.classList.contains('open'))return;
  const done=()=>{o.classList.remove('open');if(!$('.ovl.open')&&!html.classList.contains('menu-open'))lockScroll(false);if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true})};
  if(hasG&&!reduce){gsap.to($('.ovl__box',o),{y:30,opacity:0,duration:.35,ease:'power2.in'});gsap.to($('.ovl__bg',o),{opacity:0,duration:.35,onComplete:done})}else done();
}
const closeAll=()=>$$('.ovl.open').forEach(closeOvl);
$$('.ovl').forEach(o=>o.addEventListener('click',e=>{if(e.target.closest('[data-close]'))closeOvl(o)}));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeAll();closeNv();if(html.classList.contains('menu-open'))toggleMenu(false);const a=document.activeElement;if(a&&a.closest&&a.closest('.nv'))a.blur()}
  if(e.key==='Tab'){const o=$('.ovl.open');if(o){const f=$$('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])',o).filter(x=>x.offsetParent!==null);if(f.length){const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}}
});

/* ---------- toast ---------- */
let toastT;
function toast(msg){const tt=$('#toast');if(!tt)return;tt.textContent=msg;tt.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>tt.classList.remove('show'),3400)}

/* ---------- forms: shared submit helper ---------- */
function send(form,kind){
  const ep=CFG.formEndpoint;
  if(!ep){
    // no form service configured yet: hand the enquiry to the visitor's email app so nothing is lost
    if(kind==='contact'||kind==='news'){
      const fd=new FormData(form),lines=[];
      for(const [k,v] of fd.entries()){if(typeof v==='string'&&v.trim()&&k!=='form')lines.push(k+': '+v.trim())}
      const subj=kind==='news'?'Newsletter subscription':'Website enquiry ('+(form.dataset.mode||'general')+')';
      location.href='mailto:'+(CFG.formFallbackEmail||'inquiries@cortec-me.com')+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(lines.join('\n'));
    }
    return Promise.resolve(true);
  }
  const fd=new FormData(form);fd.append('page',location.href);fd.append('lang',lang);
  return fetch(ep,{method:'POST',body:fd,headers:{Accept:'application/json'}}).then(r=>r.ok).catch(()=>false);
}
function validate(form){
  let ok=true;
  $$('[required]',form).forEach(f=>{
    const fld=f.closest('.fld');if(!fld||fld.offsetParent===null)return;
    let v=f.type==='checkbox'?f.checked:f.value.trim()!=='';
    if(v&&f.type==='email')v=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
    fld.classList.toggle('err',!v);f.setAttribute('aria-invalid',String(!v));if(!v)ok=false;
  });
  if(!ok){const f=$('.fld.err',form);if(f){if(hasG)gsap.fromTo(f,{x:-8},{x:0,duration:.5,ease:'elastic.out(1,.3)'});const i=$('input,textarea,select',f);if(i)i.focus()}}
  return ok;
}

/* ---------- product library (products page) ---------- */
const pgrid=$('#pgrid');
let pCat='all',pQ='',libAll=false;
function applyFilter(anim=true){
  if(!pgrid)return;
  const q=pQ.trim().toLowerCase();let shown=0;const vis=[];
  $$('.pcard',pgrid).forEach(el=>{
    const p=PRODUCTS[el.dataset.i];const c=CATS.find(c=>c.id===p.c);
    const hay=(p.n+' '+p.en+' '+(p.ar||'')+' '+c.en+' '+c.ar).toLowerCase();
    const ok=(pCat==='all'||p.c===pCat)&&(!q||q.split(/\s+/).every(w=>hay.includes(w)));
    el.classList.toggle('out',!ok);if(ok){shown++;vis.push(el)}
  });
  const sample=$('#sample');if(sample)sample.style.display=(pCat==='all'||pCat==='lube')&&!q?'':'none';
  const pe=$('#pempty');if(pe)pe.style.display=shown?'none':'block';
  const capN=innerWidth<=600?6:11;let capped=0;vis.forEach((el,i)=>{const c=!libAll&&!q&&i>=capN;el.classList.toggle('cap',c);if(c)capped++});
  const pm=$('#pMore');if(pm){pm.classList.toggle('on',capped>0);$('#pMoreT').textContent=ui('showAll')(shown)}
  const cnt=$('#pCnt');if(cnt)cnt.textContent=ui('showing')(shown,PRODUCTS.length);
  const rst=$('#pRst');if(rst)rst.style.display=(pCat!=='all'||q)?'':'none';
  if(anim&&hasG&&!reduce)gsap.fromTo(vis,{opacity:0,y:24,scale:.98},{opacity:1,y:0,scale:1,duration:.6,stagger:.035,ease:'expo.out',overwrite:true});
  if(hasG)ScrollTrigger.refresh();
}
function renderFilters(){
  $('#filters').innerHTML=CATS.map(c=>{const n=c.id==='all'?PRODUCTS.length:PRODUCTS.filter(p=>p.c===c.id).length;return `<button type="button" class="fbtn${c.id===pCat?' on':''}" data-cat="${c.id}" aria-pressed="${c.id===pCat}">${c[lang]}<em>${n}</em></button>`}).join('');
}
if(pgrid){
  pgrid.insertAdjacentHTML('afterend',`<div class="pmore" id="pMore"><button class="btn btn--line" type="button"><span class="t"><span id="pMoreT"></span></span><span class="ic">${ARR.replace('M5 12h14M13 6l6 6-6 6','M12 5v14M6 13l6 6 6-6')}</span></button></div>`);
  $('#pMore').addEventListener('click',()=>{libAll=true;applyFilter()});
  $('#pfx').innerHTML=`<span class="cnt" id="pCnt" aria-live="polite"></span><button class="rst" id="pRst" type="button">${ui('reset')}</button>`;
  $('#pfx').addEventListener('click',e=>{if(e.target.id==='pRst'){pQ='';pCat='all';$('#pSearch').value='';renderFilters();applyFilter()}});
  $('#filters').addEventListener('click',e=>{const b=e.target.closest('.fbtn');if(!b)return;pCat=b.dataset.cat;$$('#filters .fbtn').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});applyFilter()});
  let sT;$('#pSearch').addEventListener('input',e=>{clearTimeout(sT);sT=setTimeout(()=>{pQ=e.target.value;applyFilter()},140)});
  const qs=new URLSearchParams(location.search);
  if(qs.get('q')){pQ=qs.get('q');$('#pSearch').value=pQ;libAll=true}
  if(qs.get('cat')&&CATS.some(c=>c.id===qs.get('cat'))){pCat=qs.get('cat');libAll=true}
  renderFilters();applyFilter(false);
}
/* product card actions anywhere (quote / data sheet request) — fall back to the link when no form on page */
const form=$('#form');
document.addEventListener('click',e=>{
  const q=e.target.closest('[data-q]'),tr=e.target.closest('[data-tdsreq]');
  if(!form||(!q&&!tr))return;
  e.preventDefault();
  if(q){const p=PRODUCTS[q.dataset.q];prefill('quote',{products:p.n})}
  if(tr){const p=PRODUCTS[tr.dataset.tdsreq];prefill('general',{message:ui('tdsMsg')(p.n)})}
});

/* ---------- "show more" for long grids (case studies, news) ---------- */
function pager(id){
  const g=document.getElementById(id);if(!g||!g.dataset.page)return null;
  const step=+g.dataset.page;let shown=step;
  const btn=document.querySelector(`.js-more[data-for="${id}"]`),wrap=btn&&btn.closest('.js-more-row');
  const vis=()=>[...g.children].filter(x=>!x.classList.contains('out'));
  const apply=()=>{const items=vis();items.forEach((x,i)=>x.classList.toggle('pg-hide',i>=shown));$$('.out',g).forEach(x=>x.classList.remove('pg-hide'));if(wrap)wrap.hidden=items.length<=shown;if(hasG)ScrollTrigger.refresh()};
  if(btn)btn.addEventListener('click',()=>{const before=shown;shown+=step;apply();const fresh=vis().slice(before,shown);if(fresh[0]){const f=fresh[0].querySelector('a,[tabindex]')||fresh[0];if(f.focus)f.focus({preventScroll:true})}if(hasG&&!reduce)gsap.fromTo(fresh,{opacity:0,y:30},{opacity:1,y:0,duration:.7,stagger:.04,ease:'expo.out'});else fresh.forEach(x=>{x.style.opacity=1})});
  apply();return {reset(){shown=step;apply()}};
}
/* ---------- case-study and article filters ---------- */
function tabFilter(tabsSel,itemsSel,key,pg){
  const tabs=$(tabsSel);if(!tabs)return;
  tabs.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',tabs).forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});const k=b.dataset[key];const items=$$(itemsSel);items.forEach(c=>c.classList.toggle('out',k!=='all'&&c.dataset[key==='c'?'c':'k']!==k));if(pg)pg.reset();const v=items.filter(c=>!c.classList.contains('out')&&!c.classList.contains('pg-hide'));if(hasG&&!reduce)gsap.fromTo(v,{opacity:0,y:30},{opacity:1,y:0,duration:.7,stagger:.05,ease:'expo.out'});if(hasG)ScrollTrigger.refresh()});
  $$('button',tabs).forEach(x=>x.setAttribute('aria-pressed',x.classList.contains('on')));
}
tabFilter('#cTabs','#cGrid .case','c',pager('cGrid'));
tabFilter('#aTabs','#aGrid .art','a',pager('aGrid'));

/* ---------- home: projects grid + case modal ---------- */
const pjgrid=$('#pjgrid');let pjCat='all';
function renderProjects(){
  $('#pjTabs').innerHTML=PJCATS.map(c=>`<button type="button" class="fbtn${c.id===pjCat?' on':''}" data-pj="${c.id}">${c[lang]}</button>`).join('');
  pjgrid.innerHTML=PROJECTS.map((p,i)=>`<article class="pj${pjCat!=='all'&&p.c!==pjCat?' out':''}" data-i="${i}" data-cur-k="view" tabindex="0" role="button" aria-label="${p.t[lang].replace(/"/g,'&quot;')}"><img src="${p.img}" alt="" loading="lazy"><span class="go">${ARR}</span><div class="tg"><span>${PJCATS.find(c=>c.id===p.c)[lang]}</span><span>${p.loc[lang]}</span></div><h3>${p.t[lang]}</h3></article>`).join('');
}
function openCase(i){
  const p=PROJECTS[i];
  $('#csBody').innerHTML=`<div class="cs__img"><img src="${p.img}" alt=""></div><div class="cs__b"><span class="eyebrow"><i></i>${ui('cs')} · ${p.loc[lang]}</span><h3>${p.t[lang]}</h3><p class="lead" style="margin-bottom:22px">${p.d[lang]}</p><div class="cs__cols"><div><h4>${ui('ind')}</h4><p>${PJCATS.find(c=>c.id===p.c)[lang]}</p></div><div><h4>${lang==='ar'?'الموقع':'Location'}</h4><p>${p.loc[lang]}</p></div><div><h4>${lang==='ar'?'المنتج':'Product'}</h4><p class="ltr">${p.p}</p></div></div><div class="cs__foot"><a class="btn btn--line" href="${R+p.u}"><span class="t"><span>${ui('caseRead')}</span></span><span class="ic">${ARR}</span></a><a class="btn" href="${contactUrl('consult')}" data-consult><span class="t"><span>${ui('sim')}</span></span><span class="ic">${ARR}</span></a></div></div>`;
  openOvl('#csModal');
}
if(pjgrid){
  renderProjects();
  $('#pjTabs').addEventListener('click',e=>{
    const b=e.target.closest('[data-pj]');if(!b)return;pjCat=b.dataset.pj;
    $$('#pjTabs .fbtn').forEach(x=>x.classList.toggle('on',x===b));
    const items=$$('.pj');
    const show=()=>{items.forEach(el=>el.classList.toggle('out',pjCat!=='all'&&PROJECTS[el.dataset.i].c!==pjCat));const v=items.filter(x=>!x.classList.contains('out'));if(hasG&&!reduce)gsap.fromTo(v,{opacity:0,y:40},{opacity:1,y:0,duration:.8,stagger:.06,ease:'expo.out'});if(hasG)ScrollTrigger.refresh()};
    if(hasG&&!reduce)gsap.to(items,{opacity:0,y:-10,duration:.25,onComplete:show});else show();
  });
  pjgrid.addEventListener('click',e=>{const c=e.target.closest('.pj');if(c)openCase(c.dataset.i)});
  pjgrid.addEventListener('keydown',e=>{const c=e.target.closest('.pj');if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openCase(c.dataset.i)}});
}

/* ---------- home: detail drawers (solutions & industries) ---------- */
const CHECK='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
const recList=recs=>`<div class="dr__list">${recs.map(n=>{const p=PRODUCTS.find(p=>p.n===n);if(!p)return '';return `<a class="dr__prod" href="${prodUrl(p)}"><span><b>${p.n}</b><small>${p[lang]||p.en}</small></span>${ARR}</a>`}).join('')}</div>`;
const SOLR=['solutions/#programs','equipment-preservation/','solutions/#cefs','solutions/#integrity','solutions/#cefs','solutions/#webinar'];
const INDR={'oil-gas':'oil-gas/',construction:'construction/','power-water':'power-water/',manufacturing:'manufacturing-industries/',aviation:'aviation/',military:'military/',marine:'marine-offshore/'};
let dragMoved=false;
function openDrawer(type,i){
  let h='';
  if(type==='sol'){
    const d=SOLS[i-1];
    h=`<div class="dr__img"><img src="${d.img}" alt=""><span class="n">0${i}</span></div><div class="dr__b"><span class="eyebrow"><i></i>${ui('sol')}</span><h3>${t('s'+i+'.t')}</h3><p>${t('s'+i+'.p')}</p><h4>${ui('incl')}</h4><ul class="dr__list">${d.inc[lang].map(x=>`<li>${CHECK}<span>${x}</span></li>`).join('')}</ul><h4>${ui('recs')}</h4>${recList(d.recs)}<div class="dr__cta"><a class="btn" href="${contactUrl('consult')}"><span class="t"><span>${ui('consult')}</span></span><span class="ic">${ARR}</span></a><a class="btn btn--line" href="${LR+SOLR[i-1]}"><span class="t"><span>${ui('more')}</span></span><span class="ic">${ARR}</span></a></div></div>`;
  }else{
    const d=INDS[i-1];
    h=`<div class="dr__img"><img src="${d.img}" alt=""><span class="n">0${i}</span></div><div class="dr__b"><span class="eyebrow"><i></i>${ui('ind')}</span><h3>${t('i'+i+'.t')}</h3><p>${t('i'+i+'.p')}</p><h4>${ui('apps')}</h4><div class="dr__chips">${['a','b','c'].map(k=>`<span>${t('i'+i+'.'+k)}</span>`).join('')}</div><h4>${ui('recs')}</h4>${recList(d.recs)}<div class="dr__cta"><a class="btn" href="${contactUrl('consult')}"><span class="t"><span>${ui('consult')}</span></span><span class="ic">${ARR}</span></a><a class="btn btn--line" href="${LR+(INDR[d.route]||'industries/')}"><span class="t"><span>${ui('more')}</span></span><span class="ic">${ARR}</span></a></div></div>`;
  }
  $('#drBody').innerHTML=h;$('#drawer .ovl__box').scrollTop=0;
  const o=$('#drawer');lastFocus=document.activeElement;o.classList.add('open');lockScroll(true);
  setTimeout(()=>{const x=$('.ovl__x',o);if(x)x.focus({preventScroll:true})},60);
  if(hasG&&!reduce){const dx=html.dir==='rtl'?-100:100;gsap.fromTo($('.ovl__bg',o),{opacity:0},{opacity:1,duration:.4});gsap.fromTo($('.ovl__box',o),{xPercent:dx,opacity:1,y:0,scale:1},{xPercent:0,duration:.8,ease:'expo.out'});gsap.from($$('.dr__b>*',o),{opacity:0,y:20,stagger:.04,duration:.7,ease:'expo.out',delay:.2})}
}
if($('#drawer')){
  document.addEventListener('click',e=>{
    const s=e.target.closest('[data-sol]'),d=e.target.closest('[data-ind]');
    if(!s&&!d)return;
    e.preventDefault();e.stopPropagation();
    if(d&&d.classList.contains('icard')&&dragMoved)return;
    if(html.classList.contains('menu-open'))toggleMenu(false);
    closeAll();
    setTimeout(()=>{if(s)openDrawer('sol',+s.dataset.sol);else openDrawer('ind',+d.dataset.ind)},$('.ovl.open')?380:10);
  },true);
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('icard')){e.preventDefault();openDrawer('ind',+e.target.dataset.ind)}});
}

/* ---------- applications accordion (home) ---------- */
const panels=$$('.apanel');
const setPanel=p=>{panels.forEach(x=>x.classList.toggle('on',x===p));if(hasG)setTimeout(()=>ScrollTrigger.refresh(),950)};
panels.forEach(p=>{
  p.addEventListener('click',()=>setPanel(p));
  p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setPanel(p)}});
  if(fine)p.addEventListener('mouseenter',()=>{if(innerWidth>900)setPanel(p)});
});

/* ---------- contact form (contact page) ---------- */
function prefill(mode,vals={}){
  if(!form)return;
  form.classList.remove('sent');setMode(mode);
  if(vals.products&&$('#fprod'))$('#fprod').value=vals.products;
  if(vals.message&&$('#fm'))$('#fm').value=vals.message;
  goTo('contact');
  setTimeout(()=>{const n=$('#fn');if(n)n.focus({preventScroll:true})},1500);
}
let setMode=()=>{};
if(form){
  const ftabs=$('#ftabs'),pill=$('.ind-pill',ftabs);
  const movePill=()=>{const b=$('button.on',ftabs);if(b){pill.style.left=b.offsetLeft+'px';pill.style.width=b.offsetWidth+'px'}};
  setMode=m=>{form.dataset.mode=m;$$('button',ftabs).forEach(b=>{b.classList.toggle('on',b.dataset.mode===m);b.setAttribute('aria-pressed',b.dataset.mode===m)});const mi=$('#fmode');if(mi)mi.value=m;movePill();if(hasG)ScrollTrigger.refresh()};
  ftabs.addEventListener('click',e=>{const b=e.target.closest('button');if(b)setMode(b.dataset.mode)});
  addEventListener('resize',movePill);movePill();
  if(!$('#fmode'))form.insertAdjacentHTML('afterbegin','<input type="hidden" name="type" id="fmode" value="general">');
  document.addEventListener('click',e=>{
    const q=e.target.closest('[data-quote]'),c=e.target.closest('[data-consult]'),s=e.target.closest('[data-sample]');
    if(!q&&!c&&!s)return;e.preventDefault();e.stopPropagation();closeAll();
    if(q)prefill('quote');else if(c){const m=c.dataset.msg;prefill('consult',m?{message:m}:{})}else prefill('general',{message:ui('sampleMsg')});
  },true);
  const mb=$('#moreBtn');
  if(mb)mb.addEventListener('click',()=>{
    const open=!form.classList.contains('open-more');form.classList.toggle('open-more',open);mb.setAttribute('aria-expanded',open);
    if(open&&hasG&&!reduce)gsap.fromTo('#more>*',{opacity:0,y:16},{opacity:1,y:0,stagger:.05,duration:.6,ease:'expo.out'});
    if(hasG)ScrollTrigger.refresh();
  });
  const file=$('#file'),drop=$('#drop');
  if(file&&drop){
    const dt=$('#dropT'),dt0=dt.innerHTML;
    file.addEventListener('change',()=>{const n=file.files.length;dt.innerHTML=n?ui('files')(n):dt0});
    ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
    ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over');if(ev==='drop'&&e.dataTransfer.files.length){file.files=e.dataTransfer.files;file.dispatchEvent(new Event('change'))}}));
    $('#fAgain').addEventListener('click',()=>{form.reset();form.classList.remove('sent');dt.innerHTML=dt0;if(hasG)ScrollTrigger.refresh()});
  }
  form.addEventListener('submit',e=>{
    e.preventDefault();if(!validate(form))return;
    const b=$('button[type=submit]',form);if(b)b.disabled=true;
    send(form,'contact').then(ok=>{
      if(b)b.disabled=false;
      if(!ok){toast(lang==='ar'?'تعذّر الإرسال — يُرجى المحاولة مرة أخرى أو مراسلتنا عبر البريد الإلكتروني.':'Could not send — please try again or email inquiries@cortec-me.com.');return}
      form.classList.add('sent');
      if(window.dataLayer)dataLayer.push({event:'generate_lead',form_type:form.dataset.mode||'general'});
      if(hasG&&!reduce)gsap.fromTo('.fok>*',{opacity:0,y:20},{opacity:1,y:0,stagger:.08,duration:.7,ease:'expo.out'});
      if(hasG)ScrollTrigger.refresh();
    });
  });
  form.addEventListener('input',e=>{const f=e.target.closest('.fld');if(f)f.classList.remove('err')});
  // prefill from URL (?type=quote&product=...&msg=...)
  const qs=new URLSearchParams(location.search);
  const ty=qs.get('type');
  if(ty&&['general','consult','quote'].includes(ty)){
    setMode(ty);
    if(qs.get('product')&&$('#fprod'))$('#fprod').value=qs.get('product');
    if(qs.get('msg')&&$('#fm'))$('#fm').value=qs.get('msg');
    else if(qs.get('sample')&&$('#fm'))$('#fm').value=ui('sampleMsg');
  }
}

/* ---------- newsletter (footer) ---------- */
const news=$('#news');
if(news)news.addEventListener('submit',e=>{
  e.preventDefault();const i=$('input[type=email]',news);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim())){i.setAttribute('aria-invalid','true');i.focus();return}
  i.removeAttribute('aria-invalid');
  send(news,'news').then(ok=>{const b=$('button .t>span',news);b.removeAttribute('data-i18n');b.textContent=ok?ui('subbed'):'!';if(ok){i.value='';if(window.dataLayer)dataLayer.push({event:'newsletter_signup'})}});
});

/* ---------- gated downloads (rig lay-up manuals) ---------- */
$$('.gate').forEach(g=>{
  const f=$('form',g),ok=$('.gate__ok',g);
  const unlock=()=>{f.hidden=true;ok.hidden=false;if(hasG&&!reduce)gsap.fromTo(ok,{opacity:0,y:20},{opacity:1,y:0,duration:.7,ease:'expo.out'});if(hasG)ScrollTrigger.refresh()};
  if(store.get('cx-manuals')==='1')unlock();
  f.addEventListener('submit',e=>{e.preventDefault();if(!validate(f))return;send(f,'gate').then(()=>{store.set('cx-manuals','1');if(window.dataLayer)dataLayer.push({event:'generate_lead',form_type:'manuals'});unlock()})});
  f.addEventListener('input',e=>{const x=e.target.closest('.fld');if(x)x.classList.remove('err')});
});

/* ---------- site search (header bar + overlay) — index is loaded on first use ---------- */
let SIDX=null,sidxP=null;
const escH=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function loadIndex(){
  if(SIDX)return Promise.resolve(SIDX);
  if(sidxP)return sidxP;
  sidxP=new Promise(res=>{const s=document.createElement('script');s.src=R+'assets/js/search-'+lang+'.js?v='+(CFG.v||'');s.onload=()=>{SIDX=window.CX_IDX||[];res(SIDX)};s.onerror=()=>{SIDX=[];res(SIDX)};document.head.append(s)});
  return sidxP;
}
function doSearch(q){
  const terms=q.toLowerCase().trim().split(/\s+/).filter(Boolean);if(!terms.length||!SIDX)return[];
  const Q=terms.join(' ');
  return SIDX.map(o=>{const T=o.t.toLowerCase(),S=(o.k||'').toLowerCase(),K=(o.k+' '+o.x+' '+o.c).toLowerCase();let sc=0;
    for(const w of terms){if(T.includes(w))sc+=T.startsWith(w)?7:4;else if(S.includes(w))sc+=2;else if(K.includes(w))sc+=1;else return null}
    if(T===Q)sc+=10;if(T.includes(Q))sc+=6;else if(K.includes(Q))sc+=3;if(!o.u.includes('#'))sc+=1;return {o,sc}}).filter(Boolean).sort((a,b)=>b.sc-a.sc).slice(0,12).map(x=>x.o);
}
function hl(s,q){let out=escH(s);q.trim().split(/\s+/).filter(w=>w.length>1).forEach(w=>{out=out.replace(new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<mark>$1</mark>')});return out}
function snip(o,q){const w=q.trim().split(/\s+/)[0].toLowerCase();const x=o.x||'';const i=x.toLowerCase().indexOf(w);const s=i>50?'…'+x.slice(i-40,i+120):x.slice(0,150);return hl(s,q)}
function renderRes(box,q){
  if(!q.trim()){box.innerHTML=`<div class="sr-h">${ui('popular')}</div><div class="sr-sugg">${ui('sugg').map(x=>`<button type="button" data-sugg="${escH(x)}">${escH(x)}</button>`).join('')}</div>`;return}
  loadIndex().then(()=>{
    const r=doSearch(q);
    box.innerHTML=r.length?`<div class="sr-h">${ui('results')}</div>`+r.map((o,i)=>`<a class="sr-i${i?'':' act'}" href="${R+o.u}" role="option"><small>${escH(o.c)}</small><b>${hl(o.t,q)}</b><span>${snip(o,q)}</span></a>`).join(''):`<div class="sr-none">${ui('sNone')}</div>`;
  });
}
function keyNav(e,box){
  const items=$$('.sr-i',box);let i=items.findIndex(x=>x.classList.contains('act'));
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!items.length)return;i=(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach((x,k)=>x.classList.toggle('act',k===i));items[i].scrollIntoView({block:'nearest'})}
  else if(e.key==='Enter'){e.preventDefault();const b=items[i>=0?i:0];if(b)goRes(b)}
}
function goRes(a){
  closeHs();closeAll();
  const u=new URL(a.href,location.href);
  if(u.pathname===location.pathname&&u.hash){const el=document.getElementById(u.hash.slice(1));history.replaceState(null,'',u.hash);if(el)setTimeout(()=>goTo(el),300);return}
  leave(a.href);
}
const hs=$('#hs'),hsIn=$('#hsIn'),hsRes=$('#hsRes');
function openHs(){hs.classList.add('open');hsIn.setAttribute('aria-expanded','true');renderRes(hsRes,hsIn.value);loadIndex()}
function closeHs(){if(!hs)return;hs.classList.remove('open');hsIn.setAttribute('aria-expanded','false')}
if(hs){
  hsIn.addEventListener('focus',openHs);
  let hsT;hsIn.addEventListener('input',()=>{clearTimeout(hsT);hsT=setTimeout(()=>{hs.classList.add('open');renderRes(hsRes,hsIn.value)},90)});
  hsIn.addEventListener('keydown',e=>{if(e.key==='Escape'){closeHs();hsIn.blur();return}keyNav(e,hsRes)});
  hsRes.addEventListener('mousedown',e=>e.preventDefault());
  hsRes.addEventListener('click',e=>{const sg=e.target.closest('[data-sugg]');if(sg){hsIn.value=sg.dataset.sugg;renderRes(hsRes,hsIn.value);hsIn.focus();return}const b=e.target.closest('.sr-i');if(b){e.preventDefault();e.stopPropagation();hsIn.blur();goRes(b)}});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#hs'))closeHs()});
}
const gIn=$('#gSearch'),gRes=$('#gRes');
function openSearch(){openOvl('#srchModal');gIn.value='';renderRes(gRes,'');loadIndex();setTimeout(()=>gIn.focus(),80)}
$('#openSearch').addEventListener('click',openSearch);
gIn.setAttribute('aria-label',$('#hsIn')?$('#hsIn').getAttribute('aria-label'):'Search');
let gT;gIn.addEventListener('input',()=>{clearTimeout(gT);gT=setTimeout(()=>renderRes(gRes,gIn.value),90)});
gIn.addEventListener('keydown',e=>keyNav(e,gRes));
gRes.addEventListener('click',e=>{const sg=e.target.closest('[data-sugg]');if(sg){gIn.value=sg.dataset.sugg;renderRes(gRes,gIn.value);gIn.focus();return}const b=e.target.closest('.sr-i');if(b){e.preventDefault();e.stopPropagation();gIn.blur();goRes(b)}});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();if(hs&&hs.offsetParent){hsIn.focus()}else openSearch()}},true);

/* ---------- YouTube modal ---------- */
const ytF=$('#ytFrame');
function openYt(id){ytF.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;openOvl('#ytModal')}
document.addEventListener('click',e=>{const y=e.target.closest('[data-yt]');if(y){e.preventDefault();openYt(y.dataset.yt)}});
document.addEventListener('keydown',e=>{const y=e.target.closest&&e.target.closest('[data-yt]');if(y&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openYt(y.dataset.yt)}});
new MutationObserver(()=>{if(!$('#ytModal').classList.contains('open'))ytF.innerHTML=''}).observe($('#ytModal'),{attributes:true,attributeFilter:['class']});

/* ---------- cookie consent → Google Tag Manager (production host only) ---------- */
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
const prodHost=(CFG.prodHost||'cortec-me.com');
const onProd=location.hostname.replace(/^www\./,'')===prodHost;
let gtmLoaded=false;
function loadGTM(){
  if(gtmLoaded||!CFG.gtmId||!onProd)return;gtmLoaded=true;
  dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
  const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(CFG.gtmId);document.head.append(s);
}
function applyConsent(v){
  const g=v==='1'?'granted':'denied';
  gtag('consent','update',{analytics_storage:g,ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  if(v==='1')loadGTM();
}
const ck=$('#cookie');
const saved=store.get('cx-cookie');
if(saved)applyConsent(saved);else if(ck)setTimeout(()=>ck.classList.add('show'),2600);
if(ck)ck.addEventListener('click',e=>{const b=e.target.closest('[data-ck]');if(!b)return;store.set('cx-cookie',b.dataset.ck);applyConsent(b.dataset.ck);ck.classList.remove('show')});
$$('[data-cookie-settings]').forEach(b=>b.addEventListener('click',()=>{if(ck)ck.classList.add('show')}));

/* ---------- statement word reveal (home) ---------- */
const stmt=$('#statement');
if(stmt){split(stmt,'sw');if(!hasG||reduce)$$('.sw',stmt).forEach(s=>s.style.opacity=1);else gsap.to($$('.sw',stmt),{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:stmt,start:'top 85%',end:'bottom 45%',scrub:.6}})}

/* ---------- technology videos: autoplay in view + sound toggle ---------- */
const tvids=$$('.tvid');
const playSafe=v=>{const pr=v.play();if(pr&&pr.catch)pr.catch(()=>{})};
function sndLabel(){$$('.snd').forEach(b=>{const on=b.getAttribute('aria-pressed')==='true';$('.snd__t',b).textContent=on?ui('sndOn'):ui('sndOff');b.setAttribute('aria-label',on?ui('sndOn'):ui('sndOff'))})}
sndLabel();
const loadV=v=>{if(!v.getAttribute('src')){v.src=innerWidth<=900?v.dataset.mob:v.dataset.full;v.load()}};
if('IntersectionObserver' in window){
  const vo=new IntersectionObserver(es=>es.forEach(en=>{const v=en.target;
    if(en.isIntersecting){loadV(v);if(!reduce||!v.muted)playSafe(v)}else if(v.getAttribute('src')){v.pause()}}),{rootMargin:'200px 0px',threshold:.01});
  tvids.forEach(v=>vo.observe(v));
}else tvids.forEach(v=>{loadV(v);playSafe(v)});
tvids.forEach(v=>{
  const st=+(v.dataset.start||0);
  v.addEventListener('loadedmetadata',()=>{if(st&&v.currentTime<st)v.currentTime=st},{once:true});
  v.addEventListener('ended',()=>{v.currentTime=st;playSafe(v)});
  const bar=$('.tprog i',v.parentElement);
  if(bar)v.addEventListener('timeupdate',()=>{if(v.duration)bar.style.transform=`scaleX(${v.currentTime/v.duration})`});
});
$$('.snd').forEach(b=>b.addEventListener('click',e=>{
  e.stopPropagation();
  const v=$('video',b.parentElement),turnOn=v.muted;
  tvids.forEach(o=>{if(o!==v){o.muted=true;const s=$('.snd',o.parentElement);if(s)s.setAttribute('aria-pressed','false')}});
  loadV(v);v.muted=!turnOn;if(turnOn){v.volume=1;playSafe(v)}
  b.setAttribute('aria-pressed',String(turnOn));sndLabel();
}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)tvids.forEach(v=>v.pause())});

/* ---------- accordions (mobile menu + footer) ---------- */
$$('.mega__cols>div,.fcols>div').forEach(d=>{const h=$('h4,h5',d);if(!h)return;h.setAttribute('role','button');h.setAttribute('tabindex','0');h.setAttribute('aria-expanded','false');
  const tg=()=>{if(innerWidth>900)return;const o=!d.classList.contains('open');d.parentElement.querySelectorAll(':scope>div.open').forEach(x=>{if(x!==d){x.classList.remove('open');const hh=$('h4,h5',x);if(hh)hh.setAttribute('aria-expanded','false')}});d.classList.toggle('open',o);h.setAttribute('aria-expanded',o)};
  h.addEventListener('click',tg);h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tg()}});});

/* ---------- solution thumbnails (home, mobile) ---------- */
const fimgs=$$('#follow img');
$$('.srow').forEach(r=>{const src=fimgs[+r.dataset.img]&&fimgs[+r.dataset.img].getAttribute('src');if(src)r.insertAdjacentHTML('afterbegin',`<img class="sthumb" src="${src}" alt="" loading="lazy">`)});

/* ---------- industries carousel (home) ---------- */
const track=$('#indTrack');
if(track){
  const prog=$('#indProg'),prev=$('#indPrev'),next=$('#indNext');
  const maxS=()=>track.scrollWidth-track.clientWidth;
  const upd=()=>{const m=maxS(),x=Math.abs(track.scrollLeft),p=m>0?x/m:0;prog.style.transform=`scaleX(${Math.max(.04,p)})`;prev.disabled=x<4;next.disabled=x>m-4};
  track.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
  const step=dir=>{const c=$('.icard',track);const w=c?c.offsetWidth+parseFloat(getComputedStyle(track).columnGap||20):400;track.scrollBy({left:dir*w*(html.dir==='rtl'?-1:1),behavior:'smooth'})};
  prev.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
  let dX=0,dS=0,dragging=false;
  track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;dragging=true;dragMoved=false;dX=e.clientX;dS=track.scrollLeft});
  addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-dX;if(Math.abs(dx)>6){dragMoved=true;track.classList.add('drag')}if(dragMoved)track.scrollLeft=dS-dx});
  addEventListener('pointerup',()=>{if(!dragging)return;dragging=false;track.classList.remove('drag');setTimeout(()=>dragMoved=false,30)});
  track.addEventListener('dragstart',e=>e.preventDefault());
}

/* ---------- mobile action bar ---------- */
const mbar=$('#mbar');
if(mbar){
  const hideSet=new Set();
  const mbarUpd=()=>mbar.classList.toggle('show',scrollY>innerHeight*.7&&!hideSet.size&&!html.classList.contains('menu-open'));
  const ctObs=new IntersectionObserver(es=>{es.forEach(en=>en.isIntersecting?hideSet.add(en.target):hideSet.delete(en.target));mbarUpd()},{threshold:.1});
  ['#contact','.ftr','.gate'].forEach(s=>$$(s).forEach(x=>ctObs.observe(x)));
  addEventListener('scroll',mbarUpd,{passive:true});
}

/* ---------- initial anchor (deep links) ---------- */
function initialAnchor(){
  const h=decodeURIComponent(location.hash||'').slice(1);if(!h)return;
  const el=document.getElementById(h);if(!el)return;
  setTimeout(()=>goTo(el,false),80);
}

/* ---------- cursor + magnet (desktop) ---------- */
if(hasG&&fine&&!reduce){
  const cur=$('#cur'),label=$('span',cur);
  gsap.set(cur,{x:innerWidth/2,y:innerHeight/2});
  const cx=gsap.quickTo(cur,'x',{duration:.25,ease:'power3'}),cy=gsap.quickTo(cur,'y',{duration:.25,ease:'power3'});
  addEventListener('mousemove',e=>{cx(e.clientX);cy(e.clientY)});
  document.addEventListener('mouseover',e=>{
    const big=e.target.closest('[data-cur-k],.icard');
    const lnk=e.target.closest('a,button,input,select,textarea,label');
    cur.classList.toggle('big',!!big);cur.classList.toggle('link',!big&&!!lnk);
    if(big)label.textContent=ui(big.dataset.curK||(big.classList.contains('icard')?'drag':'view'));
  });
  $$('#magnet,.hdr__cta').forEach(m=>{
    const k=m.id==='magnet'?.4:.25;
    m.addEventListener('mousemove',e=>{const r=m.getBoundingClientRect();gsap.to(m,{x:(e.clientX-r.left-r.width/2)*k,y:(e.clientY-r.top-r.height/2)*k,duration:.6,ease:'power3.out'})});
    m.addEventListener('mouseleave',()=>gsap.to(m,{x:0,y:0,duration:1,ease:'elastic.out(1,.35)'}));
  });
}

if(!hasG||reduce){initialAnchor();return}

/* =========================================================
   GSAP — Framer-style motion
   ========================================================= */
const ease='expo.out';
const loader=$('#loader');
let seen=true;
if(loader){try{seen=sessionStorage.getItem('cx-seen')==='1';sessionStorage.setItem('cx-seen','1')}catch(e){seen=false}}

function startIntro(){
  const bar=$('#ldBar');
  const cv=$('#introCv'),ctx=cv.getContext('2d');
  const TAU=Math.PI*2,T_END=2.7;
  let W,H,cx,cy,R0,DPR,mobile;
  function size(){
    W=innerWidth;H=innerHeight;mobile=W<=900;DPR=Math.min(devicePixelRatio||1,mobile?1.75:2);
    cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);
    if(mobile){cx=W/2;cy=H*.38;R0=Math.min(W*.29,H*.19)}else{cx=W*.66;cy=H*.47;R0=Math.min(H*.26,W*.18)}
  }
  size();addEventListener('resize',size);
  const TEETH=12,ROOT=.82,OFF=.13;
  const ss=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
  const prof=a=>{let p=(a/TAU*TEETH)%1;if(p<0)p+=1;return p<.1?ss(p/.1):p<.42?1:p<.52?1-ss((p-.42)/.1):0};
  const rAt=a=>R0*(ROOT+(1-ROOT)*prof(a));
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const eo=x=>1-Math.pow(1-clamp(x),3);
  const spr=document.createElement('canvas');spr.width=spr.height=48;const sx=spr.getContext('2d');
  const gr=sx.createRadialGradient(24,24,0,24,24,24);gr.addColorStop(0,'rgba(190,255,215,1)');gr.addColorStop(.22,'rgba(3,190,105,.85)');gr.addColorStop(1,'rgba(2,157,88,0)');sx.fillStyle=gr;sx.fillRect(0,0,48,48);
  const N=mobile?230:460,P=[];
  for(let i=0;i<N;i++){
    const a=Math.random()*TAU,far=Math.hypot(W,H)*(.55+Math.random()*.35);
    P.push({sx:cx+Math.cos(a)*far,sy:cy+Math.sin(a)*far,ta:(i/N)*TAU+(Math.random()-.5)*.03,to:OFF*(.7+Math.random()*.6),d:Math.random()*.55,s:.35+Math.random()*.9,ph:Math.random()*TAU,sw:(Math.random()-.5)*2});
  }
  const D=[],SPL=[],HITS=[];const ND=mobile?7:11;
  for(let i=0;i<ND;i++)D.push({t0:1.02+i*(.5/ND)+Math.random()*.05,x0:(Math.random()-.5)*1.7,v:1.5+Math.random()*.5,live:false,hit:false,fade:1});
  let rot=0,raf=0,t0=performance.now(),stopped=false;
  function gearPath(off){const steps=TEETH*28;ctx.beginPath();for(let i=0;i<=steps;i++){const a=i/steps*TAU,r=rAt(a)+off,x=cx+Math.cos(a+rot)*r,y=cy+Math.sin(a+rot)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath()}
  function drawGear(c,fade){
    ctx.save();ctx.globalAlpha=fade;gearPath(0);
    ctx.moveTo(cx+R0*.3,cy);ctx.arc(cx,cy,R0*.3,0,TAU,true);
    for(let k=0;k<6;k++){const a=rot+k*TAU/6,hx=cx+Math.cos(a)*R0*.56,hy=cy+Math.sin(a)*R0*.56;ctx.moveTo(hx+R0*.105,hy);ctx.arc(hx,hy,R0*.105,0,TAU,true)}
    const g1=ctx.createLinearGradient(cx-R0,cy-R0,cx+R0,cy+R0);g1.addColorStop(0,'#e4e4e4');g1.addColorStop(.45,'#8e8e8e');g1.addColorStop(1,'#353535');
    ctx.fillStyle=g1;ctx.fill('evenodd');
    if(c>0){ctx.globalAlpha=fade*c;const g2=ctx.createLinearGradient(cx-R0,cy-R0,cx+R0,cy+R0);g2.addColorStop(0,'#f4f8f6');g2.addColorStop(.4,'#a9bdb6');g2.addColorStop(.75,'#4f6a61');g2.addColorStop(1,'#1d3a30');ctx.fillStyle=g2;ctx.fill('evenodd')}
    ctx.globalAlpha=fade*.5;ctx.lineWidth=1;ctx.strokeStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.arc(cx,cy,R0*.74,0,TAU);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(cx,cy,R0*.4,0,TAU);ctx.stroke();
    ctx.restore();
  }
  function drawShield(f,tt){
    if(f<=0)return;
    ctx.save();ctx.globalCompositeOperation='lighter';
    [[14,.07],[7,.16],[2.2,.75]].forEach(([lw,al])=>{gearPath(R0*OFF);ctx.lineWidth=lw;ctx.strokeStyle=`rgba(3,190,105,${al*f})`;ctx.stroke()});
    HITS.forEach(h=>{const age=tt-h.t;if(age>.6)return;const k=1-age/.6;ctx.lineWidth=3+6*k;ctx.strokeStyle=`rgba(170,255,210,${.85*k})`;
      ctx.beginPath();const steps=30;for(let i=0;i<=steps;i++){const la=h.a-rot-.45+.9*i/steps,r=rAt(la)+R0*OFF,x=cx+Math.cos(la+rot)*r,y=cy+Math.sin(la+rot)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()});
    ctx.restore();
  }
  function frame(now){
    if(stopped)return;
    const tt=(now-t0)/1000;rot=tt*.22;
    ctx.clearRect(0,0,W,H);
    const fadeIn=eo(tt/.45),colour=eo((tt-1.75)/.55);
    drawGear(colour,fadeIn);
    let arrived=0;
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(const p of P){
      const k=clamp((tt-.08-p.d)/.85),e=eo(k);
      const la=p.ta,wa=la+rot,r=rAt(la)+p.to*R0+Math.sin(tt*3+p.ph)*R0*.006;
      const tx=cx+Math.cos(wa)*r,ty=cy+Math.sin(wa)*r;
      const wob=(1-e)*R0*.35*p.sw;
      let x=p.sx+(tx-p.sx)*e,y=p.sy+(ty-p.sy)*e;
      x+=-Math.sin(wa)*wob*Math.sin(k*Math.PI);y+=Math.cos(wa)*wob*Math.sin(k*Math.PI);
      if(k>=1)arrived++;
      const sz=(mobile?9:11)*p.s*(.6+.4*e),al=clamp(k*3)*(.55+.45*Math.sin(tt*4+p.ph)*.5+.25);
      ctx.globalAlpha=clamp(al);ctx.drawImage(spr,x-sz/2,y-sz/2,sz,sz);
    }
    ctx.restore();
    drawShield(clamp(arrived/N*1.4)*fadeIn,tt);
    ctx.save();
    for(const d of D){
      if(tt<d.t0)continue;
      if(!d.live){d.live=true;d.x=cx+d.x0*R0;d.y=-30;d.vx=0;d.vy=H*d.v;d.lt=tt}
      const dt=Math.min(.033,tt-d.lt);d.lt=tt;
      d.vy+=H*2.2*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;
      if(!d.hit){const dx=d.x-cx,dy=d.y-cy,dist=Math.hypot(dx,dy),a=Math.atan2(dy,dx),sr=rAt(a-rot)+R0*OFF;
        if(dist<=sr){d.hit=true;const nx=dx/dist,ny=dy/dist,dot=d.vx*nx+d.vy*ny;d.vx=(d.vx-2*dot*nx)*.32+nx*R0*1.2;d.vy=(d.vy-2*dot*ny)*.32+ny*R0*1.2;d.x=cx+nx*sr;d.y=cy+ny*sr;HITS.push({a,t:tt});
          for(let k=0;k<4;k++){const sa=a+(Math.random()-.5)*1.6,sp=R0*(1.4+Math.random()*1.6);SPL.push({x:d.x,y:d.y,vx:Math.cos(sa)*sp,vy:Math.sin(sa)*sp-R0*.6,t:tt,r:R0*.012*(1+Math.random())})}}}
      if(d.hit)d.fade=Math.max(0,d.fade-dt*2.4);
      if(d.fade<=0||d.y>H+40)continue;
      const rr=Math.max(3,R0*.045);
      ctx.globalAlpha=d.fade;
      const g=ctx.createRadialGradient(d.x-rr*.3,d.y-rr*.3,0,d.x,d.y,rr*1.4);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.5,'rgba(170,215,240,.75)');g.addColorStop(1,'rgba(120,170,210,.15)');
      ctx.fillStyle=g;ctx.beginPath();
      if(!d.hit){ctx.moveTo(d.x,d.y-rr*2.4);ctx.bezierCurveTo(d.x+rr*1.1,d.y-rr*.6,d.x+rr,d.y+rr,d.x,d.y+rr);ctx.bezierCurveTo(d.x-rr,d.y+rr,d.x-rr*1.1,d.y-rr*.6,d.x,d.y-rr*2.4)}
      else ctx.arc(d.x,d.y,rr*.8,0,TAU);
      ctx.fill();
    }
    for(const s of SPL){const age=tt-s.t;if(age>.55)continue;const dt=1/60;s.vy+=H*1.6*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;ctx.globalAlpha=1-age/.55;ctx.fillStyle='rgba(200,230,250,.9)';ctx.beginPath();ctx.arc(s.x,s.y,Math.max(1,s.r),0,TAU);ctx.fill()}
    ctx.restore();
    bar.style.transform=`scaleX(${clamp(tt/T_END)})`;
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  const copy=gsap.timeline({delay:1.55}).fromTo('.intro__copy>*',{opacity:0,y:22,filter:'blur(8px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.9,stagger:.09,ease:'expo.out'});
  let resolveDone;const done=new Promise(r=>resolveDone=r);
  const endT=setTimeout(()=>resolveDone(),T_END*1000);
  $('#introSkip').addEventListener('click',()=>{clearTimeout(endT);copy.progress(1);resolveDone()},{once:true});
  return {done,stop(){stopped=true;cancelAnimationFrame(raf);removeEventListener('resize',size)}};
}

function heroIntro(){
  if(!$('.hero'))return;
  const h=gsap.timeline();
  h.fromTo('.hero h1 .w>span',{yPercent:110,y:0},{yPercent:0,y:0,duration:1.3,stagger:.07,ease},0)
   .to('.hero [data-fade]',{opacity:1,y:0,filter:'blur(0px)',duration:1.1,stagger:.1,ease},.25)
   .fromTo('#heroFrame',{clipPath:'inset(14% 8% 0% 8% round 32px)'},{clipPath:'inset(0% 0% 0% 0% round 32px)',duration:1.6,ease:'expo.inOut'},.1)
   .fromTo('#heroImg',{scale:1.25},{scale:1,duration:1.9,ease:'expo.out'},.1)
   .from('.glass',{opacity:0,y:20,duration:.9,stagger:.12,ease},1)
   .from('.hdr__in>*',{opacity:0,y:-16,duration:.9,stagger:.06,ease},.2);
}

if(loader&&!seen){
  lockScroll(true);scrollTo(0,0);
  const intro=startIntro();
  const safety=setTimeout(()=>{intro.stop();revealAll()},9000);
  intro.done.then(()=>{
    clearTimeout(safety);
    gsap.timeline({onComplete:()=>{intro.stop();loader.style.display='none';lockScroll(false);ScrollTrigger.refresh()}})
      .to('.intro__copy,.intro__skip',{opacity:0,y:-24,duration:.4,ease:'power2.in'})
      .to('#introCv',{scale:1.08,opacity:0,duration:.9,ease:'power2.in'},'<')
      .to(loader,{clipPath:'inset(0 0 100% 0)',duration:.9,ease:'expo.inOut'},'-=.55')
      .add(heroIntro,'-=.55');
  });
}else{
  if(loader)loader.style.display='none';
  requestAnimationFrame(()=>{heroIntro();ScrollTrigger.refresh()});
}

const mob=innerWidth<=900;
/* safety pass: animate in anything already on screen whose trigger was skipped (deep links, fast scroll) */
revealPass=()=>{
  const Hh=innerHeight*.96;
  $$('[data-fade]').forEach(el=>{if(el.closest('.hero'))return;const r=el.getBoundingClientRect();if(r.top<Hh&&r.bottom>-200&&+getComputedStyle(el).opacity<.05)gsap.to(el,{opacity:1,y:0,filter:'blur(0px)',duration:.9,ease,overwrite:true})});
  $$('[data-split]').forEach(el=>{if(el.closest('.hero'))return;const r=el.getBoundingClientRect();if(r.top>Hh||r.bottom<-200)return;const sp=$$('.w>span',el).filter(x=>{const m=getComputedStyle(x).transform;return m!=='none'&&parseFloat(m.split(',')[5])>2});if(sp.length)gsap.to(sp,{yPercent:0,y:0,duration:1.1,stagger:.04,ease,overwrite:true})});
  $$('[data-clip]').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<Hh&&r.bottom>-200&&getComputedStyle(el).clipPath.indexOf('100%')>-1)gsap.to(el,{clipPath:'inset(0% 0 0 0)',duration:1.2,ease:'expo.inOut',overwrite:true})});
  $$('.pcard:not(.out):not(.cap),.sample,.case,.pj').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<Hh&&r.bottom>-200&&+getComputedStyle(el).opacity<.05)gsap.to(el,{opacity:1,y:0,duration:.8,ease,overwrite:true})});
};
let rpT=0;addEventListener('scroll',()=>{const n=Date.now();if(n-rpT>250){rpT=n;setTimeout(revealPass,300)}},{passive:true});

if($('.hero__media')&&!mob){
  gsap.to('#heroImg',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.hero__media',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.fromTo('#heroFrame',{scale:1},{scale:.94,ease:'none',scrollTrigger:{trigger:'.hero__media',start:'center center',end:'bottom top',scrub:true}});
}
$$('[data-split]').forEach(el=>{
  if(el.closest('.hero'))return;
  gsap.fromTo($$('.w>span',el),{yPercent:110,y:0},{yPercent:0,y:0,duration:1.2,stagger:.05,ease,scrollTrigger:{trigger:el,start:'top 88%'}});
});
ScrollTrigger.batch($$('[data-fade]').filter(e=>!e.closest('.hero')),{start:'top 90%',once:true,
  onEnter:b=>gsap.to(b,{opacity:1,y:0,filter:'blur(0px)',duration:1.1,stagger:.08,ease,overwrite:true})});
$$('[data-clip]').forEach(el=>{gsap.to(el,{clipPath:'inset(0% 0 0 0)',duration:1.5,ease:'expo.inOut',scrollTrigger:{trigger:el,start:'top 85%'}})});
$$('[data-par]').forEach(img=>{
  if(mob)return;
  const a=+img.dataset.par;gsap.set(img,{scale:1.2});
  gsap.fromTo(img,{yPercent:-a},{yPercent:a,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
});
$$('[data-count]').forEach(el=>{
  const end=+el.dataset.count,from=+(el.dataset.from||0),o={v:from};
  ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>gsap.to(o,{v:end,duration:2.2,ease:'power3.out',onUpdate:()=>el.textContent=Math.round(o.v)})});
});
if($('.sol')&&!mob)gsap.from('.sol',{borderRadius:'0px',scrollTrigger:{trigger:'.sol',start:'top bottom',end:'top 40%',scrub:true}});
if(track)gsap.fromTo('.icard',{opacity:0,x:80},{opacity:1,x:0,duration:1.2,stagger:.08,ease,scrollTrigger:{trigger:'#indTrack',start:'top 85%'}});
if($$('.pj,.pcard,.sample').length)gsap.set('.pj,.pcard,.sample',{opacity:0});
ScrollTrigger.batch('.pj',{start:'top 92%',once:true,onEnter:b=>gsap.fromTo(b,{opacity:0,y:60,scale:.97},{opacity:1,y:0,scale:1,duration:1.2,stagger:.1,ease})});
ScrollTrigger.batch('.pcard,.sample',{start:'top 94%',once:true,onEnter:b=>gsap.fromTo(b,{opacity:0,y:40},{opacity:1,y:0,duration:1,stagger:.06,ease})});
if($('#susBig')&&!mob)gsap.fromTo('#susBig',{xPercent:0},{xPercent:-35,ease:'none',scrollTrigger:{trigger:'.sus',start:'top bottom',end:'bottom top',scrub:true}});
if($('.exp h2')&&!mob)gsap.from('.exp h2',{scale:.92,transformOrigin:'0% 50%',ease:'none',scrollTrigger:{trigger:'.exp',start:'top bottom',end:'center center',scrub:true}});
if($('#ftLogo'))gsap.fromTo('#ftLogo svg',{yPercent:60,opacity:0},{yPercent:0,opacity:1,ease:'none',scrollTrigger:{trigger:'#ftLogo',start:'top bottom',end:'bottom 95%',scrub:true}});
const marq=$('#marq');let skew=0;
if(marq&&!mob)ScrollTrigger.create({onUpdate:s=>{const v=gsap.utils.clamp(-6,6,s.getVelocity()/300);if(Math.abs(v)>Math.abs(skew)){skew=v;gsap.to(marq,{skewX:-skew,duration:.3,overwrite:true,onComplete:()=>{skew=0;gsap.to(marq,{skewX:0,duration:.8,ease:'power3'})}})}}});


/* ---------- in-site PDF viewer (data sheets, brochures, manuals open inside the site) ---------- */
(()=>{
  const T=lang==='ar'?{dl:'تنزيل',close:'إغلاق',load:'جارٍ تحميل المستند…',page:'صفحة',of:'من',fail:'تعذّر عرض المعاينة هنا.',failb:'يمكنك تنزيل الملف بدلاً من ذلك.'}
                     :{dl:'Download',close:'Close',load:'Loading document…',page:'Page',of:'of',fail:'The preview can’t be shown here.',failb:'You can download the file instead.'};
  const PJ='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  let lib=null,box,body,ttl,cnt,dlb,lastFocus=null,token=0,io=null;
  const loadLib=()=>lib||(lib=new Promise((ok,no)=>{const sc=document.createElement('script');sc.src=PJ+'pdf.min.js';sc.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc=PJ+'pdf.worker.min.js';ok(window.pdfjsLib)};sc.onerror=no;document.head.appendChild(sc)}));
  const isPdf=a=>{try{const u=new URL(a.href,location.href);return /\.pdf$/i.test(u.pathname)}catch(e){return false}};
  const nameOf=(a,u)=>{const hb=a.querySelector('b,strong,h3,h4');const t=(a.getAttribute('aria-label')||(hb&&hb.textContent)||a.textContent||'').replace(/\s+/g,' ').trim();const f=decodeURIComponent(u.split('/').pop().split('?')[0]).replace(/\.pdf$/i,'').replace(/[_-]+/g,' ');return (t&&t.length<70&&!/^(pdf|download|view)$|download|data sheet|تنزيل|نشرة/i.test(t))?t:f};
  function build(){
    box=document.createElement('div');box.className='pdfv';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','pdfvT');box.hidden=true;
    box.innerHTML='<div class="pdfv__bg" data-x></div><div class="pdfv__win"><div class="pdfv__bar"><div class="pdfv__meta"><span class="pdfv__ic" aria-hidden="true">PDF</span><div><b id="pdfvT"></b><small class="pdfv__cnt"></small></div></div><div class="pdfv__act"><a class="pdfv__dl" download target="_self">'+T.dl+'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></a><button class="pdfv__x" type="button" data-x aria-label="'+T.close+'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div><div class="pdfv__body" data-lenis-prevent tabindex="0"></div></div>';
    document.body.appendChild(box);
    body=$('.pdfv__body',box);ttl=$('#pdfvT',box);cnt=$('.pdfv__cnt',box);dlb=$('.pdfv__dl',box);
    box.addEventListener('click',e=>{if(e.target.closest('[data-x]'))close()});
    dlb.addEventListener('click',e=>{const d=box._doc;if(!d)return;e.preventDefault();
      d.getData().then(buf=>{const u=URL.createObjectURL(new Blob([buf],{type:'application/pdf'}));const x=document.createElement('a');x.href=u;x.download=decodeURIComponent(dlb.href.split('/').pop().split('?')[0]);document.body.appendChild(x);x.click();x.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)});
      if(window.dataLayer)dataLayer.push({event:'file_download',file_name:dlb.href.split('/').pop()})});
    box.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();close()}
      if(e.key==='Tab'){const f=$$('a[href],button,[tabindex="0"]',box).filter(x=>x.offsetParent);if(!f.length)return;const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
    });
    addEventListener('resize',()=>{if(!box.hidden&&box._doc)renderAll(box._doc,token)});
  }
  function fallback(url){
    body.innerHTML='<div class="pdfv__msg"><span class="pdfv__big" aria-hidden="true">PDF</span><b>'+T.fail+'</b><span>'+T.failb+'</span><a class="btn" download href="'+url+'"><span class="t">'+T.dl+'</span></a></div>';
  }
  /* same-origin copy first (mirrored wp-content), then the original address */
  function candidates(url){
    const out=[];try{const u=new URL(url,location.href);
      if(/(^|\.)cortec-me\.com$/i.test(u.hostname)&&u.hostname!==location.hostname)out.push(new URL(R+u.pathname.replace(/^\//,''),location.href).href);
      else if(/(^|\.)cortecvci\.com$/i.test(u.hostname))out.push(new URL(R+'wp-content/ext/'+u.hostname+'/'+u.pathname.replace(/^\//,''),location.href).href);
    }catch(e){}
    out.push(url);return out;
  }
  function tryLoad(pdf,list){
    const u=list.shift();
    return pdf.getDocument({url:u,withCredentials:false}).promise.then(d=>{d._src=u;return d}).catch(err=>list.length?tryLoad(pdf,list):Promise.reject(err));
  }
  function renderAll(doc,tk){
    body.innerHTML='';if(io)io.disconnect();
    const w=Math.min(body.clientWidth-32,1000),dpr=Math.min(devicePixelRatio||1,2);
    io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting||en.target._done)return;en.target._done=1;const n=+en.target.dataset.p;
      doc.getPage(n).then(pg=>{if(tk!==token)return;const v0=pg.getViewport({scale:1}),sc=w/v0.width,v=pg.getViewport({scale:sc*dpr});const c=document.createElement('canvas');c.width=v.width;c.height=v.height;c.style.width=Math.round(v0.width*sc)+'px';c.style.height=Math.round(v0.height*sc)+'px';c.setAttribute('aria-label',T.page+' '+n);en.target.innerHTML='';en.target.appendChild(c);pg.render({canvasContext:c.getContext('2d'),viewport:v})})}),{root:body,rootMargin:'600px 0px'});
    doc.getPage(1).then(pg=>{if(tk!==token)return;const v0=pg.getViewport({scale:1}),h=Math.round(v0.height*(w/v0.width));
      for(let i=1;i<=doc.numPages;i++){const d=document.createElement('div');d.className='pdfv__pg';d.dataset.p=i;d.style.width=w+'px';d.style.minHeight=h+'px';body.appendChild(d);io.observe(d)}});
  }
  function open(a){
    if(!box)build();
    const url=a.href;token++;const tk=token;lastFocus=a;
    ttl.textContent=nameOf(a,url);cnt.textContent='';dlb.href=url;dlb.setAttribute('download','');
    body.innerHTML='<div class="pdfv__load"><i></i>'+T.load+'</div>';box._doc=null;
    box.hidden=false;requestAnimationFrame(()=>box.classList.add('on'));lockScroll(true);setTimeout(()=>$('.pdfv__x',box).focus(),50);
    if(window.dataLayer)dataLayer.push({event:'file_view',file_name:url.split('/').pop()});
    loadLib().then(pdf=>tryLoad(pdf,candidates(url))).then(doc=>{if(tk!==token)return;box._doc=doc;cnt.textContent=doc.numPages+' '+(lang==='ar'?'صفحات':(doc.numPages>1?'pages':'page'));renderAll(doc,tk)}).catch(()=>{if(tk===token)fallback(url)});
  }
  function close(){if(!box||box.hidden)return;token++;box.classList.remove('on');lockScroll(false);if(io)io.disconnect();setTimeout(()=>{box.hidden=true;body.innerHTML='';box._doc=null},250);if(lastFocus&&lastFocus.focus)lastFocus.focus()}
  document.addEventListener('click',e=>{
    if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const a=e.target.closest('a[href]');if(!a||!isPdf(a)||a.closest('.pdfv'))return;
    e.preventDefault();e.stopPropagation();open(a);
  },true);
})();

initialAnchor();
addEventListener('load',()=>{ScrollTrigger.refresh();if(location.hash)setTimeout(initialAnchor,100)});
})();
