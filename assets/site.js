(function(){
'use strict';
var CONFIG={
  whatsappPhone:'5521999426109',
  whatsappMessage:'Olá, Dra. Cláudia! Gostaria de uma orientação sobre meu caso trabalhista.'
};
var prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isFinePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function initWhatsappLinks(){
  var url='https://wa.me/'+CONFIG.whatsappPhone+'?text='+encodeURIComponent(CONFIG.whatsappMessage);
  document.querySelectorAll('.js-whatsapp').forEach(function(l){l.setAttribute('href',url);l.setAttribute('target','_blank');l.setAttribute('rel','noopener noreferrer');});
}

function initLoader(){
  var loader=document.getElementById('loader');
  if(!loader)return;
  function hide(){loader.classList.add('is-hidden');document.body.style.overflow='';}
  document.body.style.overflow='hidden';
  if(document.readyState==='complete'){setTimeout(hide,1000);}else{window.addEventListener('load',function(){setTimeout(hide,1000);});}
  setTimeout(hide,3500);
}

function initHeader(){
  var header  = document.getElementById('siteHeader');
  var toggle  = document.getElementById('navToggle');
  var nav     = document.getElementById('mainNav');
  var overlay = document.getElementById('navOverlay');
  var closeBtn= document.getElementById('navCloseBtn');
  if(!header) return;

  function onScroll(){ header.classList.toggle('is-scrolled', window.scrollY > 30); }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  function openNav(){
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
    if(overlay){ overlay.classList.add('is-active'); }
  }
  function closeNav(){
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
    if(overlay){ overlay.classList.remove('is-active'); }
  }

  if(toggle && nav){
    toggle.addEventListener('click', function(){
      nav.classList.contains('is-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function(l){
      l.addEventListener('click', closeNav);
    });
    if(closeBtn)  closeBtn.addEventListener('click', closeNav);
    if(overlay)   overlay.addEventListener('click',  closeNav);
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
    });
  }
}

function initReveal(){
  var items=document.querySelectorAll('[data-reveal]');
  if(!items.length)return;
  if(!('IntersectionObserver' in window)||prefersReducedMotion){items.forEach(function(el){el.classList.add('is-visible');});return;}
  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target);}});},{threshold:0.15,rootMargin:'0px 0px -60px 0px'});
  items.forEach(function(el){obs.observe(el);});
}

function initCounters(){
  var counters=document.querySelectorAll('[data-counter]');
  if(!counters.length)return;
  // O valor factual (ex.: 34) já está no HTML e NUNCA é alterado por JS.
  // A animação é apenas uma entrada suave (fade + leve movimento), sem contagem a partir de 0.
  function animate(el){
    if(prefersReducedMotion)return;
    el.style.transition='opacity .7s var(--ease-soft), transform .7s var(--ease-soft)';
    el.style.opacity='1';
    el.style.transform='translateY(0)';
  }
  if(!('IntersectionObserver' in window)){counters.forEach(animate);return;}
  if(!prefersReducedMotion){
    counters.forEach(function(el){
      el.style.opacity='0';
      el.style.transform='translateY(14px)';
    });
  }
  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){animate(e.target);obs.unobserve(e.target);}});},{threshold:0.6});
  counters.forEach(function(el){obs.observe(el);});
}

function initAreaCards(){
  document.querySelectorAll('.area-card').forEach(function(card){
    var tw=card.querySelector('.area-text');
    card.addEventListener('click',function(){
      var isOpen=card.getAttribute('aria-expanded')==='true';
      card.setAttribute('aria-expanded',String(!isOpen));
      if(tw)tw.style.maxHeight=isOpen?'0px':tw.scrollHeight+'px';
    });
  });
}

function initAccordion(){
  var triggers=document.querySelectorAll('.accordion-trigger');
  triggers.forEach(function(t){
    var panel=t.nextElementSibling;
    t.addEventListener('click',function(){
      var isOpen=t.getAttribute('aria-expanded')==='true';
      triggers.forEach(function(x){x.setAttribute('aria-expanded','false');var p=x.nextElementSibling;if(p)p.style.maxHeight='0px';});
      if(!isOpen){t.setAttribute('aria-expanded','true');if(panel)panel.style.maxHeight=panel.scrollHeight+'px';}
    });
  });
}

function initCarousel(){
  var track    = document.getElementById('carouselTrack');
  var dotsWrap = document.getElementById('carouselDots');
  var prevBtn  = document.getElementById('carouselPrev');
  var nextBtn  = document.getElementById('carouselNext');
  if(!track || !dotsWrap) return;

  var cards   = Array.prototype.slice.call(track.children);
  var total   = cards.length;          // 12
  var perPage = 3;                     // sempre 3 visíveis no desktop
  var pages   = Math.ceil(total / perPage); // 4 páginas
  var idx     = 0;                     // página atual (0‥3)
  var timer   = null, DELAY = 6000;

  /* ── CSS: 3 cards side-by-side ── */
  track.style.gap = '24px';
  cards.forEach(function(c){
    /* cada card ocupa (100% - 2 gaps) / 3 */
    c.style.flex    = '0 0 calc((100% - 48px) / 3)';
    c.style.maxWidth= 'calc((100% - 48px) / 3)';
  });

  /* ── 1 dot por PÁGINA ── */
  for(var p = 0; p < pages; p++){
    (function(page){
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Grupo ' + (page + 1));
      dot.addEventListener('click', function(){ goTo(page); restart(); });
      dotsWrap.appendChild(dot);
    })(p);
  }
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function updateDots(){
    dots.forEach(function(d, i){ d.classList.toggle('is-active', i === idx); });
  }

  function isMobile(){ return window.innerWidth <= 720; }

  function rebuildDots(count, labelPrefix){
    dotsWrap.innerHTML = '';
    for(var i=0;i<count;i++){
      (function(ii){
        var dot=document.createElement('button');
        dot.type='button';
        dot.setAttribute('aria-label', labelPrefix + (ii+1));
        dot.addEventListener('click',function(){ goTo(ii); restart(); });
        dotsWrap.appendChild(dot);
      })(i);
    }
    dots = Array.prototype.slice.call(dotsWrap.children);
  }

  function goTo(page){
    var transition = prefersReducedMotion ? 'none' : 'transform 0.5s cubic-bezier(.16,.84,.44,1)';

    if(isMobile()){
      /* ── MOBILE: 1 card por vez ── */
      var totalCards = cards.length;
      idx = ((page % totalCards) + totalCards) % totalCards;

      /* rebuild dots if needed */
      if(dotsWrap.children.length !== totalCards) rebuildDots(totalCards, 'Depoimento ');

      track.style.gap = '0px';
      var clipW = (track.parentElement || track).offsetWidth || window.innerWidth;
      cards.forEach(function(c){
        c.style.flex     = '0 0 ' + clipW + 'px';
        c.style.maxWidth = clipW + 'px';
        c.style.width    = clipW + 'px';
      });
      track.style.transition = transition;
      track.style.transform  = 'translateX(-' + (idx * clipW) + 'px)';

    } else {
      /* ── DESKTOP: 3 cards por página ── */
      idx = ((page % pages) + pages) % pages;

      /* rebuild dots if needed */
      if(dotsWrap.children.length !== pages) rebuildDots(pages, 'Grupo ');

      track.style.gap = '24px';
      /* let CSS handle card widths on desktop — just compute offset */
      cards.forEach(function(c){
        c.style.flex     = '0 0 calc((100% - 48px) / 3)';
        c.style.maxWidth = 'calc((100% - 48px) / 3)';
        c.style.width    = '';
      });
      /* wait one frame so browser calculates offsetWidth */
      var containerW = track.closest('.carousel') ? track.closest('.carousel').offsetWidth : (track.parentElement ? track.parentElement.offsetWidth : 0);
      if(!containerW) containerW = window.innerWidth;
      track.style.transition = transition;
      track.style.transform  = 'translateX(-' + (idx * (containerW + 24)) + 'px)';
    }

    dots = Array.prototype.slice.call(dotsWrap.children);
    dots.forEach(function(d,i){ d.classList.toggle('is-active', i===idx); });
    updateDots();
  }

  function next(){ goTo(idx + 1); }
  function prev(){ goTo(idx - 1); }
  window.addEventListener('resize', function(){ idx=0; goTo(0); });
  window.addEventListener('resize',function(){ idx=0; goTo(0); });

  if(nextBtn) nextBtn.addEventListener('click', function(){ next(); restart(); });
  if(prevBtn) prevBtn.addEventListener('click', function(){ prev(); restart(); });

  function start()  { if(!prefersReducedMotion) timer = setInterval(next, DELAY); }
  function stop()   { clearInterval(timer); }
  function restart(){ stop(); start(); }

  var cel = track.closest('.carousel');
  if(cel){
    cel.addEventListener('mouseenter', stop);
    cel.addEventListener('mouseleave', start);
    cel.addEventListener('touchstart',  stop, { passive: true });
  }

  window.addEventListener('resize', function(){ goTo(idx); });

  updateDots();
  start();
}

function initRipple(){
  document.querySelectorAll('.btn').forEach(function(btn){
    btn.addEventListener('click',function(e){
      var r=btn.getBoundingClientRect(),rp=document.createElement('span'),s=Math.max(r.width,r.height);
      rp.className='ripple';rp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';
      btn.appendChild(rp);setTimeout(function(){rp.remove();},650);
    });
  });
}

function initParallax(){
  if(prefersReducedMotion||!isFinePointer)return;
  var marks=document.querySelectorAll('.monogram-wm');
  if(!marks.length)return;
  window.addEventListener('mousemove',function(e){
    var x=(e.clientX/window.innerWidth-.5)*12,y=(e.clientY/window.innerHeight-.5)*12;
    marks.forEach(function(m){m.style.transform='translate(calc(-50% + '+x+'px), calc(-50% + '+y+'px))';});
  },{passive:true});
}

function initFooterYear(){var el=document.getElementById('footerYear');if(el)el.textContent=new Date().getFullYear();}

document.addEventListener('DOMContentLoaded',function(){
  initWhatsappLinks();initLoader();initHeader();initReveal();
  initCounters();initAreaCards();initAccordion();initCarousel();
  initRipple();initParallax();initFooterYear();
});
})();
