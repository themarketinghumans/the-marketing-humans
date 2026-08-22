
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

// Minimal handshake intro using the supplied Lottie animation.
(() => {
  const loader = document.querySelector('#site-loader');
  const container = document.querySelector('#handshake-animation');
  if (!loader || !container) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finished = false;
  let animation = null;

  const finishIntro = () => {
    if (finished) return;
    finished = true;
    loader.classList.add('connection-complete');
    document.body.classList.remove('is-loading');
    document.body.classList.add('loaded');
    window.setTimeout(() => loader.remove(), 900);
  };

  const startAnimation = () => {
    if (!window.lottie) { finishIntro(); return; }
    try {
      animation = window.lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: 'Handshake-New.json',
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
          progressiveLoad: true,
          hideOnTransparent: true
        }
      });

      // Supplied animation is 1.5s; keep it crisp and monochrome.
      animation.setSpeed(reduce ? 1.8 : 1.0);
      animation.addEventListener('complete', () => {
        window.setTimeout(finishIntro, reduce ? 0 : 180);
      });
      animation.addEventListener('data_failed', finishIntro);
    } catch (_) {
      finishIntro();
    }
  };

  const waitForLottie = () => {
    if (window.lottie) { startAnimation(); return; }
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (window.lottie) { window.clearInterval(timer); startAnimation(); }
      else if (tries > 40) { window.clearInterval(timer); finishIntro(); }
    }, 50);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForLottie, { once: true });
  } else {
    waitForLottie();
  }

  // Never trap the user on the loader if a network/browser issue occurs.
  window.setTimeout(finishIntro, 4200);
})();
