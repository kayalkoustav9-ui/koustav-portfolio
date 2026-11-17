document.documentElement.classList.add("js-enabled");

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

const revealTargets = document.querySelectorAll(".section-kicker, .intro-grid, .skills-block, .project-feature, .project-card, .experience-entry, .capability-card, .journey-list li, .contact-form");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
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
