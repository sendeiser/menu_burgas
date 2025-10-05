// Sistema de audio
const audioSystem = {
  backgroundMusic: null,
  clickSound: null,
  isMuted: false,
  audioButton: null,
  audioLoaded: false,

  init() {
    // Crear botón de control de audio
    this.createAudioControl();
    
    // Intentar inicializar audio automáticamente
    this.initAudio();
    
    // Backup: inicializar audio en respuesta a interacción del usuario
    document.addEventListener('click', () => this.initAudio(), { once: true });
    document.addEventListener('touchstart', () => this.initAudio(), { once: true });
    document.addEventListener('keydown', () => this.initAudio(), { once: true });
  },

  initAudio() {
    if (this.audioLoaded) return;
    
    try {
      // Música de fondo - usando una fuente alternativa gratuita
      this.backgroundMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = 0.3;
      
      // Sonido de clic
      this.clickSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_270f49b303.mp3');
      this.clickSound.volume = 0.5;
      
      // Iniciar música de fondo con fade in
      this.backgroundMusic.play().then(() => {
        console.log('¡Música iniciada correctamente!');
        // Fade in gradual
        let vol = 0;
        this.backgroundMusic.volume = vol;
        const interval = setInterval(() => {
          vol += 0.05;
          if (vol >= 0.3) {
            vol = 0.3;
            clearInterval(interval);
          }
          this.backgroundMusic.volume = vol;
        }, 100);
      }).catch(err => {
        console.error('Error al reproducir música:', err);
        // Mostrar mensaje más visible para activar audio
        const audioMessage = document.createElement('div');
        audioMessage.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ff6b6b;color:white;padding:10px 20px;border-radius:5px;z-index:1000;cursor:pointer;';
        audioMessage.innerHTML = '👆 Haz clic aquí para activar la música 🎵';
        audioMessage.onclick = () => {
          this.backgroundMusic.play();
          audioMessage.remove();
        };
        document.body.appendChild(audioMessage);
      });
      
      this.audioLoaded = true;
      this.updateButtonState();
    } catch (error) {
      console.error('Error al inicializar el audio:', error);
    }
  },
  
  // Reproducir efecto de sonido de clic
  playClick() {
    if (this.isMuted || !this.clickSound) return;
    
    try {
      // Usar AudioContext para mejor rendimiento en múltiples reproducciones
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        const source = audioCtx.createBufferSource();
        
        // Fallback a método tradicional
        const sound = this.clickSound.cloneNode();
        sound.play().catch(err => console.log('Error al reproducir sonido:', err));
      } else {
        // Fallback para navegadores sin AudioContext
        const sound = this.clickSound.cloneNode();
        sound.play().catch(err => console.log('Error al reproducir sonido:', err));
      }
    } catch (e) {
      // Fallback final
      const sound = this.clickSound.cloneNode();
      sound.play().catch(err => console.log('Error al reproducir sonido:', err));
    }
  },
  
  // Alternar entre silenciar/activar el audio
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.backgroundMusic) {
      if (this.isMuted) {
        // Fade out
        let vol = this.backgroundMusic.volume;
        const interval = setInterval(() => {
          vol -= 0.05;
          if (vol <= 0) {
            vol = 0;
            clearInterval(interval);
            this.backgroundMusic.muted = true;
          }
          this.backgroundMusic.volume = vol;
        }, 50);
      } else {
        // Fade in
        this.backgroundMusic.muted = false;
        let vol = 0;
        this.backgroundMusic.volume = vol;
        const interval = setInterval(() => {
          vol += 0.05;
          if (vol >= 0.3) {
            vol = 0.3;
            clearInterval(interval);
          }
          this.backgroundMusic.volume = vol;
        }, 50);
      }
    }
    
    this.updateButtonState();
    this.playClick();
  },
  
  updateButtonState() {
    if (this.audioButton) {
      if (this.isMuted) {
        this.audioButton.classList.add('muted');
        this.audioButton.setAttribute('title', 'Activar audio');
      } else {
        this.audioButton.classList.remove('muted');
        this.audioButton.setAttribute('title', 'Desactivar audio');
      }
    }
  },
  
  // Crear el botón de control de audio
  createAudioControl() {
    this.audioButton = document.createElement('button');
    this.audioButton.id = 'audio-control';
    this.audioButton.className = 'audio-control';
    this.audioButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16 21c3.527-1.547 5.999-4.909 5.999-9S19.527 4.547 16 3v2c2.387 1.386 3.999 4.047 3.999 7S18.387 17.614 16 19v2z"/><path fill="currentColor" d="M16 7v10c1.225-1.1 2-3.229 2-5s-.775-3.9-2-5z"/><path fill="currentColor" d="M11.003 3h-1.29C9.173 3 8.649 3.38 8.301 4.003l-3.298 5.99c-.279.509-.722.507-1.003.997v2.002c0 .489.225.997.503.997h.5l3.298 6.01c.348.623.892.993 1.433.993h1.29c.56 0 1.017-.399 1.017-.993v-14c0-.594-.457-.999-1.017-.999z"/></svg>';
    this.audioButton.setAttribute('aria-label', 'Control de audio');
    this.audioButton.setAttribute('title', 'Activar/Desactivar audio');
    
    // Estilo del botón
    const style = document.createElement('style');
    style.textContent = `
      .audio-control {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.7);
        border: 2px solid var(--accent-color, #ff6b6b);
        color: var(--accent-color, #ff6b6b);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
      }
      .audio-control:hover {
        transform: scale(1.1);
        box-shadow: 0 0 15px rgba(255, 107, 107, 0.7);
      }
      .audio-control.muted {
        opacity: 0.7;
      }
      .audio-control.muted::after {
        content: '';
        position: absolute;
        width: 70%;
        height: 2px;
        background-color: var(--accent-color, #ff6b6b);
        transform: rotate(45deg);
      }
      @media (prefers-reduced-motion: reduce) {
        .audio-control {
          transition: none;
        }
        .audio-control:hover {
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Agregar botón al DOM
    document.body.appendChild(this.audioButton);
    
    // Agregar evento de clic
    this.audioButton.addEventListener('click', () => {
      this.toggleMute();
      this.playClick();
    });
  }
};

// Inicializar el sistema de audio
audioSystem.init();

// Navegación por secciones con scroll suave
const buttons = document.querySelectorAll('.nav-btn');
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Reproducir efecto de sonido al hacer clic
    audioSystem.playClick();
    
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
    // Reproducir efecto de sonido al hacer clic en una tarjeta
    audioSystem.playClick();
    
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

modal?.querySelector('.modal-close')?.addEventListener('click', () => {
  audioSystem.playClick();
  closeModal();
});
modal?.querySelector('.modal-backdrop')?.addEventListener('click', (e) => {
  if (e.target instanceof HTMLElement && e.target.dataset.close === 'true') {
    audioSystem.playClick();
    closeModal();
  }
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
    audioSystem.playClick();
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
    audioSystem.playClick();
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
