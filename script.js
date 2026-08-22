
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: "0px 0px -60px 0px" });

document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i % 5, 4) * 70}ms`;
  revealObserver.observe(el);
});

const progress = document.querySelector(".scroll-progress");
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? window.scrollY / max : 0;
  progress.style.setProperty("--progress", value);
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

menuButton.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", open);
  mobileMenu.setAttribute("aria-hidden", !open);
  document.body.style.overflow = open ? "hidden" : "";
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  });
});

// Gentle depth/parallax on the hero orb.
const orb = document.querySelector(".orb");
window.addEventListener("pointermove", (e) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  orb.style.marginLeft = `${x}px`;
  orb.style.marginTop = `${y}px`;
}, { passive: true });


// Calendly booking popup.
const calendlyUrl = "https://calendly.com/themarketinghumans";

document.querySelectorAll(".book-call").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (window.Calendly && typeof window.Calendly.initPopupWidget === "function") {
      event.preventDefault();
      window.Calendly.initPopupWidget({ url: calendlyUrl });
    }
    // If Calendly hasn't loaded, the normal href opens Calendly directly.
  });
});


// Premium navigation + motion orchestration.
const header = document.querySelector('.site-header');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 28);
};
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Smooth anchor transitions with header offset.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    const target = id && document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    document.documentElement.classList.add('is-navigating');
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => document.documentElement.classList.remove('is-navigating'), prefersReduced ? 0 : 850);
  });
});

// Small, elegant pointer depth on offering icons — intentionally restrained.
if (!prefersReduced) {
  document.querySelectorAll('.offering-row').forEach((row) => {
    row.addEventListener('pointermove', (event) => {
      const rect = row.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      const mark = row.querySelector('.offering-mark');
      if (mark) mark.style.transform = `translate(${x * 5}px, ${y * 5}px) scale(1.04)`;
    });
    row.addEventListener('pointerleave', () => {
      const mark = row.querySelector('.offering-mark');
      if (mark) mark.style.transform = '';
    });
  });
}

// Add staggered reveal timing by section for a more cinematic rhythm.
document.querySelectorAll('.offerings-list .reveal, .work-grid .reveal, .approach-steps .reveal').forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i, 4) * 90}ms`;
});

// Original soft "connection ping" for the handshake reveal.
// Browsers can block sound on page load; if that happens we arm it for the
// visitor's first interaction without interrupting the visual intro.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  let played = false;
  const playConnectionPing = () => {
    if (played) return;
    played = true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.055, now + 0.012);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
      master.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.52);
      osc.connect(master);
      osc.start(now);
      osc.stop(now + 0.72);

      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(1760, now + 0.015);
      shimmerGain.gain.setValueAtTime(0.0001, now);
      shimmerGain.gain.exponentialRampToValueAtTime(0.018, now + 0.025);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
      shimmer.connect(shimmerGain).connect(ctx.destination);
      shimmer.start(now);
      shimmer.stop(now + 0.4);
      window.setTimeout(() => ctx.close().catch(() => {}), 900);
    } catch (_) {}
  };

  window.__tmhPlayPing = playConnectionPing;
  ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
    window.addEventListener(eventName, () => {
      if (!played && window.__tmhIntroFinished) playConnectionPing();
    }, { once: true, passive: true });
  });
})();

// TMH cinematic interaction layer.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('#site-loader');
  if (!loader) return;

  // Keep the handshake intro long enough to read, but never trap the visitor.
  const revealSite = () => {
    // Never leave the page locked if an external asset is slow or fails.
    window.__tmhIntroFinished = true;
    if (window.__tmhPlayPing) window.__tmhPlayPing();
    document.body.classList.remove('is-loading');
    document.body.classList.add('loaded');
    window.setTimeout(() => loader.remove(), 900);
  };

  // Start the intro from DOMContentLoaded rather than waiting for every
  // external resource (e.g. Calendly) to finish loading.
  const startIntro = () => {
    // The handshake is self-contained CSS/SVG, so the reveal never waits for images or third-party scripts.
    window.setTimeout(revealSite, reduce ? 100 : 2050);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startIntro, { once: true });
  } else {
    startIntro();
  }

  // Absolute safety valve: scrolling must never remain locked.
  window.setTimeout(() => document.body.classList.remove('is-loading'), 4500);

  if (reduce) return;

  // Magnetic, very small header CTA movement.
  document.querySelectorAll('.nav-cta').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const r = button.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - .5;
      const y = (event.clientY - r.top) / r.height - .5;
      button.style.transform = `translate(${x * 4}px, ${y * 3}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });

  // Scene-change glow when navigating between anchored sections.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      document.documentElement.classList.add('is-navigating');
      window.setTimeout(() => document.documentElement.classList.remove('is-navigating'), 900);
    });
  });
})();
