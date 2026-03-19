// ============================================================
//  ZeQue — main.js
// ============================================================

// ---- INTRO OVERLAY ----
// Simplest possible approach: opacity fade then display:none
(function () {
  var intro = document.getElementById('intro');
  if (!intro) return;

  var isHidden = false; // prevent multiple runs

  function hide() {
    if (isHidden) return;
    isHidden = true;

    intro.style.transition = 'opacity 0.5s ease';
    intro.style.opacity = '0';

    setTimeout(function () {
      intro.style.display = 'none';
    }, 500);
  }

  // Auto-hide after 3 seconds
  setTimeout(hide, 3000);

  // Click to skip
  intro.addEventListener('click', hide);
})();

// ---- NAVBAR ----
var nav     = document.getElementById('nav');
var hbg     = document.getElementById('hbg');
var navMenu = document.getElementById('navMenu');
var ddtog   = document.getElementById('ddtog');
var ddpanel = document.getElementById('ddpanel');
var ulLink  = document.getElementById('ulLink');

window.addEventListener('scroll', function () {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

hbg.addEventListener('click', function () {
  navMenu.classList.toggle('open');
});

// Close mobile menu on link click
navMenu.querySelectorAll('a').forEach(function (a) {
  a.addEventListener('click', function () {
    if (a !== ddtog) navMenu.classList.remove('open');
  });
});

// Admin dropdown
ddtog.addEventListener('click', function (e) {
  e.preventDefault();
  e.stopPropagation();
  ddpanel.classList.toggle('open');
});
document.addEventListener('click', function () {
  ddpanel.classList.remove('open');
});
ddpanel.addEventListener('click', function (e) {
  e.stopPropagation();
});

// Upload link in dropdown → scroll to admin section
ulLink.addEventListener('click', function (e) {
  e.preventDefault();
  ddpanel.classList.remove('open');
  document.getElementById('admin').scrollIntoView({ behavior: 'smooth' });
});

// ---- SLIDER ----
var track  = document.getElementById('sliderTrack');
var slides = track.querySelectorAll('.slide');
var dotsEl = document.getElementById('slDots');
var cur    = 0;
var autoT  = null;

function getVis() {
  return window.innerWidth <= 768 ? 1 : window.innerWidth <= 900 ? 2 : 3;
}

function goTo(i) {
  var vis = getVis();
  var max = slides.length - vis;
  cur = Math.max(0, Math.min(i, max));
  var w = 100 / vis;
  slides.forEach(function (s) { s.style.minWidth = w + '%'; });
  track.style.transform = 'translateX(-' + (cur * w) + '%)';
  document.querySelectorAll('.sdot').forEach(function (d, idx) {
    d.classList.toggle('on', idx === cur);
  });
}

function buildDots() {
  var vis   = getVis();
  var count = slides.length - vis + 1;
  dotsEl.innerHTML = '';
  for (var i = 0; i < count; i++) {
    (function (idx) {
      var d = document.createElement('div');
      d.className = 'sdot' + (idx === cur ? ' on' : '');
      d.addEventListener('click', function () { goTo(idx); resetAuto(); });
      dotsEl.appendChild(d);
    }(i));
  }
}

function next() {
  var vis = getVis();
  goTo(cur >= slides.length - vis ? 0 : cur + 1);
}
function prev() {
  var vis = getVis();
  goTo(cur <= 0 ? slides.length - vis : cur - 1);
}

function startAuto() { autoT = setInterval(next, 3500); }
function resetAuto()  { clearInterval(autoT); startAuto(); }

function initSlider() { buildDots(); goTo(0); resetAuto(); }
initSlider();
window.addEventListener('resize', initSlider);

document.getElementById('slNext').addEventListener('click', function () { next(); resetAuto(); });
document.getElementById('slPrev').addEventListener('click', function () { prev(); resetAuto(); });

// Touch / swipe
var tx = 0;
track.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; });
track.addEventListener('touchend', function (e) {
  var d = tx - e.changedTouches[0].clientX;
  if (Math.abs(d) > 50) { d > 0 ? next() : prev(); resetAuto(); }
});

// ---- IMAGE UPLOAD ----
var fileInput  = document.getElementById('fileInput');
var uploadZone = document.getElementById('uploadZone');
var galGrid    = document.getElementById('galGrid');

fileInput.addEventListener('change', function (e) { handleFiles(e.target.files); });

uploadZone.addEventListener('dragover', function (e) {
  e.preventDefault();
  uploadZone.classList.add('drag');
});
uploadZone.addEventListener('dragleave', function () {
  uploadZone.classList.remove('drag');
});
uploadZone.addEventListener('drop', function (e) {
  e.preventDefault();
  uploadZone.classList.remove('drag');
  handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
  Array.from(files).forEach(function (f) {
    if (!f.type.startsWith('image/')) { showToast('⚠ ' + f.name + ' is not an image', 'w'); return; }
    if (f.size > 5 * 1024 * 1024)    { showToast('⚠ ' + f.name + ' exceeds 5MB', 'w'); return; }
    var reader = new FileReader();
    reader.onload = function (e) { addItem(e.target.result, f.name); };
    reader.readAsDataURL(f);
  });
  fileInput.value = '';
}

function addItem(src, name) {
  var el = document.createElement('div');
  el.className = 'gal-item';
  el.innerHTML = '<img src="' + src + '" alt="' + name + '"/><button class="gal-rm">✕</button>';
  el.querySelector('.gal-rm').addEventListener('click', function () {
    el.style.cssText = 'opacity:0;transform:scale(.8);transition:all .3s';
    setTimeout(function () { el.remove(); }, 300);
    showToast('🗑 Image removed', 'i');
  });
  galGrid.appendChild(el);
  showToast('✅ Image uploaded!', 's');
}

// ---- CONTACT / FEEDBACK TABS ----
var tabs  = document.querySelectorAll('.tab');
var cForm = document.getElementById('cForm');
var fForm = document.getElementById('fForm');

tabs.forEach(function (t) {
  t.addEventListener('click', function () {
    tabs.forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    cForm.style.display = t.dataset.t === 'c' ? 'flex' : 'none';
    fForm.style.display = t.dataset.t === 'f' ? 'flex' : 'none';
  });
});

cForm.addEventListener('submit', function (e) {
  e.preventDefault();
  showToast('✅ Message sent! We\'ll reply within 24 hrs.', 's');
  cForm.reset();
});

fForm.addEventListener('submit', function (e) {
  e.preventDefault();
  showToast('🙏 Thank you for your feedback!', 's');
  fForm.reset();
  starVal = 0;
  document.querySelectorAll('.stars span').forEach(function (s) { s.classList.remove('on'); });
});

// ---- STAR RATING ----
var starVal = 0;
var starEls = document.querySelectorAll('.stars span');

starEls.forEach(function (s) {
  s.addEventListener('click', function () {
    starVal = parseInt(s.dataset.v);
    starEls.forEach(function (x) { x.classList.toggle('on', parseInt(x.dataset.v) <= starVal); });
  });
  s.addEventListener('mouseenter', function () {
    var v = parseInt(s.dataset.v);
    starEls.forEach(function (x) { x.classList.toggle('on', parseInt(x.dataset.v) <= v); });
  });
  s.addEventListener('mouseleave', function () {
    starEls.forEach(function (x) { x.classList.toggle('on', parseInt(x.dataset.v) <= starVal); });
  });
});

// ---- SCROLL REVEAL ----
var rvEls = document.querySelectorAll('.svc-card, .tcard, .vm-card, .av-card, .ci-item, .rv');
rvEls.forEach(function (el) { el.classList.add('rv'); });

var rvObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e, i) {
    if (e.isIntersecting) {
      setTimeout(function () { e.target.classList.add('show'); }, i * 70);
      rvObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

rvEls.forEach(function (el) { rvObs.observe(el); });

// ---- TEAM PHOTO FALLBACK ----
// When src is empty, tav-img is hidden and tav-init is shown by onerror
// The onerror is inline in HTML, nothing extra needed here

// ---- TOAST ----
function showToast(msg, type) {
  document.querySelectorAll('.toast').forEach(function (t) { t.remove(); });
  var colors = {
    s: { bg: '#0a2e1a', border: '#00d4aa' },
    w: { bg: '#2e1a00', border: '#f0a500' },
    i: { bg: '#0a1a2e', border: '#38bdf8' }
  };
  var c = colors[type] || colors.s;
  var t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  t.style.background    = c.bg;
  t.style.borderLeft    = '4px solid ' + c.border;
  document.body.appendChild(t);
  setTimeout(function () {
    t.style.transition = 'all .3s';
    t.style.opacity    = '0';
    t.style.transform  = 'translateY(8px)';
    setTimeout(function () { t.remove(); }, 320);
  }, 3500);
}