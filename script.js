  /* ── 1. NAVBAR ── */
  const navEl   = document.getElementById('nav');
  const nlLinks = document.querySelectorAll('.nl-a');
  const allSecs = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navEl.classList.toggle('sc', window.scrollY > 60);
    document.getElementById('btt').classList.toggle('on', window.scrollY > 400);
    let cur = '';
    allSecs.forEach(s => { if (window.scrollY >= s.offsetTop - 130) cur = s.id; });
    nlLinks.forEach(l => l.classList.toggle('on', l.getAttribute('href') === `#${cur}`));
  });

  /* ── 2. HAMBURGER ── */
  const hamEl = document.getElementById('ham');
  const mmEl  = document.getElementById('mm');
  hamEl.addEventListener('click', () => {
    const o = mmEl.classList.toggle('op');
    hamEl.classList.toggle('op', o);
    document.body.style.overflow = o ? 'hidden' : '';
  });
  document.querySelectorAll('.ml').forEach(l => l.addEventListener('click', () => {
    mmEl.classList.remove('op'); hamEl.classList.remove('op'); document.body.style.overflow = '';
  }));

  /* ── 3. SCROLL REVEAL ── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sibs = [...e.target.parentElement.querySelectorAll('.rv,.rl,.rr')];
      e.target.style.transitionDelay = `${sibs.indexOf(e.target) * 80}ms`;
      e.target.classList.add('on');
      observer.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.rv,.rl,.rr').forEach(el => observer.observe(el));

  /* ── 4. COUNTERS ── */
  function animCnt(el) {
    const t = +el.dataset.tg, d = 1800, s = performance.now();
    (function tick(n) {
      const p = Math.min((n-s)/d, 1), e = 1-Math.pow(1-p,3);
      el.textContent = Math.floor(e*t) + (p<1?'':'+');
      if(p<1) requestAnimationFrame(tick);
    })(s);
  }
  const cobs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ animCnt(e.target); cobs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-ct]').forEach(el => cobs.observe(el));

  /* ── 5. SERVICE GALLERY TOGGLE ──
     Shows/hides the gallery for each service card
  */
  function toggleGallery(el, service) {
    const card = el.closest('.service-card');
    const gallery = card.querySelector('.service-gallery');
    const isOpen = gallery.classList.contains('active');
    
    // Close all other galleries
    document.querySelectorAll('.service-gallery').forEach(g => g.classList.remove('active'));
    document.querySelectorAll('.service-learn').forEach(l => l.style.opacity = '1');
    
    // Toggle current gallery
    if (!isOpen) {
      gallery.classList.add('active');
      el.style.opacity = '0.5';
    }
  }

  /* ── 5b. SERVICE PANEL TOGGLE ──
     Panels live in the same CSS grid as the cards,
     so grid-column:1/-1 makes them span full width below all cards.
     Only one panel open at a time.
  */
  function togglePanel(id, btn) {
    const panel  = document.getElementById('panel-' + id);
    const isOpen = panel.classList.contains('on');
    // Close all
    document.querySelectorAll('.spanel').forEach(p => p.classList.remove('on'));
    document.querySelectorAll('.lbtn').forEach(b => b.classList.remove('op'));
    if (!isOpen) {
      panel.classList.add('on');
      btn.classList.add('op');
      // Smooth scroll to show panel
      setTimeout(() => panel.scrollIntoView({ behavior:'smooth', block:'nearest' }), 80);
    }
  }

  /* ── 6. LIGHTBOX ── */
  let lbStack = [], lbIdx = 0;

  /* Open lightbox from service gallery */
  function openLightbox(imgEl) {
    const gallery = imgEl.closest('.service-gallery');
    if (gallery) {
      const images = [...gallery.querySelectorAll('img')];
      lbStack = images.map(img => ({
        src: img.src,
        cap: img.alt || ''
      }));
      const clickSrc = imgEl.src;
      lbIdx = lbStack.findIndex(i => i.src === clickSrc);
      if (lbIdx < 0) lbIdx = 0;
    } else {
      lbStack = [{ src: imgEl.src, cap: imgEl.alt || '' }];
      lbIdx = 0;
    }
    showLb();
  }

  /* Used by service panel photos — builds stack from open panel */
  function openLbUrl(src, cap) {
    const openPanel = document.querySelector('.spanel.on');
    if (openPanel) {
      const phs = [...openPanel.querySelectorAll('.ph')];
      lbStack = phs.map(ph => ({
        src: ph.querySelector('img').src.replace('w=380','w=900'),
        cap: ph.querySelector('.phl') ? ph.querySelector('.phl').textContent : ''
      }));
      // find matching slide
      const match = lbStack.findIndex(i => i.src === src);
      lbIdx = match !== -1 ? match : 0;
    } else {
      lbStack = [{ src, cap }]; lbIdx = 0;
    }
    showLb();
  }

  /* Used by portfolio grid items */
  function openLbPf(imgEl) {
    const visible = [...document.querySelectorAll('.pi:not(.hid)')];
    lbStack = visible.map(item => ({
      src: item.querySelector('img').src.replace('w=500','w=900'),
      cap: item.querySelector('h4') ? item.querySelector('h4').textContent : ''
    }));
    const clickSrc = imgEl.src.replace('w=500','w=900');
    lbIdx = lbStack.findIndex(i => i.src === clickSrc);
    if (lbIdx < 0) lbIdx = 0;
    showLb();
  }

  function showLb() {
    document.getElementById('lbimg').src   = lbStack[lbIdx].src;
    document.getElementById('lbcap').textContent = lbStack[lbIdx].cap;
    document.getElementById('lb').classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function lbNav(d)   { lbIdx = (lbIdx+d+lbStack.length)%lbStack.length; showLb(); }
  function closeLb()  { document.getElementById('lb').classList.remove('on'); document.body.style.overflow=''; }
  function lbBg(e)    { if (e.target===document.getElementById('lb')) closeLb(); }

  // Portfolio items click
  document.querySelectorAll('.pi').forEach(item => {
    item.addEventListener('click', () => openLbPf(item.querySelector('img')));
  });
  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (!document.getElementById('lb').classList.contains('on')) return;
    if (e.key==='Escape')     closeLb();
    if (e.key==='ArrowLeft')  lbNav(-1);
    if (e.key==='ArrowRight') lbNav(1);
  });

  /* ── 7. PORTFOLIO FILTER ── */
  document.querySelectorAll('.fb').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fb').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      const f = btn.dataset.f;
      document.querySelectorAll('.pi').forEach(item => {
        const show = f==='all' || item.dataset.c===f;
        item.classList.toggle('hid', !show);
        if (show) { item.classList.remove('on'); setTimeout(()=>item.classList.add('on'),60); }
      });
    });
  });

  /* ── 8. TESTIMONIALS CAROUSEL ── */
  const ttr   = document.getElementById('ttr');
  const tcds  = [...ttr.querySelectorAll('.tcard')];
  const dotsEl= document.getElementById('tdots');
  let ti=0, tmr;
  function cpv(){ return window.innerWidth<700?1:window.innerWidth<900?2:3; }
  function slides(){ return Math.ceil(tcds.length/cpv()); }
  function buildDots(){
    dotsEl.innerHTML='';
    for(let i=0;i<slides();i++){
      const d=document.createElement('div'); d.className='cd'+(i===ti?' on':'');
      d.onclick=()=>{goTo(i);resetTmr();}; dotsEl.appendChild(d);
    }
  }
  function goTo(i){
    ti=((i%slides())+slides())%slides();
    const w=tcds[0].offsetWidth+24;
    ttr.style.transform=`translateX(-${ti*w*cpv()}px)`;
    document.querySelectorAll('.cd').forEach((d,j)=>d.classList.toggle('on',j===ti));
  }
  function resetTmr(){ clearInterval(tmr); tmr=setInterval(()=>goTo(ti+1),5000); }
  document.getElementById('tprev').onclick=()=>{ goTo(ti-1); resetTmr(); };
  document.getElementById('tnext').onclick=()=>{ goTo(ti+1); resetTmr(); };
  buildDots(); resetTmr();
  window.addEventListener('resize',()=>{ buildDots(); goTo(0); });

  /* ── 9. CONTACT FORM VALIDATION ── */
  const fields=[
    {i:document.getElementById('fn'), g:document.getElementById('fg-n'), t:v=>v.length>=2},
    {i:document.getElementById('fe'), g:document.getElementById('fg-e'), t:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)},
    {i:document.getElementById('fp'), g:document.getElementById('fg-p'), t:v=>v.length>=7},
    {i:document.getElementById('fm'), g:document.getElementById('fg-m'), t:v=>v.length>=10},
  ];
  fields.forEach(f=>{
    f.i.addEventListener('blur',()=>vf(f));
    f.i.addEventListener('input',()=>{ if(f.g.classList.contains('err')&&f.t(f.i.value.trim())){ f.g.classList.remove('err'); f.g.classList.add('ok'); } });
  });
  function vf(f){ const ok=f.t(f.i.value.trim()); f.g.classList.toggle('err',!ok); f.g.classList.toggle('ok',ok); return ok; }
  document.getElementById('cform').addEventListener('submit',e=>{
    e.preventDefault();
    const ok=fields.every(f=>vf(f)); if(!ok) return;
    const btn=e.target.querySelector('.fsub'); btn.textContent='Sending…'; btn.disabled=true;
    setTimeout(()=>{
      e.target.reset(); fields.forEach(f=>f.g.classList.remove('ok','err'));
      btn.textContent='Send Message ✦'; btn.disabled=false;
      const t=document.getElementById('toast'); t.classList.add('on'); setTimeout(()=>t.classList.remove('on'),4500);
    },1500);
  });

  /* ── 10. FOOTER YEAR ── */
  document.getElementById('yr').textContent=new Date().getFullYear();