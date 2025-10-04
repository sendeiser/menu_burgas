// Navegación por secciones con scroll suave
const buttons = document.querySelectorAll('.nav-btn');
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Intento de carga automática de imágenes desde /images usando nombre del producto
function toSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function tryLoadImage(mediaEl, baseName) {
  const candidates = [
    `images/${baseName}.webp`,
    `images/${baseName}.jpg`,
    `images/${baseName}.png`
  ];
  let index = 0;
  const testNext = () => {
    if (index >= candidates.length) return; // se queda con fallback
    const url = candidates[index++];
    const img = new Image();
    img.onload = () => {
      mediaEl.style.backgroundImage = `url('${url}')`;
      mediaEl.classList.add('has-image');
      mediaEl.style.backgroundSize = 'cover';
      mediaEl.style.backgroundPosition = 'center';
    };
    img.onerror = testNext;
    img.src = url;
  };
  testNext();
}

// Buscar el h3 más cercano para generar el slug
document.querySelectorAll('.card-media').forEach(media => {
  const titleEl = media.parentElement.querySelector('h3');
  const name = titleEl ? titleEl.textContent.trim() : (media.getAttribute('data-fallback') || 'producto');
  tryLoadImage(media, toSlug(name));
});

// Realce de sección actual al hacer scroll
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const id = entry.target.id;
    const btn = document.querySelector(`.nav-btn[data-target="${id}"]`);
    if (!btn) return;
    if (entry.isIntersecting) {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  });
}, { rootMargin: '-30% 0px -60% 0px', threshold: 0.1 });

document.querySelectorAll('.menu-section').forEach(s => sectionObserver.observe(s));

// Reveal de cards al entrar en viewport
const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('revealed');
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

document.querySelectorAll('.card').forEach(c => cardObserver.observe(c));
// Partículas retro: generar puntos animados si no hay reduce motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  const container = document.getElementById('particles');
  if (container) {
    const count = Math.min(40, Math.max(24, Math.floor(window.innerWidth / 40)));
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'pixel-dot' + (i % 3 === 0 ? ' alt' : '');
      dot.style.left = Math.random() * 100 + '%';
      dot.style.top = Math.random() * 100 + '%';
      dot.style.animationDelay = (Math.random() * 6).toFixed(2) + 's';
      container.appendChild(dot);
    }
  }
}

// Modal de producto (click en card)
const modal = document.getElementById('product-modal');
const modalMedia = modal?.querySelector('.modal-media');
const modalTitle = modal?.querySelector('.modal-title');
const modalDesc = modal?.querySelector('.modal-desc');
const modalPrice = modal?.querySelector('.modal-price');

function openModal({ title, desc, price, imageUrl }) {
  if (!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  if (modalTitle) modalTitle.textContent = title || '';
  if (modalDesc) modalDesc.textContent = desc || '';
  if (modalPrice) modalPrice.textContent = price || '';
  if (modalMedia) {
    modalMedia.style.backgroundImage = imageUrl ? `url('${imageUrl}')` : '';
    modalMedia.style.backgroundSize = 'cover';
    modalMedia.style.backgroundPosition = 'center';
  }
}
function closeModal() {
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    const title = card.querySelector('h3')?.textContent?.trim() || '';
    const desc = card.querySelector('p')?.textContent?.trim() || '';
    const price = card.querySelector('.price')?.textContent?.trim() || '';
    const media = card.querySelector('.card-media');
    const bg = media ? media.style.backgroundImage : '';
    const urlMatch = bg.match(/url\(['\"]?(.*?)['\"]?\)/);
    const imageUrl = urlMatch ? urlMatch[1] : '';
    openModal({ title, desc, price, imageUrl });
  });
});

modal?.querySelector('.modal-close')?.addEventListener('click', closeModal);
modal?.querySelector('.modal-backdrop')?.addEventListener('click', (e) => {
  if (e.target instanceof HTMLElement && e.target.dataset.close === 'true') closeModal();
});
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Búsqueda / filtro de productos
const searchInput = document.getElementById('search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent?.toLowerCase() || '';
      const match = title.includes(q) || desc.includes(q);
      card.style.display = match ? '' : 'none';
    });
  });
}

// Toggle de acento neon
const accentToggle = document.getElementById('accentToggle');
if (accentToggle) {
  accentToggle.addEventListener('change', () => {
    document.body.classList.toggle('accent-strong', accentToggle.checked);
  });
}
// Funcionalidad para el botón de volver arriba
document.addEventListener('DOMContentLoaded', function() {
  const btnVolverArriba = document.getElementById('btn-volver-arriba');
  
  // Mostrar/ocultar el botón según la posición de scroll
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      btnVolverArriba.classList.add('visible');
    } else {
      btnVolverArriba.classList.remove('visible');
    }
  });
  
  // Funcionalidad de desplazamiento suave al hacer clic
  btnVolverArriba.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
// Audio ambiental sutil con Web Audio API
(function(){
  const btn = document.getElementById('audioToggle');
  if(!btn) return;
  let audioCtx = null, gain = null, osc1 = null, osc2 = null, lfo = null, filter = null;
  let running = false;

  function initAmbient(){
    if(audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gain = audioCtx.createGain();
    gain.gain.value = 0.02; // volumen bajo
    filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    // Osciladores suaves
    osc1 = audioCtx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = 160;
    osc2 = audioCtx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = 220; osc2.detune.value = 6;

    // LFO para movimiento sutil del filtro
    lfo = audioCtx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.06; // lento
    const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 40; // modulación de frecuencia del filtro
    lfo.connect(lfoGain).connect(filter.frequency);

    osc1.connect(filter).connect(gain).connect(audioCtx.destination);
    osc2.connect(filter);
  }

  function startAmbient(){
    initAmbient();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    osc1.start(); osc2.start(); lfo.start();
    running = true;
    btn.setAttribute('aria-pressed','true');
  }
  function stopAmbient(){
    if(!audioCtx) return;
    try { gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4); } catch(e){}
    setTimeout(()=>{
      try { osc1.stop(); osc2.stop(); lfo.stop(); } catch(e){}
      running = false; btn.setAttribute('aria-pressed','false');
      gain.gain.value = 0.02; // reset
    }, 450);
  }

  btn.addEventListener('click', ()=>{
    if(!running) startAmbient(); else stopAmbient();
  });

  // Respeta reducción de movimiento
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(prefersReduce.matches){
    // Atenúa el LFO si inicia
    const attenuateLfo = ()=>{ if(lfo) { lfo.frequency.value = 0.02; } };
    prefersReduce.addEventListener?.('change', attenuateLfo);
  }
})();
