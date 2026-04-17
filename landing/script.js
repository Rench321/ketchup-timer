const hero = document.querySelector(".hero");
const media = document.querySelector(".hero__media");

if (hero && media && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    media.style.setProperty("--tilt-x", `${x * 12}px`);
    media.style.setProperty("--tilt-y", `${y * 12}px`);
  });
}
