
// ---------- Preloader ----------
window.addEventListener('load',()=>{
  setTimeout(()=>{document.getElementById('preloader').classList.add('done');},1300);
});

// ---------- Build scrubber clips ----------
const sections = [
  {id:'hero',label:'INTRO',tc:'00:00:00'},
  {id:'about',label:'ABOUT',tc:'00:00:18'},
  {id:'work',label:'WORK',tc:'00:00:34'},
  {id:'services',label:'SERVICES',tc:'00:00:52'},
  {id:'why',label:'WHY',tc:'00:01:08'},
  {id:'process',label:'PROCESS',tc:'00:01:24'},
  {id:'reviews',label:'REVIEWS',tc:'00:01:40'},
  {id:'contact',label:'CONTACT',tc:'00:01:58'},
];
const track = document.getElementById('scrubTrack');
sections.forEach(s=>{
  const clip = document.createElement('div');
  clip.className='scrub-clip';
  clip.dataset.target = s.id;
  clip.innerHTML = `<span>${s.label}</span>`;
  clip.addEventListener('click',()=>{document.getElementById(s.id).scrollIntoView({behavior:'smooth'});});
  track.appendChild(clip);
});
const playhead = document.getElementById('playhead');
track.appendChild(playhead);
const clips = [...document.querySelectorAll('.scrub-clip')];
const secEls = sections.map(s=>document.getElementById(s.id));

function updateScrubber(){
  const doc = document.documentElement;
  const scrollTop = window.scrollY;
  const max = doc.scrollHeight - window.innerHeight;
  const pct = Math.min(Math.max(scrollTop/max,0),1);
  playhead.style.left = (pct*100)+'%';

  let activeIdx = 0;
  secEls.forEach((el,i)=>{
    if(el && el.getBoundingClientRect().top <= window.innerHeight*0.4) activeIdx = i;
  });
  clips.forEach((c,i)=>c.classList.toggle('active', i===activeIdx));
}
window.addEventListener('scroll', updateScrubber, {passive:true});
updateScrubber();

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:0.15});
revealEls.forEach(el=>io.observe(el));

// ---------- Animated counters ----------
const counters = document.querySelectorAll('.stat .num[data-count]');
const cio = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const el = e.target;
      const target = parseInt(el.dataset.count,10);
      const suffix = el.dataset.suffix||'';
      let cur = 0;
      const dur = 1200, start = performance.now();
      function tick(now){
        const p = Math.min((now-start)/dur,1);
        cur = Math.floor(p*target);
        el.textContent = cur+suffix;
        if(p<1) requestAnimationFrame(tick); else el.textContent = target+suffix;
      }
      requestAnimationFrame(tick);
      cio.unobserve(el);
    }
  });
},{threshold:0.5});
counters.forEach(el=>cio.observe(el));
document.querySelectorAll('.stat .num[data-text]').forEach(el=>{el.textContent = el.dataset.text;});

// ---------- Testimonial slider ----------
const testCards = document.querySelectorAll('.test-card');
const testDots = document.querySelectorAll('.test-dots button');
let testIdx = 0;
function showTest(i){
  testCards.forEach((c,idx)=>c.classList.toggle('active', idx===i));
  testDots.forEach((d,idx)=>d.classList.toggle('active', idx===i));
  testIdx = i;
}
testDots.forEach(d=>d.addEventListener('click',()=>showTest(parseInt(d.dataset.i,10))));
setInterval(()=>{ showTest((testIdx+1)%testCards.length); }, 5000);

// ---------- Contact form ----------
document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  const msg = document.getElementById('formMsg');
  msg.textContent = 'Thanks — message ready. Opening your email app to send it...';
  const inputs = this.querySelectorAll('input, select, textarea');
  const [name,email] = inputs;
  const service = this.querySelector('select').value;
  const details = this.querySelector('textarea').value;
  const subject = encodeURIComponent('New Project Inquiry — '+service);
  const body = encodeURIComponent(`Name: ${name.value}\nEmail: ${email.value}\nService: ${service}\n\nProject Details:\n${details}`);
  setTimeout(()=>{ window.location.href = `mailto:jjhte8298@gmail.com?subject=${subject}&body=${body}`; }, 600);
});

// ---------- Back to top ----------
const totop = document.getElementById('totop');
window.addEventListener('scroll',()=>{ totop.classList.toggle('show', window.scrollY>600); },{passive:true});
totop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

// ================= ADMIN PANEL =================
// Change this password to whatever you like.
const ADMIN_PASSWORD = 'hrs2026';

const adminLockBtn = document.getElementById('adminLockBtn');
const adminLoginOverlay = document.getElementById('adminLoginOverlay');
const adminPassInput = document.getElementById('adminPassInput');
const adminErr = document.getElementById('adminErr');

adminLockBtn.addEventListener('click', ()=>{
  adminLoginOverlay.classList.add('show');
  adminPassInput.value=''; adminErr.textContent='';
  setTimeout(()=>adminPassInput.focus(),50);
});
document.getElementById('adminCancelBtn').addEventListener('click', ()=>adminLoginOverlay.classList.remove('show'));
adminLoginOverlay.addEventListener('click', (e)=>{ if(e.target===adminLoginOverlay) adminLoginOverlay.classList.remove('show'); });

function adminTryUnlock(){
  if(adminPassInput.value === ADMIN_PASSWORD){
    adminLoginOverlay.classList.remove('show');
    adminEnterEditMode();
  } else {
    adminErr.textContent = 'Incorrect password — try again.';
  }
}
document.getElementById('adminUnlockBtn').addEventListener('click', adminTryUnlock);
adminPassInput.addEventListener('keydown', e=>{ if(e.key==='Enter') adminTryUnlock(); });

// Stop clicks on links from navigating away while editing their text
document.addEventListener('click', function(e){
  if(!document.body.classList.contains('admin-edit-mode')) return;
  if(e.target.closest('.img-upload-overlay, .wc-upload-btn, .wc-link-btn, .wc-delete-btn, .wc-add-card, .f-edit-pencil')) return;
  const link = e.target.closest('a');
  if(link && e.target.closest('[contenteditable="true"]')) e.preventDefault();
}, true);

// Text elements that become editable
const ADMIN_TEXT_SELECTORS = [
  '.hero-tag-label','.hero-h','.hero-sub-h','.hero-desc','.stat .lbl',
  '.eyebrow','.section-title','.about-text p','.about-text .punch','.about-badge b','.about-badge-text',
  '.wc-tag','.wc-title',
  '.svc-card h3','.svc-card p',
  '.why-card h4','.why-card p',
  '.proc-card h4','.proc-card p','.proc-tc',
  '.test-quote','.test-name','.test-role',
  '.cc-label','.cc-value',
  '.foot-brand','.foot-quotes span','.foot-bottom span',
  '.scrub-brand-label',
  '.hero-btns .btn','#scrubber .btn','#contactForm button[type="submit"]',
  '.foot-links a','.f-group label'
];

// Image containers that get a "Change Photo" overlay (header photo, about photo)
const ADMIN_IMG_TARGETS = [
  {sel:'.frame-inner', type:'img'},
  {sel:'.about-img', type:'img'}
];

let adminFileInput = null;
function adminGetFileInput(){
  if(!adminFileInput){
    adminFileInput = document.createElement('input');
    adminFileInput.type='file'; adminFileInput.style.display='none';
    document.body.appendChild(adminFileInput);
  }
  return adminFileInput;
}

// ---- Video lightbox (works for every visitor, not just admin) ----
const adminLightbox = document.getElementById('adminLightbox');
const adminLightboxVideo = document.getElementById('adminLightboxVideo');
const adminLightboxFrame = document.getElementById('adminLightboxFrame');
document.getElementById('adminLightboxClose').addEventListener('click', adminCloseLightbox);
adminLightbox.addEventListener('click', (e)=>{ if(e.target===adminLightbox) adminCloseLightbox(); });
function adminOpenLightbox(src){
  adminLightboxFrame.style.display='none';
  adminLightboxFrame.src='';
  adminLightboxVideo.style.display='block';
  adminLightboxVideo.src = src;
  adminLightbox.classList.add('show');
  adminLightboxVideo.play().catch(()=>{});
}
function adminOpenLightboxEmbed(embedUrl){
  adminLightboxVideo.pause();
  adminLightboxVideo.removeAttribute('src');
  adminLightboxVideo.style.display='none';
  adminLightboxFrame.style.display='block';
  adminLightboxFrame.src = embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
  adminLightbox.classList.add('show');
}
function adminCloseLightbox(){
  adminLightbox.classList.remove('show');
  adminLightboxVideo.pause();
  adminLightboxVideo.removeAttribute('src');
  adminLightboxVideo.load();
  adminLightboxFrame.src='';
  adminLightboxFrame.style.display='none';
}

// ---- Portfolio card behaviour (play on click, preview on hover) — always on ----
function adminBindCardPlay(card){
  const playBtn = card.querySelector('.wc-play');
  if(!playBtn || playBtn.dataset.bound) return;
  playBtn.dataset.bound='1';
  playBtn.addEventListener('click', (e)=>{
    e.preventDefault(); e.stopPropagation();
    const vid = card.querySelector('.wc-bg video');
    const ytId = card.dataset.ytId;
    const extLink = card.dataset.extLink;
    if(ytId){ adminOpenLightboxEmbed('https://www.youtube.com/embed/'+ytId); }
    else if(vid){ adminOpenLightbox(vid.src); }
    else if(extLink){ window.open(extLink, '_blank'); }
    else if(document.body.classList.contains('admin-edit-mode')){
      alert('No video uploaded for this project yet. Click "Upload" or "Link" to add one.');
    }
  });
}
function adminBindCardHover(card){
  if(card.dataset.hoverBound) return;
  card.dataset.hoverBound='1';
  card.addEventListener('mouseenter', ()=>{ const v=card.querySelector('.wc-bg video'); if(v) v.play().catch(()=>{}); });
  card.addEventListener('mouseleave', ()=>{ const v=card.querySelector('.wc-bg video'); if(v){ v.pause(); v.currentTime=0; } });
}
document.querySelectorAll('.work-card').forEach(c=>{ adminBindCardPlay(c); adminBindCardHover(c); });

// ---- Portfolio editing: upload photo/video, delete project ----
function adminWireWorkCardEditing(card){
  const bg = card.querySelector('.wc-bg');

  function handleMediaUpload(){
    const input = adminGetFileInput();
    input.accept = 'image/*,video/*';
    input.onchange = ()=>{
      const file = input.files[0];
      if(!file) return;
      if(file.type.startsWith('video/') && file.size > 25*1024*1024){
        const mb = (file.size/1024/1024).toFixed(1);
        if(!confirm('This video is '+mb+'MB. Embedding large videos directly in the page makes it slow to load and download. Continue anyway?\n\n(Tip: for full-length videos, consider hosting on YouTube/Instagram and linking instead.)')){ input.value=''; return; }
      }
      const reader = new FileReader();
      reader.onload = ()=>{
        const dataUrl = reader.result;
        delete card.dataset.ytId;
        delete card.dataset.extLink;
        bg.querySelectorAll('video,img').forEach(n=>n.remove());
        const span = bg.querySelector('span');
        if(file.type.startsWith('video/')){
          const v = document.createElement('video');
          v.setAttribute('src', dataUrl);
          v.setAttribute('muted',''); v.setAttribute('loop',''); v.setAttribute('playsinline','');
          v.setAttribute('preload','metadata');
          v.muted = true;
          v.style.cssText='width:100%;height:100%;object-fit:cover;position:absolute;inset:0;';
          bg.insertBefore(v, bg.firstChild);
          v.addEventListener('loadedmetadata', ()=>{
            if(v.videoWidth===0 || v.videoHeight===0){
              alert('This video uploaded but your browser could not decode its picture (only audio plays). This usually happens with iPhone .MOV/HEVC videos.\n\nFix: on iPhone go to Settings > Camera > Formats > "Most Compatible", then re-record or re-export the video as MP4 (H.264), and upload that file instead.');
            }
          });
          v.addEventListener('error', ()=>{
            alert('This video file could not be loaded. Please try an MP4 (H.264) video instead.');
          });
        } else {
          bg.style.backgroundImage = "url('"+dataUrl+"')";
          bg.style.backgroundSize='cover';
          bg.style.backgroundPosition='center';
        }
        if(span) span.style.display='none';
      };
      reader.readAsDataURL(file);
      input.value='';
    };
    input.click();
  }

  if(!card.querySelector(':scope > .wc-upload-btn')){
    const up = document.createElement('button');
    up.type='button'; up.className='wc-upload-btn'; up.title='Upload photo or video';
    up.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg><span>Upload</span>';
    up.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      handleMediaUpload();
    });
    card.appendChild(up);
  }

  if(!card.querySelector(':scope > .wc-link-btn')){
    const lk = document.createElement('button');
    lk.type='button'; lk.className='wc-link-btn'; lk.title='Add YouTube / Instagram link';
    lk.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 007.07 0l2-2a5 5 0 00-7.07-7.07l-1 1M14 11a5 5 0 00-7.07 0l-2 2a5 5 0 007.07 7.07l1-1"/></svg><span>Link</span>';
    lk.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      const url = prompt('Paste a YouTube or Instagram video link:');
      if(!url) return;
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{6,})/);
      bg.querySelectorAll('video,img').forEach(n=>n.remove());
      const span = bg.querySelector('span');
      if(ytMatch){
        const id = ytMatch[1];
        card.dataset.ytId = id;
        delete card.dataset.extLink;
        bg.style.backgroundImage = "url('https://img.youtube.com/vi/"+id+"/hqdefault.jpg')";
        bg.style.backgroundSize='cover';
        bg.style.backgroundPosition='center';
      } else {
        delete card.dataset.ytId;
        card.dataset.extLink = url;
        bg.style.backgroundImage = '';
        if(span){ span.style.display='block'; span.innerHTML = 'EXTERNAL LINK<br>ADDED'; }
      }
      if(span && ytMatch) span.style.display='none';
    });
    card.appendChild(lk);
  }

  if(!card.querySelector(':scope > .wc-delete-btn')){
    const del = document.createElement('button');
    del.type='button'; del.className='wc-delete-btn'; del.title='Delete this project';
    del.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 0v12a2 2 0 002 2h6a2 2 0 002-2V7"/></svg>';
    del.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      if(confirm('Delete this portfolio project? This cannot be undone.')) card.remove();
    });
    card.appendChild(del);
  }
}

function adminEnsureAddCard(){
  const grid = document.getElementById('workGrid');
  if(!grid || grid.querySelector('.wc-add-card')) return;
  const add = document.createElement('div');
  add.className='work-card wc-add-card';
  add.innerHTML='<div class="wc-add-inner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 5v14M5 12h14"/></svg><span>Add Project</span></div>';
  add.addEventListener('click', adminAddNewCard);
  grid.appendChild(add);
}
function adminAddNewCard(){
  const grid = document.getElementById('workGrid');
  const addCard = grid.querySelector('.wc-add-card');
  const card = document.createElement('div');
  card.className='work-card reveal in';
  card.innerHTML = '<div class="wc-bg"><span>ADD<br>PHOTO OR VIDEO</span></div>'
    + '<div class="wc-tag" contenteditable="true">New Category</div>'
    + '<div class="wc-play"><svg viewBox="0 0 24 24"><path d="M5 3l16 9-16 9V3z"/></svg></div>'
    + '<div class="wc-title" contenteditable="true">New Project Title</div>';
  grid.insertBefore(card, addCard);
  adminWireWorkCardEditing(card);
  adminBindCardPlay(card);
  adminBindCardHover(card);
}

// ---- Form field editing: placeholders & dropdown options ----
function adminWireFieldPencils(){
  document.querySelectorAll('.f-group').forEach(group=>{
    if(group.querySelector(':scope > .f-edit-pencil')) return;
    const select = group.querySelector('select');
    const input = group.querySelector('input, textarea');
    const pencil = document.createElement('button');
    pencil.type='button'; pencil.className='f-edit-pencil'; pencil.title='Edit field';
    pencil.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
    pencil.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      if(select){
        const opts = Array.from(select.querySelectorAll('option')).filter(o=>o.value).map(o=>o.textContent);
        const newVal = prompt('Edit dropdown options (comma separated):', opts.join(', '));
        if(newVal===null) return;
        const list = newVal.split(',').map(s=>s.trim()).filter(Boolean);
        select.innerHTML='';
        const first = document.createElement('option');
        first.value=''; first.disabled=true; first.selected=true; first.textContent='Select a service';
        select.appendChild(first);
        list.forEach(t=>{ const o=document.createElement('option'); o.textContent=t; select.appendChild(o); });
      } else if(input){
        const newVal = prompt('Edit placeholder text:', input.placeholder||'');
        if(newVal===null) return;
        input.placeholder = newVal;
      }
    });
    group.appendChild(pencil);
  });
}

// ---- Site settings: browser tab title + meta description ----
const adminSettingsOverlay = document.getElementById('adminSettingsOverlay');
const adminTitleInput = document.getElementById('adminTitleInput');
const adminDescInput = document.getElementById('adminDescInput');
document.getElementById('adminSettingsCancelBtn').addEventListener('click', ()=>adminSettingsOverlay.classList.remove('show'));
adminSettingsOverlay.addEventListener('click', (e)=>{ if(e.target===adminSettingsOverlay) adminSettingsOverlay.classList.remove('show'); });
document.getElementById('adminSettingsSaveBtn').addEventListener('click', ()=>{
  if(adminTitleInput.value.trim()) document.title = adminTitleInput.value.trim();
  let metaDesc = document.querySelector('meta[name="description"]');
  if(!metaDesc){ metaDesc=document.createElement('meta'); metaDesc.setAttribute('name','description'); document.head.appendChild(metaDesc); }
  metaDesc.setAttribute('content', adminDescInput.value);
  adminSettingsOverlay.classList.remove('show');
});
function adminOpenSettings(){
  adminTitleInput.value = document.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  adminDescInput.value = metaDesc ? metaDesc.getAttribute('content') : '';
  adminSettingsOverlay.classList.add('show');
}

function adminEnterEditMode(){
  document.body.classList.add('admin-edit-mode');
  adminLockBtn.classList.add('is-open');

  ADMIN_TEXT_SELECTORS.forEach(sel=>{
    document.querySelectorAll(sel).forEach(el=>el.setAttribute('contenteditable','true'));
  });

  ADMIN_IMG_TARGETS.forEach(t=>{
    document.querySelectorAll(t.sel).forEach(container=>{
      if(container.querySelector(':scope > .img-upload-overlay')) return;
      const overlay = document.createElement('div');
      overlay.className='img-upload-overlay';
      overlay.innerHTML='<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/></svg>Change Photo</span>';
      container.appendChild(overlay);
      overlay.addEventListener('click', (e)=>{
        e.preventDefault(); e.stopPropagation();
        const input = adminGetFileInput();
        input.accept = 'image/*';
        input.onchange = ()=>{
          const file = input.files[0];
          if(!file) return;
          const reader = new FileReader();
          reader.onload = ()=>{
            const img = container.querySelector('img');
            if(img) img.src = reader.result;
          };
          reader.readAsDataURL(file);
          input.value='';
        };
        input.click();
      });
    });
  });

  document.querySelectorAll('.work-card').forEach(c=>{
    if(!c.classList.contains('wc-add-card')) adminWireWorkCardEditing(c);
  });
  adminEnsureAddCard();
  adminWireFieldPencils();

  adminShowToolbar();
}

function adminExitEditMode(skipConfirm){
  if(!skipConfirm && !confirm('Exit edit mode? Any changes not yet downloaded will be lost.')) return;
  document.body.classList.remove('admin-edit-mode');
  adminLockBtn.classList.remove('is-open');
  document.querySelectorAll('[contenteditable="true"]').forEach(el=>el.removeAttribute('contenteditable'));
  document.querySelectorAll('.img-upload-overlay, .wc-upload-btn, .wc-link-btn, .wc-delete-btn, .f-edit-pencil').forEach(el=>el.remove());
  const addCard = document.querySelector('.wc-add-card');
  if(addCard) addCard.remove();
  const tb = document.getElementById('adminToolbar');
  if(tb) tb.remove();
}

function adminShowToolbar(){
  if(document.getElementById('adminToolbar')) return;
  const tb = document.createElement('div');
  tb.id='adminToolbar';
  tb.innerHTML = '<span class="am-label">Edit Mode</span>'
    + '<button class="btn btn-ghost" id="adminSettingsBtn" type="button" title="Site settings">⚙</button>'
    + '<button class="btn btn-primary" id="adminSaveBtn" type="button">Save &amp; Download</button>'
    + '<button class="btn btn-ghost" id="adminExitBtn" type="button">Exit</button>';
  document.body.appendChild(tb);
  document.getElementById('adminSettingsBtn').addEventListener('click', adminOpenSettings);
  document.getElementById('adminSaveBtn').addEventListener('click', adminExportSite);
  document.getElementById('adminExitBtn').addEventListener('click', ()=>adminExitEditMode(false));
}

function adminExportSite(){
  const clone = document.documentElement.cloneNode(true);
  clone.classList.remove('admin-edit-mode');

  // remove transient/edit-only UI from the export
  clone.querySelectorAll('#adminToolbar, .img-upload-overlay, .wc-upload-btn, .wc-link-btn, .wc-delete-btn, .wc-add-card, .f-edit-pencil, input[type="file"]').forEach(n=>n.remove());
  clone.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable'));
  const lockClone = clone.querySelector('#adminLockBtn');
  if(lockClone) lockClone.classList.remove('is-open');
  ['#adminLoginOverlay','#adminSettingsOverlay','#adminLightbox'].forEach(sel=>{
    const n = clone.querySelector(sel);
    if(n) n.classList.remove('show');
  });
  const passClone = clone.querySelector('#adminPassInput');
  if(passClone) passClone.removeAttribute('value');
  const errClone = clone.querySelector('#adminErr');
  if(errClone) errClone.textContent='';
  const lbVideoClone = clone.querySelector('#adminLightboxVideo');
  if(lbVideoClone) lbVideoClone.removeAttribute('src');

  // remove internal "already bound" markers so the saved file's own script
  // re-attaches click/hover listeners cleanly on next load (otherwise the
  // play button silently does nothing because it thinks it's already wired)
  clone.querySelectorAll('[data-bound]').forEach(el=>el.removeAttribute('data-bound'));
  clone.querySelectorAll('[data-hover-bound]').forEach(el=>el.removeAttribute('data-hover-bound'));

  // reset things the page's own scripts build dynamically, so they rebuild
  // cleanly (without duplicating) the next time this file is opened
  const preloaderClone = clone.querySelector('#preloader');
  if(preloaderClone) preloaderClone.classList.remove('done');
  const trackClone = clone.querySelector('#scrubTrack');
  if(trackClone) trackClone.innerHTML = '<div id="playhead"></div>';
  clone.querySelectorAll('.reveal.in').forEach(el=>el.classList.remove('in'));
  clone.querySelectorAll('.stat .num[data-count]').forEach(el=>{ el.textContent='0'; });
  clone.querySelectorAll('.test-card').forEach((el,i)=>el.classList.toggle('active', i===0));
  clone.querySelectorAll('.test-dots button').forEach((el,i)=>el.classList.toggle('active', i===0));

  const html = '<!DOCTYPE html>\n' + clone.outerHTML;
  const blob = new Blob([html], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'index.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 2000);

  const tb = document.getElementById('adminToolbar');
  if(tb){
    const lbl = tb.querySelector('.am-label');
    if(lbl){ lbl.textContent='Saved ✓'; setTimeout(()=>{lbl.textContent='Edit Mode';},1800); }
  }
}


// ---- Background stars init ----

(function(){
  const wrap = document.getElementById('bgStars');
  if(!wrap) return;
  const count = window.innerWidth < 700 ? 30 : 60;
  for(let i=0;i<count;i++){
    const s = document.createElement('span');
    s.style.top = Math.random()*100+'%';
    s.style.left = Math.random()*100+'%';
    s.style.animationDelay = (Math.random()*4)+'s';
    s.style.animationDuration = (3+Math.random()*3)+'s';
    wrap.appendChild(s);
  }
})();
