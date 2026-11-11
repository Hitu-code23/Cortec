/* Cortec Middle East — Client Portal (Supabase Auth + Postgres RLS + private Storage) */
(()=>{
'use strict';
const root=document.querySelector('[data-portal]');if(!root)return;
const CFG=window.CX_CFG||{};const AR=document.documentElement.lang==='ar';
const FN=CFG.sbUrl+'/functions/v1/admin-users';
const L=AR?{
  signin:'تسجيل الدخول',email:'البريد الإلكتروني',pw:'كلمة المرور',go:'دخول',wait:'يرجى الانتظار…',bad:'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  forgot:'نسيت كلمة المرور؟ تواصل مع فريق كورتك على',intro:'منطقة خاصة لعملاء كورتك® الشرق الأوسط: مستنداتك وطلباتك وعروض الأسعار في مكان واحد.',
  hi:'مرحباً',out:'تسجيل الخروج',docs:'مستنداتي',orders:'الطلبات وعروض الأسعار',shared:'موارد مشتركة',acct:'حسابي',
  nodocs:'لا توجد مستندات بعد.',noorders:'لا توجد طلبات أو عروض أسعار بعد.',open:'فتح',dl:'تنزيل',
  pending:'حسابك قيد المراجعة. سيقوم فريق كورتك بتفعيله قريباً.',ref:'المرجع',status:'الحالة',amount:'المبلغ',updated:'آخر تحديث',notes:'ملاحظات',
  name:'الاسم',company:'الشركة',save:'حفظ',saved:'تم الحفظ.',newpw:'كلمة مرور جديدة (8 أحرف على الأقل)',chpw:'تغيير كلمة المرور',pwdone:'تم تغيير كلمة المرور.',
  admin:'لوحة الإدارة',customers:'العملاء',err:'حدث خطأ',quote:'عرض سعر',order:'طلب',
  st:{pending:'قيد الانتظار',quoted:'تم إرسال العرض',confirmed:'مؤكد',in_production:'قيد التجهيز',shipped:'تم الشحن',delivered:'تم التسليم',cancelled:'ملغى'}
}:{
  signin:'Client sign in',email:'Email',pw:'Password',go:'Sign in',wait:'Please wait…',bad:'Wrong email or password.',
  forgot:'Forgot your password? Contact the Cortec team at',intro:'A private area for Cortec® Middle East customers: your documents, orders and quotations in one place.',
  hi:'Welcome',out:'Sign out',docs:'My documents',orders:'Orders & quotes',shared:'Shared resources',acct:'My account',
  nodocs:'No documents yet.',noorders:'No orders or quotes yet.',open:'Open',dl:'Download',
  pending:'Your account is waiting for approval. The Cortec team will activate it shortly.',ref:'Ref',status:'Status',amount:'Amount',updated:'Updated',notes:'Notes',
  name:'Name',company:'Company',save:'Save',saved:'Saved.',newpw:'New password (8+ characters)',chpw:'Change password',pwdone:'Password changed.',
  admin:'Admin',customers:'Customers',err:'Something went wrong',quote:'Quote',order:'Order',
  st:{pending:'Pending',quoted:'Quote sent',confirmed:'Confirmed',in_production:'In production',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled'}
};
const STS=Object.keys(L.st);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtD=d=>d?new Date(d).toLocaleDateString(AR?'ar-AE':'en-GB',{day:'numeric',month:'short',year:'numeric'}):'';
const fmtM=(a,c)=>a==null||a===''?'—':(c||'AED')+' '+Number(a).toLocaleString(AR?'ar-AE':'en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const $=(s,c=root)=>c.querySelector(s),$$=(s,c=root)=>[...c.querySelectorAll(s)];
const ext=p=>(p.split('.').pop()||'').toUpperCase().slice(0,4);

if(!CFG.sbUrl||!window.supabase){root.innerHTML='<p class="pt__msg">'+L.err+'.</p>';return}
const sb=window.supabase.createClient(CFG.sbUrl,CFG.sbKey,{auth:{persistSession:true,autoRefreshToken:true}});
let me=null,tab=null,users=[];

function toast(t,bad){let el=$('.pt__toast');if(!el){el=document.createElement('div');el.className='pt__toast';el.setAttribute('role','status');root.appendChild(el)}
  el.textContent=t;el.classList.toggle('bad',!!bad);el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),3200)}

/* ---------- login ---------- */
function loginView(msg){
  root.innerHTML=`<div class="pt__login"><form class="pt__card" novalidate>
    <h2>${L.signin}</h2><p class="pt__muted">${L.intro}</p>
    <label>${L.email}<input type="email" name="e" autocomplete="username" required dir="ltr"></label>
    <label>${L.pw}<input type="password" name="p" autocomplete="current-password" required dir="ltr"></label>
    <p class="pt__err" role="alert">${msg?esc(msg):''}</p>
    <button class="pt__btn" type="submit">${L.go}</button>
    <p class="pt__muted pt__small">${L.forgot} <a href="mailto:${esc(CFG.formFallbackEmail||'inquiries@cortec-me.com')}">${esc(CFG.formFallbackEmail||'inquiries@cortec-me.com')}</a></p>
  </form></div>`;
  const f=$('form');f.addEventListener('submit',async e=>{e.preventDefault();const b=$('button',f);b.disabled=true;b.textContent=L.wait;
    const {error}=await sb.auth.signInWithPassword({email:f.e.value.trim(),password:f.p.value});
    if(error){b.disabled=false;b.textContent=L.go;$('.pt__err',f).textContent=L.bad;return}
    boot()});
}

/* ---------- shell ---------- */
async function boot(){
  const {data:{session}}=await sb.auth.getSession();
  if(!session){loginView();return}
  const {data,error}=await sb.from('profiles').select('*').eq('id',session.user.id).single();
  if(error||!data){await sb.auth.signOut();loginView(L.err);return}
  me=data;
  const isA=me.role==='admin'&&me.approved;
  const tabs=isA?[['a-cust',L.customers],['a-docs',AR?'المستندات':'Documents'],['a-ord',L.orders],['acct',L.acct]]
                :[['docs',L.docs],['orders',L.orders],['shared',L.shared],['acct',L.acct]];
  tab=tab&&tabs.some(t=>t[0]===tab)?tab:tabs[0][0];
  root.innerHTML=`<div class="pt__bar"><div><small>${L.hi}${isA?' · '+L.admin:''}</small><b>${esc(me.full_name||me.email)}</b>${me.company?`<span>${esc(me.company)}</span>`:''}</div>
    <button class="pt__btn pt__btn--line" type="button" data-out>${L.out}</button></div>
    ${!me.approved?`<p class="pt__note">${L.pending}</p>`:''}
    <nav class="pt__tabs" role="tablist">${tabs.map(t=>`<button type="button" role="tab" data-tab="${t[0]}" aria-selected="${t[0]===tab}">${t[1]}</button>`).join('')}</nav>
    <div class="pt__pane" role="tabpanel"></div>`;
  $('[data-out]').onclick=async()=>{await sb.auth.signOut();me=null;tab=null;loginView()};
  $('.pt__tabs').onclick=e=>{const b=e.target.closest('[data-tab]');if(!b)return;tab=b.dataset.tab;$$('[data-tab]').forEach(x=>x.setAttribute('aria-selected',x===b));show()};
  show();
}
const pane=()=>$('.pt__pane');
function show(){({docs:()=>docsView(false),shared:()=>docsView(true),orders:ordersView,acct:acctView,'a-cust':aCust,'a-docs':aDocs,'a-ord':aOrd})[tab]()}

/* ---------- customer views ---------- */
async function docsView(shared){
  pane().innerHTML='<p class="pt__muted">'+L.wait+'</p>';
  let q=sb.from('documents').select('*').order('created_at',{ascending:false});
  q=shared?q.is('customer_id',null):q.eq('customer_id',me.id);
  const {data,error}=await q;if(error){pane().innerHTML='<p class="pt__err">'+L.err+'</p>';return}
  pane().innerHTML=data.length?'<div class="pt__docs">'+data.map(docCard).join('')+'</div>':'<p class="pt__empty">'+L.nodocs+'</p>';
}
function docCard(d,admin){
  const t=AR&&d.title_ar?d.title_ar:d.title;
  return `<div class="pt__doc"><span class="pt__ext">${esc(ext(d.file_path))}</span><div><b>${esc(t)}</b><small>${esc(d.category)} · ${fmtD(d.created_at)}${admin?' · '+esc(custName(d.customer_id)):''}</small></div>
    <div class="pt__acts"><button type="button" class="pt__btn pt__btn--sm" data-open="${esc(d.file_path)}" data-t="${esc(t)}">${/\.pdf$/i.test(d.file_path)?L.open:L.dl}</button>${admin?`<button type="button" class="pt__btn pt__btn--sm pt__btn--danger" data-deldoc="${d.id}" data-path="${esc(d.file_path)}">✕</button>`:''}</div></div>`;
}
root.addEventListener('click',async e=>{
  const b=e.target.closest('[data-open]');if(!b)return;
  const path=b.dataset.open,pdf=/\.pdf$/i.test(path);
  const {data,error}=await sb.storage.from('portal').createSignedUrl(path,300,pdf?undefined:{download:true});
  if(error){toast(L.err,true);return}
  const a=document.createElement('a');a.href=data.signedUrl;a.setAttribute('aria-label',b.dataset.t);a.hidden=true;root.appendChild(a);a.click();a.remove();
});
async function ordersView(){
  pane().innerHTML='<p class="pt__muted">'+L.wait+'</p>';
  const {data,error}=await sb.from('orders').select('*').eq('customer_id',me.id).order('updated_at',{ascending:false});
  if(error){pane().innerHTML='<p class="pt__err">'+L.err+'</p>';return}
  pane().innerHTML=data.length?'<div class="pt__orders">'+data.map(o=>orderCard(o,false)).join('')+'</div>':'<p class="pt__empty">'+L.noorders+'</p>';
}
function orderCard(o,admin){
  return `<div class="pt__ord"><div class="pt__ord-h"><span class="pt__kind">${o.kind==='quote'?L.quote:L.order}</span><b>${esc(o.title)}</b><span class="pt__st pt__st--${o.status}">${L.st[o.status]||o.status}</span></div>
    <dl><div><dt>${L.ref}</dt><dd dir="ltr">${esc(o.ref)}</dd></div><div><dt>${L.amount}</dt><dd dir="ltr">${fmtM(o.amount,o.currency)}</dd></div><div><dt>${L.updated}</dt><dd>${fmtD(o.updated_at)}</dd></div>${admin?`<div><dt>${L.customers}</dt><dd>${esc(custName(o.customer_id))}</dd></div>`:''}</dl>
    ${o.notes?`<p class="pt__muted">${esc(o.notes)}</p>`:''}${admin?`<div class="pt__acts"><button type="button" class="pt__btn pt__btn--sm pt__btn--line" data-editord="${o.id}">Edit</button><button type="button" class="pt__btn pt__btn--sm pt__btn--danger" data-delord="${o.id}">✕</button></div>`:''}</div>`;
}
function acctView(){
  pane().innerHTML=`<div class="pt__grid2"><form class="pt__card" data-f="prof"><h3>${L.acct}</h3>
    <label>${L.email}<input value="${esc(me.email)}" disabled dir="ltr"></label>
    <label>${L.name}<input name="n" value="${esc(me.full_name||'')}" maxlength="120"></label>
    <label>${L.company}<input name="c" value="${esc(me.company||'')}" maxlength="120"></label>
    <button class="pt__btn" type="submit">${L.save}</button></form>
    <form class="pt__card" data-f="pw"><h3>${L.chpw}</h3>
    <label>${L.newpw}<input type="password" name="p" minlength="8" autocomplete="new-password" required dir="ltr"></label>
    <button class="pt__btn" type="submit">${L.chpw}</button></form></div>`;
  $('[data-f=prof]').onsubmit=async e=>{e.preventDefault();const f=e.target;
    const {error}=await sb.from('profiles').update({full_name:f.n.value.trim()||null,company:f.c.value.trim()||null}).eq('id',me.id);
    if(error)toast(L.err,true);else{toast(L.saved);me.full_name=f.n.value.trim();me.company=f.c.value.trim();const b=$('.pt__bar b');if(b)b.textContent=me.full_name||me.email}};
  $('[data-f=pw]').onsubmit=async e=>{e.preventDefault();const f=e.target;if(f.p.value.length<8){toast(L.newpw,true);return}
    const {error}=await sb.auth.updateUser({password:f.p.value});if(error)toast(error.message,true);else{toast(L.pwdone);f.reset()}};
}

/* ---------- admin ---------- */
async function api(body){
  const {data:{session}}=await sb.auth.getSession();
  const r=await fetch(FN,{method:'POST',headers:{'Content-Type':'application/json',apikey:CFG.sbKey,Authorization:'Bearer '+session.access_token},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({error:L.err}));if(!r.ok||j.error)throw new Error(j.error||L.err);return j;
}
async function loadUsers(){const j=await api({action:'list'});users=j.users;return users}
const custName=id=>{if(!id)return AR?'مشترك (جميع العملاء)':'Shared (all customers)';const u=users.find(x=>x.id===id);return u?(u.company?u.company+' — ':'')+(u.full_name||u.email):'—'};
const custOpts=(sel,withShared)=>(withShared?`<option value="">${custName(null)}</option>`:'')+users.filter(u=>u.role==='customer').map(u=>`<option value="${u.id}"${u.id===sel?' selected':''}>${esc(custName(u.id))}</option>`).join('');

async function aCust(){
  pane().innerHTML='<p class="pt__muted">'+L.wait+'</p>';
  try{await loadUsers()}catch(e){pane().innerHTML='<p class="pt__err">'+esc(e.message)+'</p>';return}
  pane().innerHTML=`<form class="pt__card pt__add" data-f="newu"><h3>Add a customer login</h3>
    <div class="pt__row"><label>${L.name}<input name="n" required></label><label>${L.company}<input name="c"></label></div>
    <div class="pt__row"><label>${L.email}<input name="e" type="email" required dir="ltr"></label><label>Password (8+ characters)<input name="p" required minlength="8" dir="ltr" autocomplete="off"></label></div>
    <div class="pt__row"><label>Role<select name="r"><option value="customer">Customer</option><option value="admin">Cortec staff (admin)</option></select></label><span></span></div>
    <button class="pt__btn" type="submit">Create login</button><p class="pt__muted pt__small">Send the email and password to the customer yourself. They can change the password under “${L.acct}”.</p></form>
    <div class="pt__table"><table><thead><tr><th>${L.name}</th><th>${L.company}</th><th>${L.email}</th><th>Role</th><th>Access</th><th></th></tr></thead><tbody>
    ${users.map(u=>`<tr><td>${esc(u.full_name||'')}</td><td>${esc(u.company||'')}</td><td dir="ltr">${esc(u.email)}</td><td>${u.role==='admin'?'Admin':'Customer'}</td>
      <td>${u.approved?'<span class="pt__st pt__st--delivered">Active</span>':'<span class="pt__st pt__st--cancelled">Blocked</span>'}</td>
      <td class="pt__acts">${u.id===me.id?'<small class="pt__muted">You</small>':`<button type="button" class="pt__btn pt__btn--sm pt__btn--line" data-pw="${u.id}">New password</button>
      <button type="button" class="pt__btn pt__btn--sm pt__btn--line" data-ap="${u.id}" data-v="${u.approved?0:1}">${u.approved?'Block':'Activate'}</button>
      <button type="button" class="pt__btn pt__btn--sm pt__btn--danger" data-delu="${u.id}">Delete</button>`}</td></tr>`).join('')}
    </tbody></table></div>`;
  $('[data-f=newu]').onsubmit=async e=>{e.preventDefault();const f=e.target,b=$('button',f);b.disabled=true;
    try{await api({action:'create',full_name:f.n.value.trim(),company:f.c.value.trim(),email:f.e.value.trim(),password:f.p.value,role:f.r.value});toast('Login created for '+f.e.value.trim());aCust()}
    catch(x){toast(x.message,true);b.disabled=false}};
}
async function aDocs(){
  pane().innerHTML='<p class="pt__muted">'+L.wait+'</p>';
  try{await loadUsers()}catch(e){pane().innerHTML='<p class="pt__err">'+esc(e.message)+'</p>';return}
  const {data,error}=await sb.from('documents').select('*').order('created_at',{ascending:false});
  if(error){pane().innerHTML='<p class="pt__err">'+L.err+'</p>';return}
  pane().innerHTML=`<form class="pt__card pt__add" data-f="up"><h3>Upload a document</h3>
    <div class="pt__row"><label>Who can see it<select name="c">${custOpts('',true)}</select></label><label>Category<input name="k" value="General" list="ptcats"><datalist id="ptcats"><option>Quotation</option><option>Invoice</option><option>Technical data sheet</option><option>Safety data sheet</option><option>Certificate</option><option>Report</option><option>Brochure</option><option>General</option></datalist></label></div>
    <div class="pt__row"><label>Title<input name="t" required></label><label>Arabic title (optional)<input name="ta" dir="rtl"></label></div>
    <label>File (max 50 MB)<input name="f" type="file" required></label>
    <button class="pt__btn" type="submit">Upload</button></form>
    ${data.length?'<div class="pt__docs">'+data.map(d=>docCard(d,true)).join('')+'</div>':'<p class="pt__empty">'+L.nodocs+'</p>'}`;
  $('[data-f=up]').onsubmit=async e=>{e.preventDefault();const f=e.target,b=$('button[type=submit]',f),file=f.f.files[0];if(!file)return;
    if(file.size>50*1024*1024){toast('File is larger than 50 MB',true);return}
    b.disabled=true;b.textContent=L.wait;
    const safe=file.name.normalize('NFKD').replace(/[^\w.\-]+/g,'-').replace(/-+/g,'-').slice(-90)||'file';
    const path=(f.c.value||'shared')+'/'+Date.now()+'-'+safe;
    const up=await sb.storage.from('portal').upload(path,file,{contentType:file.type||undefined,upsert:false});
    if(up.error){toast(up.error.message,true);b.disabled=false;b.textContent='Upload';return}
    const {error}=await sb.from('documents').insert({title:f.t.value.trim(),title_ar:f.ta.value.trim()||null,category:f.k.value.trim()||'General',file_path:path,customer_id:f.c.value||null,created_by:me.id});
    if(error){await sb.storage.from('portal').remove([path]);toast(error.message,true);b.disabled=false;b.textContent='Upload';return}
    toast('Uploaded');aDocs()};
}
async function aOrd(){
  pane().innerHTML='<p class="pt__muted">'+L.wait+'</p>';
  try{await loadUsers()}catch(e){pane().innerHTML='<p class="pt__err">'+esc(e.message)+'</p>';return}
  const {data,error}=await sb.from('orders').select('*').order('updated_at',{ascending:false});
  if(error){pane().innerHTML='<p class="pt__err">'+L.err+'</p>';return}
  root._orders=data;
  pane().innerHTML=ordForm(null)+(data.length?'<div class="pt__orders">'+data.map(o=>orderCard(o,true)).join('')+'</div>':'<p class="pt__empty">'+L.noorders+'</p>');
  bindOrd();
}
function ordForm(o){
  o=o||{};
  return `<form class="pt__card pt__add" data-f="ord" data-id="${o.id||''}"><h3>${o.id?'Edit':'Add an'} order or quote</h3>
    <div class="pt__row"><label>Customer<select name="c" required>${custOpts(o.customer_id,false)}</select></label><label>Type<select name="k"><option value="quote"${o.kind==='quote'?' selected':''}>Quote</option><option value="order"${o.kind==='order'?' selected':''}>Order</option></select></label></div>
    <div class="pt__row"><label>${L.ref}<input name="r" required value="${esc(o.ref||'')}" dir="ltr"></label><label>Title<input name="t" required value="${esc(o.title||'')}"></label></div>
    <div class="pt__row"><label>${L.status}<select name="s">${STS.map(s=>`<option value="${s}"${o.status===s?' selected':''}>${L.st[s]}</option>`).join('')}</select></label>
      <label>${L.amount}<span class="pt__amt"><select name="cur">${['AED','USD','EUR','SAR'].map(c=>`<option${(o.currency||'AED')===c?' selected':''}>${c}</option>`).join('')}</select><input name="a" type="number" step="0.01" min="0" value="${o.amount==null?'':o.amount}" dir="ltr"></span></label></div>
    <label>${L.notes} (the customer can see this)<textarea name="n" rows="2">${esc(o.notes||'')}</textarea></label>
    <div class="pt__acts"><button class="pt__btn" type="submit">${o.id?L.save:'Add'}</button>${o.id?'<button class="pt__btn pt__btn--line" type="button" data-cancel>Cancel</button>':''}</div></form>`;
}
function bindOrd(){
  const f=$('[data-f=ord]');if(!f)return;
  if(!users.some(u=>u.role==='customer')){f.innerHTML='<h3>Add an order or quote</h3><p class="pt__muted">Create a customer login first (Customers tab).</p>';return}
  const c=$('[data-cancel]',f);if(c)c.onclick=()=>aOrd();
  f.onsubmit=async e=>{e.preventDefault();const b=$('button[type=submit]',f);b.disabled=true;
    const row={customer_id:f.c.value,kind:f.k.value,ref:f.r.value.trim(),title:f.t.value.trim(),status:f.s.value,currency:f.cur.value,amount:f.a.value===''?null:Number(f.a.value),notes:f.n.value.trim()||null};
    const id=f.dataset.id;const {error}=id?await sb.from('orders').update(row).eq('id',id):await sb.from('orders').insert(row);
    if(error){toast(error.message,true);b.disabled=false;return}toast(L.saved);aOrd()};
}
root.addEventListener('click',async e=>{
  const t=e.target.closest('button');if(!t||!me||me.role!=='admin')return;
  const d=t.dataset;
  try{
    if(d.pw){const p=prompt('New password for '+custName(d.pw)+' (8+ characters):');if(!p)return;await api({action:'set_password',id:d.pw,password:p});toast('Password changed — send it to the customer.')}
    else if(d.ap){await api({action:'update',id:d.ap,approved:d.v==='1'});aCust()}
    else if(d.delu){if(!confirm('Delete '+custName(d.delu)+'? Their login, documents and orders will be removed. This cannot be undone.'))return;
      const {data:docs}=await sb.from('documents').select('file_path').eq('customer_id',d.delu);
      if(docs&&docs.length)await sb.storage.from('portal').remove(docs.map(x=>x.file_path));
      await api({action:'delete',id:d.delu});toast('Deleted');aCust()}
    else if(d.deldoc){if(!confirm('Delete this document? This cannot be undone.'))return;
      await sb.storage.from('portal').remove([d.path]);const {error}=await sb.from('documents').delete().eq('id',d.deldoc);if(error)throw error;toast('Deleted');aDocs()}
    else if(d.delord){if(!confirm('Delete this order/quote?'))return;const {error}=await sb.from('orders').delete().eq('id',d.delord);if(error)throw error;toast('Deleted');aOrd()}
    else if(d.editord){const o=(root._orders||[]).find(x=>x.id===d.editord);const f=$('[data-f=ord]');f.outerHTML=ordForm(o);bindOrd();$('[data-f=ord]').scrollIntoView({behavior:'smooth',block:'center'})}
  }catch(x){toast(x.message||L.err,true)}
});

sb.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_OUT'&&me){me=null;loginView()}});
boot();
})();
