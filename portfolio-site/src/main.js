document.getElementById("year").textContent = new Date().getFullYear();

// Section reveal + spinning fly-in icons on scroll
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => sectionObserver.observe(el));

const iconObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("launched");
      } else if (entry.boundingClientRect.top > window.innerHeight * 0.65) {
        // Reset when scrolled back below so scrolling down launches & spins again
        entry.target.classList.remove("launched");
      }
    });
  },
  { threshold: 0.2 }
);
document.querySelectorAll(".launch-icon").forEach((el) => iconObserver.observe(el));

// Cosmonaut roaming with pointer movement
const cosmonaut = document.getElementById("cosmonaut");
const hud = document.getElementById("hud-telemetry");
const pointer = { x: null, y: null, radius: 155 };
const cosmo = { x: -120, y: -120, angle: 0 };

let lastScrollY = window.scrollY;
let scrollVelocity = 0;

function updateHud() {
  if (!hud) return;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pct = Math.min(100, Math.max(0, Math.round((window.scrollY / maxScroll) * 100)));
  const px = pointer.x === null ? 0 : Math.round(pointer.x);
  const py = pointer.y === null ? 0 : Math.round(pointer.y);
  hud.textContent = `SCROLL: ${pct}% | PTR: ${px},${py}`;
}

window.addEventListener("mousemove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  if (cosmonaut && cosmo.x < 0) {
    cosmo.x = pointer.x + 22;
    cosmo.y = pointer.y + 18;
  }
  if (cosmonaut) cosmonaut.style.opacity = "1";
  updateHud();
});

window.addEventListener("mouseleave", () => {
  pointer.x = null;
  pointer.y = null;
  if (cosmonaut) cosmonaut.style.opacity = "0";
  updateHud();
});

window.addEventListener(
  "scroll",
  () => {
    const currentY = window.scrollY;
    scrollVelocity = (currentY - lastScrollY) * 0.22;
    lastScrollY = currentY;
    updateHud();
  },
  { passive: true }
);

// Planetary interactive + scroll-reactive canvas background
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", resize);

const palettes = [
  { body: "#f59e0b", band: "#78350f", ring: "rgba(251, 191, 36, 0.45)" },
  { body: "#38bdf8", band: "#0c4a6e", ring: "rgba(125, 211, 252, 0.35)" },
  { body: "#a78bfa", band: "#4c1d95", ring: "rgba(196, 181, 253, 0.35)" },
  { body: "#34d399", band: "#064e3b", ring: "rgba(110, 231, 183, 0.32)" },
  { body: "#fb7185", band: "#881337", ring: "rgba(253, 164, 175, 0.35)" },
];

const planetCount = window.innerWidth < 640 ? 16 : 28;
const planets = Array.from({ length: planetCount }, (_, i) => {
  const pal = palettes[i % palettes.length];
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.55,
    vy: (Math.random() - 0.5) * 0.55,
    r: Math.random() * 14 + 8,
    spin: Math.random() * Math.PI * 2,
    vSpin: (Math.random() - 0.5) * 0.015,
    hasRing: i % 3 === 0,
    ringTilt: (Math.random() - 0.5) * 0.7,
    ...pal,
  };
});

function drawPlanet(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin);

  // Planet sphere
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.fillStyle = p.body;
  ctx.fill();

  // Clip to sphere for atmospheric band / shadow
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = p.band;
  ctx.fillRect(-p.r, -p.r * 0.25, p.r * 2, p.r * 0.28);
  ctx.fillStyle = "rgba(9, 12, 16, 0.38)";
  ctx.beginPath();
  ctx.arc(p.r * 0.35, p.r * 0.2, p.r * 1.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Optional orbital ring
  if (p.hasRing) {
    ctx.save();
    ctx.rotate(p.ringTilt);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r * 1.85, p.r * 0.45, 0, 0, Math.PI * 2);
    ctx.strokeStyle = p.ring;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function animate() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  ctx.clearRect(0, 0, vw, vh);

  scrollVelocity *= 0.88;

  // Move & draw planets
  for (let i = 0; i < planets.length; i++) {
    const p = planets[i];
    p.x += p.vx;
    p.y += p.vy + scrollVelocity;
    p.spin += p.vSpin + scrollVelocity * 0.004;

    if (pointer.x !== null && pointer.y !== null) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < pointer.radius && dist > 0) {
        const push = (pointer.radius - dist) / pointer.radius;
        p.x += (dx / dist) * push * 2.1;
        p.y += (dy / dist) * push * 2.1;
        p.spin += push * 0.025;
      }
    }

    if (p.x < -30) p.x = vw + 30;
    if (p.x > vw + 30) p.x = -30;
    if (p.y < -30) p.y = vh + 30;
    if (p.y > vh + 30) p.y = -30;

    drawPlanet(p);
  }

  // Roam cosmonaut smoothly toward pointer
  if (cosmonaut && pointer.x !== null && pointer.y !== null) {
    const targetX = pointer.x + 18;
    const targetY = pointer.y + 14 + Math.sin(performance.now() * 0.005) * 4;
    const dx = targetX - cosmo.x;
    const dy = targetY - cosmo.y;
    cosmo.x += dx * 0.09;
    cosmo.y += dy * 0.09;
    const targetTilt = Math.max(-25, Math.min(25, dx * 0.35));
    cosmo.angle += (targetTilt - cosmo.angle) * 0.12;
    cosmonaut.style.transform = `translate3d(${cosmo.x}px, ${cosmo.y}px, 0) rotate(${cosmo.angle}deg)`;
  }

  requestAnimationFrame(animate);
}
updateHud();
animate();
