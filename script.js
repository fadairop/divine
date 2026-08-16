document.addEventListener('DOMContentLoaded', () => {

  /* ---------- screen navigation ---------- */
  function goTo(id){
    const current = document.querySelector('.screen.active');
    const next = document.getElementById(id);
    if (!next || current === next) return;
    if (current){
      current.classList.add('leaving');
      current.classList.remove('active');
      setTimeout(() => current.classList.remove('leaving'), 500);
    }
    next.classList.add('active');
  }

  document.querySelectorAll('[data-target]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(el.getAttribute('data-target'));
    });
  });

  document.getElementById('restartBtn').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.reload();
  });

  /* ---------- floating particles ---------- */
  const particlesEl = document.getElementById('particles');
  const PARTICLE_COUNT = 26;
  for (let i = 0; i < PARTICLE_COUNT; i++){
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 2 + Math.random() * 4;
    const left = Math.random() * 100;
    const duration = 6 + Math.random() * 10;
    const delay = -Math.random() * duration;
    const drift = (Math.random() * 60 - 30) + 'px';
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = left + '%';
    p.style.animationDuration = duration + 's';
    p.style.animationDelay = delay + 's';
    p.style.setProperty('--drift', drift);
    particlesEl.appendChild(p);
  }

  /* ---------- lock screen keypad ---------- */
  const CODE = 'DIVINE';
  const KEY_LAYOUT = ['N', 'D', '⌫', 'V', 'I', 'E'];
  let buffer = '';

  const dotsEl = document.getElementById('dots');
  const keypadEl = document.getElementById('keypad');
  const hintEl = document.getElementById('lock-hint');
  const enterBtn = document.getElementById('lockEnter');
  const avatar = document.getElementById('lockAvatar');
  let unlocked = false;

  for (let i = 0; i < CODE.length; i++){
    const dot = document.createElement('div');
    dot.className = 'dot';
    dotsEl.appendChild(dot);
  }
  const dotEls = Array.from(dotsEl.children);

  KEY_LAYOUT.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'key' + (letter === '⌫' ? ' wide' : '');
    btn.type = 'button';
    btn.textContent = letter;
    btn.addEventListener('click', () => handleKey(letter));
    keypadEl.appendChild(btn);
  });

  function updateDots(){
    dotEls.forEach((dot, i) => {
      dot.classList.toggle('filled', i < buffer.length);
      dot.classList.remove('error');
    });
  }

  function handleKey(letter){
    if (unlocked) return;

    if (letter === '⌫'){
      buffer = buffer.slice(0, -1);
      updateDots();
      return;
    }

    const attempt = buffer + letter;
    if (CODE.indexOf(attempt) === 0){
      buffer = attempt;
      updateDots();
      if (buffer === CODE) onUnlock();
    } else {
      dotEls.forEach(dot => dot.classList.add('error'));
      dotsEl.classList.add('lock-shake');
      setTimeout(() => {
        dotsEl.classList.remove('lock-shake');
        buffer = '';
        updateDots();
      }, 350);
    }
  }

  function onUnlock(){
    unlocked = true;
    hintEl.textContent = 'Correct ✨ you may enter';
    hintEl.style.color = 'var(--rose-bright)';
    enterBtn.classList.add('show');
  }

  let hintShown = false;
  avatar.addEventListener('click', () => {
    if (unlocked) return;
    hintShown = !hintShown;
    hintEl.textContent = hintShown
      ? "It's the word for someone heavenly — just like you 💗"
      : 'Hint — click the icon above for a clue';
  });

  /* ---------- special screen: photo stack ---------- */
  const stack = document.getElementById('photoStack');
  if (stack){
    const photos = Array.from(stack.querySelectorAll('.photo'));
    let topIndex = 0;

    photos.forEach((photo, i) => { photo.style.zIndex = String(photos.length - i); });

    const spots = [
      { xFrac: 0.08, yFrac: 0.10, rotate: -8 },
      { xFrac: 0.80, yFrac: 0.12, rotate: 6 },
      { xFrac: 0.06, yFrac: 0.70, rotate: 5 },
      { xFrac: 0.78, yFrac: 0.68, rotate: -6 },
      { xFrac: 0.40, yFrac: 0.75, rotate: 3 },
    ];

    function markClickable(index){
      photos.forEach((p, i) => p.classList.toggle('clickable', i === index));
    }

    function sendToSpot(photo, spot){
      const rect = photo.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      photo.style.left = rect.left + 'px';
      photo.style.top = rect.top + 'px';
      photo.style.transform = 'translate(0, 0) rotate(0deg)';
      photo.classList.add('flying');
      void photo.offsetWidth;

      const jitterX = (Math.random() - 0.5) * 20;
      const jitterY = (Math.random() - 0.5) * 20;
      const targetLeft = window.innerWidth * spot.xFrac - width / 2 + jitterX;
      const targetTop = window.innerHeight * spot.yFrac - height / 2 + jitterY;

      photo.style.left = Math.max(8, Math.min(window.innerWidth - width - 8, targetLeft)) + 'px';
      photo.style.top = Math.max(8, Math.min(window.innerHeight - height - 8, targetTop)) + 'px';
      photo.style.transform = `translate(0, 0) rotate(${spot.rotate}deg)`;
    }

    function lineUpAllPhotos(){
      const width = photos[0].getBoundingClientRect().width;
      const height = photos[0].getBoundingClientRect().height;
      const gap = 14;
      const count = photos.length;
      const totalWidth = count * width + (count - 1) * gap;
      const startLeft = (window.innerWidth - totalWidth) / 2;
      const centerTop = (window.innerHeight - height) / 2;

      photos.forEach((photo, i) => {
        const rect = photo.getBoundingClientRect();
        photo.style.left = rect.left + 'px';
        photo.style.top = rect.top + 'px';
        photo.classList.add('flying');
        void photo.offsetWidth;

        photo.classList.add('lining-up');
        photo.style.left = (startLeft + i * (width + gap)) + 'px';
        photo.style.top = centerTop + 'px';
        photo.style.transform = 'translate(0, 0) rotate(0deg)';
        photo.style.zIndex = String(100 + i);
        photo.classList.remove('clickable');
        photo.style.cursor = 'default';
      });

      const specialEnter = document.getElementById('specialEnter');
      if (specialEnter){
        setTimeout(() => { specialEnter.classList.add('show'); }, 1150);
      }
    }

    function handlePhotoClick(photo, index){
      if (index !== topIndex) return;
      const isLastPhoto = index === photos.length - 1;

      if (isLastPhoto){ lineUpAllPhotos(); return; }

      const spot = spots[index % spots.length];
      sendToSpot(photo, spot);
      topIndex += 1;
      markClickable(topIndex);
    }

    photos.forEach((photo, index) => {
      photo.addEventListener('click', () => handlePhotoClick(photo, index));
    });

    markClickable(topIndex);
  }

  /* ---------- loading screen auto-advance ---------- */
  const loadingScreen = document.getElementById('screen-loading');
  const loadingObserver = new MutationObserver(() => {
    if (loadingScreen.classList.contains('active')){
      setTimeout(() => goTo('screen-special'), 1500);
    }
  });
  loadingObserver.observe(loadingScreen, { attributes: true, attributeFilter: ['class'] });

  /* ---------- letter intro: box reveal ---------- */
  const boxWrap = document.getElementById('boxWrap');
  const letterEl = document.getElementById('letter');
  const letterParagraphs = document.querySelectorAll('#letterInner p');
  const letterLink = document.getElementById('letterLink');
  const letterHint = document.getElementById('hint');
  let letterStep = 0;

  function revealNextLetterLine(){
    if (letterStep === 0){
      boxWrap.classList.add('split');
      letterEl.classList.add('visible');
    }

    if (letterStep < letterParagraphs.length){
      letterParagraphs[letterStep].classList.add('shown');
      letterStep++;

      if (letterStep < letterParagraphs.length){
        letterHint.textContent = 'tap to keep reading';
      } else {
        letterHint.textContent = '';
        setTimeout(() => { letterLink.classList.add('shown'); }, 400);
      }
    }
  }

  if (boxWrap){
    boxWrap.addEventListener('click', revealNextLetterLine);
    letterHint.addEventListener('click', revealNextLetterLine);
    letterEl.addEventListener('click', revealNextLetterLine);
  }

  /* ---------- memories gallery (placeholders — images added later) ---------- */
  const track = document.getElementById('gallery-track');
  const dotsWrap = document.getElementById('gallery-dots');
  const SLIDE_COUNT = 6;

  for (let i = 1; i <= SLIDE_COUNT; i++){
    const slide = document.createElement('div');
    slide.className = 'gallery-slide';
    const img = document.createElement('img');
    img.alt = 'Memory ' + i;
    img.style.display = 'none';
    img.addEventListener('error', () => { img.style.display = 'none'; slide.textContent = 'Memory ' + i; });
    img.addEventListener('load', () => { img.style.display = 'block'; slide.textContent = ''; });
    slide.textContent = 'Memory ' + i;
    slide.appendChild(img);
    track.appendChild(slide);

    const dot = document.createElement('div');
    dot.className = 'gallery-dot' + (i === 1 ? ' active' : '');
    dot.addEventListener('click', () => {
      track.scrollTo({ left: (i - 1) * (240 + 16), behavior: 'smooth' });
    });
    dotsWrap.appendChild(dot);
  }

  const galleryDotEls = Array.from(dotsWrap.children);
  track.addEventListener('scroll', () => {
    const index = Math.round(track.scrollLeft / (240 + 16));
    galleryDotEls.forEach((d, i) => d.classList.toggle('active', i === index));
  });
  
  /* ---------- background music ---------- */
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let musicStarted = false;
function startMusic(){
  if (musicStarted) return;
  musicStarted = true;
  bgMusic.volume = 0.5;
  bgMusic.play().then(() => {
    musicToggle.textContent = '🔊';
  }).catch(() => {
    // autoplay blocked — user can still tap the toggle button
  });

}
// start it the moment they unlock (this click counts as user interaction)
enterBtn.addEventListener('click', startMusic, { once: true });
musicToggle.addEventListener('click', () => {
  if (bgMusic.paused){
    bgMusic.play();
    musicToggle.textContent = '🔊';
  } else {
    bgMusic.pause();
    musicToggle.textContent = '🔇';
  }
  
});
});