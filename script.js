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

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const heroArtwork = document.querySelector(".hero-art");
if (heroArtwork && finePointer.matches && !motionPreference.matches) {
  heroArtwork.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const bounds = heroArtwork.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroArtwork.style.setProperty("--portrait-tilt-x", `${(x * 7).toFixed(2)}deg`);
    heroArtwork.style.setProperty("--portrait-tilt-y", `${(-y * 5).toFixed(2)}deg`);
    heroArtwork.style.setProperty("--note-shift-x", `${(-x * 10).toFixed(1)}px`);
    heroArtwork.style.setProperty("--note-shift-y", `${(-y * 8).toFixed(1)}px`);
  });
  heroArtwork.addEventListener("pointerleave", () => {
    ["--portrait-tilt-x", "--portrait-tilt-y", "--note-shift-x", "--note-shift-y"].forEach((property) => heroArtwork.style.removeProperty(property));
  });
}

const skillboardScene = document.querySelector("[data-skillboard]");
const skillboardKeys = Array.from(document.querySelectorAll(".skill-key"));
const skillName = document.querySelector("[data-skill-name]");
const skillKind = document.querySelector("[data-skill-kind]");

skillboardKeys.forEach((key) => {
  key.addEventListener("click", () => {
    skillboardKeys.forEach((candidate) => {
      const selected = candidate === key;
      candidate.classList.toggle("is-selected", selected);
      candidate.setAttribute("aria-pressed", String(selected));
    });
    skillName.textContent = key.dataset.skillNameValue;
    skillKind.textContent = key.dataset.skillKindValue;
  });
});

if (skillboardScene && finePointer.matches && !motionPreference.matches) {
  skillboardScene.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const bounds = skillboardScene.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    skillboardScene.style.setProperty("--board-yaw", `${(-3 + x * 12).toFixed(2)}deg`);
    skillboardScene.style.setProperty("--board-pitch", `${(57 - y * 9).toFixed(2)}deg`);
  });
  skillboardScene.addEventListener("pointerleave", () => {
    skillboardScene.style.removeProperty("--board-yaw");
    skillboardScene.style.removeProperty("--board-pitch");
  });
}

if (finePointer.matches && !motionPreference.matches) {
  document.querySelectorAll(".project-card, .project-feature").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty("--tilt-x", `${((x - 0.5) * 5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${((0.5 - y) * 4).toFixed(2)}deg`);
      card.style.setProperty("--spot-x", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--spot-y", `${(y * 100).toFixed(1)}%`);
    });
    card.addEventListener("pointerleave", () => {
      ["--tilt-x", "--tilt-y", "--spot-x", "--spot-y"].forEach((property) => card.style.removeProperty(property));
    });
  });
}

const sectionLinks = Array.from(navigation.querySelectorAll("a[href^='#']"));
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const currentSection = entries.find((entry) => entry.isIntersecting);
    if (!currentSection) return;
    sectionLinks.forEach((link) => {
      const isActive = link.hash === `#${currentSection.target.id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });
  sectionLinks.forEach((link) => {
    const section = document.querySelector(link.hash);
    if (section) sectionObserver.observe(section);
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
