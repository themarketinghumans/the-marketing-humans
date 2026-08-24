
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

// TMH quick cinematic intro.
// The intro is intentionally short: abstract light/orbit motion first, then the site.
(() => {
  const loader = document.querySelector('#site-loader');
  if (!loader) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reduce ? 450 : 2350;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    document.body.classList.remove('is-loading');
    document.body.classList.add('loaded');
    window.setTimeout(() => loader.remove(), reduce ? 0 : 620);
  };

  // Never leave the user looking at the intro if the page finishes loading unusually slowly.
  window.setTimeout(finish, duration);
  window.addEventListener('load', () => {
    window.setTimeout(() => {
      if (document.readyState === 'complete') finish();
    }, reduce ? 120 : 1550);
  }, { once: true });
})();

// Final TMH motion pass: the film behaves like a native scene, not an embedded card.
(() => {
  const scene = document.querySelector('.motion-manifesto');
  const film = document.querySelector('.motion-video');
  const header = document.querySelector('.site-header');
  if (!scene || !film) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const syncPlayback = (visible) => {
    if (reduced) {
      film.pause();
      return;
    }
    if (visible) {
      scene.classList.add('in-view');
      film.play().catch(() => {});
    } else {
      scene.classList.remove('in-view');
      film.pause();
    }
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => syncPlayback(entry.isIntersecting));
  }, { threshold: 0.08, rootMargin: '12% 0px 12% 0px' });
  io.observe(scene);

  if (!reduced) {
    const onScroll = () => {
      const r = scene.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (window.innerHeight * .5 - (r.top + r.height * .5)) / (window.innerHeight + r.height)));
      const y = progress * -18;
      const scale = 1 + Math.abs(progress) * .018;
      const frame = scene.querySelector('.motion-frame');
      if (frame && scene.classList.contains('in-view')) {
        frame.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Adaptive header contrast: light sections use the dark mark, dark sections use the white mark.
  if (header) {
    const darkSections = document.querySelectorAll('.section-dark, .big-type');
    const darkIO = new IntersectionObserver((entries) => {
      const active = entries.some(e => e.isIntersecting && e.intersectionRatio > .18);
      header.classList.toggle('header-dark', active);
    }, { threshold: [.18, .45], rootMargin: '-72px 0px -55% 0px' });
    darkSections.forEach(section => darkIO.observe(section));
  }
})();
