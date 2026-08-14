// ---------- active nav link ----------
(function(){
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a=>{
    const target = a.getAttribute('href');
    if(target === here || (here === '' && target === 'index.html')){
      a.classList.add('active');
    }
  });
})();

// ---------- nav scroll state ----------
(function(){
  const nav = document.getElementById('site-nav');
  if(!nav) return;
  function onScroll(){
    if(window.scrollY > 40){ nav.classList.add('scrolled'); }
    else{ nav.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

// ---------- intro loader (home only) ----------
(function(){
  const loader = document.getElementById('intro-loader');
  if(!loader) return;
  document.body.classList.add('has-intro');
  setTimeout(()=>{
    document.body.classList.add('intro-done');
  }, 2500);
})();

// ---------- countdown (home) ----------
(function(){
  const elD = document.getElementById('d-days');
  if(!elD) return;
  const elH = document.getElementById('d-hours');
  const elM = document.getElementById('d-mins');
  const elS = document.getElementById('d-secs');
  const fill = document.getElementById('cw-fill');
  const pct = document.getElementById('cw-pct');

  function nextBirthday(){
    const now = new Date();
    let year = now.getFullYear();
    let target = new Date(year, 8, 4, 0, 0, 0);
    if(target < now){ target = new Date(year+1, 8, 4, 0, 0, 0); }
    return target;
  }
  const target = nextBirthday();

  function tick(){
    const diff = Math.max(0, target - new Date());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000)/3600000);
    const mins = Math.floor((diff % 3600000)/60000);
    const secs = Math.floor((diff % 60000)/1000);
    elD.textContent = String(days).padStart(2,'0');
    elH.textContent = String(hours).padStart(2,'0');
    elM.textContent = String(mins).padStart(2,'0');
    elS.textContent = String(secs).padStart(2,'0');

    if(fill && pct){
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(),0,1);
      const bdayDayIndex = 247; // approx Sept 4th day-of-year
      const dayOfYear = Math.floor((now - startOfYear)/86400000);
      let progress = (dayOfYear / bdayDayIndex) * 100;
      if(progress > 100) progress = 100;
      if(progress < 3) progress = 3;
      fill.style.width = progress.toFixed(1) + '%';
      pct.textContent = Math.round(progress) + '%';
    }
  }
  tick();
  setInterval(tick, 1000);
})();

// ---------- lightbox ----------
(function(){
  const lightbox = document.getElementById('lightbox');
  if(!lightbox) return;
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');

  document.querySelectorAll('[data-lightbox]').forEach(card=>{
    card.addEventListener('click', ()=>{
      const src = card.getAttribute('data-lightbox');
      lightboxImg.src = src;
      lightbox.classList.add('open');
    });
  });
  function close(){ lightbox.classList.remove('open'); lightboxImg.src=''; }
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) close(); });
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });
})();

// ---------- pause offscreen videos ----------
(function(){
  const videos = document.querySelectorAll('video');
  if(!videos.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{ if(!entry.isIntersecting){ entry.target.pause(); } });
  }, {threshold:0.2});
  videos.forEach(v=>io.observe(v));
})();

// ---------- hero "more info" scroll ----------
(function(){
  document.querySelectorAll('[data-scroll-to]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = document.querySelector(btn.getAttribute('data-scroll-to'));
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
})();
