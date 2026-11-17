document.documentElement.classList.add("js-enabled");

const siteHeader = document.querySelector(".site-header");
const scrollProgress = document.querySelector(".scroll-progress");
let scrollUpdateQueued = false;

function updateScrollChrome() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 32);
  scrollUpdateQueued = false;
}

window.addEventListener("scroll", () => {
  if (scrollUpdateQueued) return;
  scrollUpdateQueued = true;
  window.requestAnimationFrame(updateScrollChrome);
}, { passive: true });
updateScrollChrome();

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("is-open");
  document.body.classList.remove("nav-open");
}

menuButton.addEventListener("click", () => {
  const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isExpanded));
  menuButton.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  navigation.classList.toggle("is-open", !isExpanded);
  document.body.classList.toggle("nav-open", !isExpanded);
});

navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuButton.focus();
  }
});

const portrait = document.querySelector(".portrait-image");
portrait.addEventListener("error", () => {
  portrait.src = "assets/profile-placeholder.svg";
  portrait.alt = "Portrait placeholder — add a photo of Koustav Kayal to replace this image";
}, { once: true });

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const formData = new FormData(contactForm);
  const name = String(formData.get("name")).trim();
  const email = String(formData.get("email")).trim();
  const message = String(formData.get("message")).trim();
  const subject = `Portfolio enquiry from ${name}`;
  const body = `Hi Koustav,\n\n${message}\n\n— ${name}\n${email}`;
  const mailto = `mailto:kayalkoustav9@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  formStatus.textContent = "Your email app should open with a draft. Review it there, then choose Send.";
  window.location.href = mailto;
});

const revealTargets = document.querySelectorAll(".section-kicker, .intro-grid, .skills-block, .skill-group, .projects-heading, .project-feature, .project-card, .experience-intro, .experience-entry, .capabilities-heading, .capability-card, .journey-heading, .journey-list li, .contact-copy, .contact-form");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const staggerGroups = [".skill-groups", ".project-grid", ".capability-grid", ".journey-list"];
staggerGroups.forEach((selector) => {
  document.querySelectorAll(selector).forEach((group) => {
    Array.from(group.children).forEach((element, index) => {
      element.style.setProperty("--reveal-delay", `${Math.min(index * 90, 270)}ms`);
    });
  });
});

const hero = document.querySelector(".hero");
if (hero && !motionPreference.matches) {
  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    hero.style.setProperty("--pointer-x", `${x}%`);
    hero.style.setProperty("--pointer-y", `${y}%`);
  });
  hero.addEventListener("pointerleave", () => {
    hero.style.removeProperty("--pointer-x");
    hero.style.removeProperty("--pointer-y");
  });
}

if ("IntersectionObserver" in window && !motionPreference.matches) {
  revealTargets.forEach((element) => element.classList.add("reveal"));
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -20px 0px" });
  revealTargets.forEach((element) => observer.observe(element));
}

