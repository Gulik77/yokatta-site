const updateGradient = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  const bgStart = 4 + progress * 45;
  const bgEnd = 16 + progress * 65;
  const textLightness = 96 - progress * 70;
  document.documentElement.style.setProperty("--bg-start", `${bgStart}%`);
  document.documentElement.style.setProperty("--bg-end", `${bgEnd}%`);
  document.documentElement.style.setProperty(
    "--text-color",
    `hsl(0 0% ${textLightness}%)`
  );
};

updateGradient();
window.addEventListener("scroll", updateGradient, { passive: true });
