const GH_USER = "yourusername";

// 1. Year & Toast
document.getElementById("year").textContent = new Date().getFullYear();

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("translate-y-16", "opacity-0");
  setTimeout(() => {
    toast.classList.add("translate-y-16", "opacity-0");
  }, 2400);
}

// 2. Copy Email
const copyBtn = document.getElementById("copy-email-btn");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const email = copyBtn.getAttribute("data-email");
    try {
      await navigator.clipboard.writeText(email);
      showToast(`COPIED: ${email}`);
    } catch {
      showToast("COPY FAILED - USE MAIL LINK");
    }
  });
}

// 3. Mobile Menu
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    mobileMenu.classList.toggle("flex");
  });
  document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      mobileMenu.classList.remove("flex");
    });
  });
}

// 4. Planetary Orbit Rise Observer (Aşağıdan planet kimi yüklənərək orbitə çıxma)
const orbitObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("in-orbit");
        }, 160);
      }
    });
  },
  { threshold: 0.22, rootMargin: "0px 0px -70px 0px" }
);

function bindOrbitElements() {
  document.querySelectorAll(".planet-emerge").forEach((el) => orbitObserver.observe(el));
}
bindOrbitElements();

// 5. Active Nav Section Observer
const navLinks = document.querySelectorAll(".nav-link");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("data-nav") === id);
        });
      }
    });
  },
  { rootMargin: "-40% 0px -50% 0px" }
);
document.querySelectorAll("section[id]").forEach((sec) => sectionObserver.observe(sec));

// 6. Dynamic GitHub Repositories
async function loadGitHubProjects() {
  const statusEl = document.getElementById("repo-status");
  const gridEl = document.getElementById("projects-grid");
  if (!gridEl || !GH_USER || GH_USER === "yourusername") {
    if (statusEl) statusEl.textContent = "LOCAL_TEMPLATE";
    return;
  }

  try {
    const res = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=4`);
    if (!res.ok) throw new Error("API limit or user not found");
    const repos = await res.json();
    const publicRepos = repos.filter((r) => !r.fork).slice(0, 4);

    if (publicRepos.length === 0) {
      if (statusEl) statusEl.textContent = "NO_PUBLIC_REPOS";
      return;
    }

    gridEl.innerHTML = publicRepos
      .map(
        (repo, idx) => `
        <div class="scroll-parallax" data-speed="${idx % 2 === 0 ? -0.03 : -0.055}">
          <article class="cosmic-panel p-7 h-full flex flex-col justify-between planet-emerge" style="transition-delay: ${idx * 180}ms;">
            <div>
              <div class="flex justify-between font-mono text-xs text-zinc-400 mb-3">
                <span>0${idx + 1} // ★ ${repo.stargazers_count}</span>
                <span class="text-cyan-300 bg-cyan-400/10 px-2.5 py-0.5 rounded-full">${repo.language || "Code"}</span>
              </div>
              <h3 class="text-xl font-bold text-white mb-2.5">${repo.name}</h3>
              <p class="text-sm text-zinc-300/80 leading-relaxed mb-6">
                ${repo.description || "No description provided in repository metadata."}
              </p>
            </div>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="font-mono text-xs text-purple-300 uppercase tracking-wider hover:text-purple-200 inline-flex items-center gap-1.5">
              View Source <span>→</span>
            </a>
          </article>
        </div>`
      )
      .join("");

    bindOrbitElements();
    if (statusEl) statusEl.textContent = `SYNCED (${publicRepos.length})`;
  } catch {
    if (statusEl) statusEl.textContent = "OFFLINE_FALLBACK";
  }
}
loadGitHubProjects();

// 7. Ultra-Smooth Inertial Scroll Physics
const scrollProgress = document.getElementById("scroll-progress");
const hud = document.getElementById("hud-telemetry");
let smoothScrollY = window.scrollY;
let targetScrollY = window.scrollY;
let scrollVelocity = 0;

window.addEventListener(
  "scroll",
  () => {
    targetScrollY = window.scrollY;
  },
  { passive: true }
);

function updateSmoothScroll() {
  const prev = smoothScrollY;
  smoothScrollY += (targetScrollY - smoothScrollY) * 0.055;
  const instantDelta = smoothScrollY - prev;
  scrollVelocity = scrollVelocity * 0.91 + instantDelta * 0.09;

  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pct = Math.min(100, Math.max(0, (smoothScrollY / maxScroll) * 100));

  if (scrollProgress) {
    scrollProgress.style.width = `${pct}%`;
  }

  if (hud) {
    hud.textContent = `ORBIT: ${Math.round(pct)}% | DEEP_SPACE`;
  }

  const vh = window.innerHeight;
  document.querySelectorAll(".scroll-parallax").forEach((el) => {
    const rect = el.getBoundingClientRect();
    const speed = parseFloat(el.getAttribute("data-speed")) || -0.04;
    const centerOffset = rect.top + rect.height / 2 - vh / 2;
    const translateY = centerOffset * speed;
    el.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
  });
}

// 8. Zero-Gravity Astronaut Mouse Follower
const astroEl = document.getElementById("astronaut-follower");
const astroTilt = document.getElementById("astronaut-tilt");
const astroState = {
  x: window.innerWidth * 0.78,
  y: window.innerHeight * 0.32,
  targetX: window.innerWidth * 0.78,
  targetY: window.innerHeight * 0.32,
  vx: 0,
  vy: 0,
};

window.addEventListener("mousemove", (e) => {
  astroState.targetX = e.clientX + 26;
  astroState.targetY = e.clientY - 38;
});

function updateAstronaut() {
  if (!astroEl) return;

  const ax = (astroState.targetX - astroState.x) * 0.032;
  const ay = (astroState.targetY - astroState.y) * 0.032;

  astroState.vx = (astroState.vx + ax) * 0.86;
  astroState.vy = (astroState.vy + ay) * 0.86;

  astroState.x += astroState.vx;
  astroState.y += astroState.vy;

  const tiltAngle = Math.max(-28, Math.min(28, astroState.vx * 2.4));
  astroEl.style.transform = `translate3d(${astroState.x.toFixed(1)}px, ${astroState.y.toFixed(1)}px, 0)`;
  if (astroTilt) {
    astroTilt.style.transform = `rotate(${tiltAngle.toFixed(1)}deg)`;
  }
}

// 9. Photorealistic Volumetric Galaxy & Deep Space Engine
const pointer = { x: null, y: null, smoothX: 0, smoothY: 0 };
const shockwaves = [];

window.addEventListener("mousemove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
});

window.addEventListener("mouseleave", () => {
  pointer.x = null;
  pointer.y = null;
});

window.addEventListener("click", (e) => {
  shockwaves.push({ x: e.clientX, y: e.clientY, radius: 0, maxRadius: 340, alpha: 0.42 });
});

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let vw = window.innerWidth;
let vh = window.innerHeight;

function resize() {
  vw = window.innerWidth;
  vh = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = vw * dpr;
  canvas.height = vh * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", resize);

// --- OFFSCREEN REALISTIC GALAXY TEXTURE GENERATOR ---
// Real teleskop görüntüsü kimi: qızılı nüvə, qaz buludları, tünd toz zolaqları və minlərlə mikro-ulduz
const galaxySize = 1100;
const galaxyCanvas = document.createElement("canvas");
galaxyCanvas.width = galaxySize;
galaxyCanvas.height = galaxySize;
const gCtx = galaxyCanvas.getContext("2d");

function buildRealisticGalaxyTexture() {
  const half = galaxySize / 2;
  gCtx.clearRect(0, 0, galaxySize, galaxySize);

  // 1. Xarici kosmik halo (yumşaq bənövşəyi-mavi işıq yayılması)
  const outerHalo = gCtx.createRadialGradient(half, half, 20, half, half, half * 0.92);
  outerHalo.addColorStop(0, "rgba(255, 245, 220, 0.35)");
  outerHalo.addColorStop(0.2, "rgba(192, 132, 252, 0.16)");
  outerHalo.addColorStop(0.5, "rgba(59, 130, 246, 0.08)");
  outerHalo.addColorStop(0.8, "rgba(30, 27, 75, 0.03)");
  outerHalo.addColorStop(1, "rgba(0, 0, 0, 0)");
  gCtx.fillStyle = outerHalo;
  gCtx.fillRect(0, 0, galaxySize, galaxySize);

  // 2. Spiral qollar boyunca qaz dumanlıqları (Additive light blending)
  gCtx.save();
  gCtx.globalCompositeOperation = "lighter";

  const arms = 2; // Realistik qoşa spiral qol (Andromeda / Whirlpool tipi)
  const cloudCount = 420;
  for (let i = 0; i < cloudCount; i++) {
    const t = Math.pow(Math.random(), 0.95);
    const radius = 25 + t * (half * 0.82);
    const armIndex = i % arms;
    const armOffset = armIndex * Math.PI;
    const spiralTwist = t * 4.8;
    const spread = (Math.random() - 0.5) * (0.35 + t * 0.65);
    const angle = armOffset + spiralTwist + spread;

    const x = half + Math.cos(angle) * radius;
    const y = half + Math.sin(angle) * radius;
    const cloudRadius = (18 + Math.random() * 48) * (1 - t * 0.35);

    const grad = gCtx.createRadialGradient(x, y, 0, x, y, cloudRadius);
    if (t < 0.28) {
      // Mərkəzə yaxın isti qızılı-ağ qazlar
      grad.addColorStop(0, "rgba(255, 237, 213, 0.075)");
      grad.addColorStop(0.5, "rgba(251, 191, 36, 0.03)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else if (Math.random() > 0.25) {
      // Qollarda mavi-bənövşəyi ulduz əmələgəlmə zonaları
      grad.addColorStop(0, "rgba(129, 140, 248, 0.065)");
      grad.addColorStop(0.5, "rgba(56, 189, 248, 0.025)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else {
      // H-II çəhrayı-qırmızı ionlaşmış hidrogen dumanlıqları
      grad.addColorStop(0, "rgba(232, 121, 249, 0.07)");
      grad.addColorStop(0.5, "rgba(192, 38, 211, 0.025)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    }

    gCtx.fillStyle = grad;
    gCtx.beginPath();
    gCtx.arc(x, y, cloudRadius, 0, Math.PI * 2);
    gCtx.fill();
  }

  // 3. Minlərlə incə ulduz tozu (Realistik ulduz sıxlığı)
  const starDustCount = 4800;
  for (let i = 0; i < starDustCount; i++) {
    const t = Math.pow(Math.random(), 1.45);
    const radius = 8 + t * (half * 0.88);
    const armOffset = (i % arms) * Math.PI;
    const spiralTwist = t * 4.8;
    const scatter = (Math.random() - 0.5) * (0.45 + t * 1.1);
    const angle = armOffset + spiralTwist + scatter;

    const x = half + Math.cos(angle) * radius;
    const y = half + Math.sin(angle) * radius;
    const size = Math.random() < 0.06 ? Math.random() * 1.6 + 0.8 : Math.random() * 0.85 + 0.2;
    const alpha = (1 - t * 0.55) * (Math.random() * 0.7 + 0.15);

    if (t < 0.25) {
      gCtx.fillStyle = `rgba(255, 248, 231, ${alpha})`;
    } else if (Math.random() > 0.3) {
      gCtx.fillStyle = `rgba(224, 242, 254, ${alpha})`;
    } else {
      gCtx.fillStyle = `rgba(243, 232, 255, ${alpha})`;
    }

    gCtx.fillRect(x, y, size, size);
  }
  gCtx.restore();

  // 4. Tünd kosmik toz zolaqları (Dark Dust Lanes - real qalaktika dərinliyi verir)
  gCtx.save();
  gCtx.globalCompositeOperation = "source-atop";
  for (let i = 0; i < 160; i++) {
    const t = 0.14 + Math.random() * 0.65;
    const radius = t * (half * 0.82);
    const armOffset = (i % arms) * Math.PI + 0.24; // Qolun daxili kənarı boyunca
    const spiralTwist = t * 4.8;
    const angle = armOffset + spiralTwist + (Math.random() - 0.5) * 0.18;

    const x = half + Math.cos(angle) * radius;
    const y = half + Math.sin(angle) * radius;
    const dustR = 12 + Math.random() * 24;

    const dustGrad = gCtx.createRadialGradient(x, y, 0, x, y, dustR);
    dustGrad.addColorStop(0, "rgba(2, 3, 7, 0.42)");
    dustGrad.addColorStop(1, "rgba(2, 3, 7, 0)");
    gCtx.fillStyle = dustGrad;
    gCtx.beginPath();
    gCtx.arc(x, y, dustR, 0, Math.PI * 2);
    gCtx.fill();
  }
  gCtx.restore();

  // 5. Parlaq Qalaktika Nüvəsi (Galactic Bulge / Core)
  gCtx.save();
  gCtx.globalCompositeOperation = "lighter";
  const core = gCtx.createRadialGradient(half, half, 0, half, half, half * 0.24);
  core.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  core.addColorStop(0.15, "rgba(255, 243, 214, 0.72)");
  core.addColorStop(0.42, "rgba(251, 191, 36, 0.24)");
  core.addColorStop(0.75, "rgba(168, 85, 247, 0.08)");
  core.addColorStop(1, "rgba(0, 0, 0, 0)");
  gCtx.fillStyle = core;
  gCtx.beginPath();
  gCtx.arc(half, half, half * 0.24, 0, Math.PI * 2);
  gCtx.fill();
  gCtx.restore();
}
buildRealisticGalaxyTexture();

// --- DƏRİN KOSMOS ARXA PLAN ULDUZLARI ---
const deepStarCount = vw < 640 ? 150 : 320;
const deepStars = Array.from({ length: deepStarCount }, () => {
  const starTypes = ["255, 255, 255", "202, 232, 255", "254, 240, 199", "233, 213, 255"];
  return {
    x: Math.random() * vw,
    y: Math.random() * vh,
    size: Math.random() < 0.08 ? Math.random() * 1.6 + 0.9 : Math.random() * 1.1 + 0.25,
    depth: Math.random() * 0.55 + 0.08,
    twinkleSpeed: Math.random() * 0.025 + 0.008,
    phase: Math.random() * Math.PI * 2,
    color: starTypes[Math.floor(Math.random() * starTypes.length)],
    hasSpike: Math.random() < 0.04, // Parlaq ulduzlarda teleskop işıq şüası (diffraction spike)
  };
});

// --- REALİSTİK ATMOSFERLİ PLANETLƏR ---
const planets = [
  {
    baseX: 0.84,
    baseY: 0.25,
    radius: vw < 640 ? 30 : 48,
    orbitSpeedY: 0.15,
    orbitRadiusX: 32,
    orbitFreq: 0.0011,
    litColor: "#c4b5fd",
    midColor: "#4c1d95",
    darkColor: "#090617",
    atmoColor: "rgba(167, 139, 250, 0.28)",
    hasRing: true,
    ringAngle: -0.36,
  },
  {
    baseX: 0.12,
    baseY: 0.68,
    radius: vw < 640 ? 22 : 34,
    orbitSpeedY: 0.22,
    orbitRadiusX: 25,
    orbitFreq: 0.0015,
    litColor: "#7dd3fc",
    midColor: "#0369a1",
    darkColor: "#04101f",
    atmoColor: "rgba(56, 189, 248, 0.26)",
    hasRing: false,
    ringAngle: 0,
  },
  {
    baseX: 0.87,
    baseY: 0.88,
    radius: vw < 640 ? 13 : 20,
    orbitSpeedY: 0.3,
    orbitRadiusX: 18,
    orbitFreq: 0.0019,
    litColor: "#fed7aa",
    midColor: "#9a3412",
    darkColor: "#140602",
    atmoColor: "rgba(251, 146, 60, 0.2)",
    hasRing: false,
    ringAngle: 0,
  },
];

function drawRealisticPlanet(p, time) {
  const px =
    vw * p.baseX +
    Math.sin(smoothScrollY * p.orbitFreq + time * 0.00035) * p.orbitRadiusX +
    (pointer.smoothX - vw * 0.5) * -0.022;

  let py = vh * p.baseY - smoothScrollY * p.orbitSpeedY;
  const wrapH = vh + p.radius * 4.5;
  py = (((py + p.radius * 2.2) % wrapH) + wrapH) % wrapH - p.radius * 2.2;

  ctx.save();
  ctx.translate(px, py);

  // Atmosfer işıqlanması (Atmospheric scattering)
  const atmo = ctx.createRadialGradient(0, 0, p.radius * 0.85, 0, 0, p.radius * 1.65);
  atmo.addColorStop(0, p.atmoColor);
  atmo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = atmo;
  ctx.beginPath();
  ctx.arc(0, 0, p.radius * 1.65, 0, Math.PI * 2);
  ctx.fill();

  // Arxa halqa (çoxqatlı buz və toz halqası)
  if (p.hasRing) {
    ctx.save();
    ctx.rotate(p.ringAngle + smoothScrollY * 0.00025);
    ctx.strokeStyle = "rgba(221, 214, 254, 0.28)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 2.15, p.radius * 0.52, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(167, 139, 250, 0.16)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 2.45, p.radius * 0.6, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Planet səthi (3D işıq-kölgə keçidi / Terminator line)
  const sphere = ctx.createRadialGradient(
    -p.radius * 0.42,
    -p.radius * 0.42,
    p.radius * 0.05,
    0,
    0,
    p.radius * 1.05
  );
  sphere.addColorStop(0, p.litColor);
  sphere.addColorStop(0.52, p.midColor);
  sphere.addColorStop(1, p.darkColor);

  ctx.fillStyle = sphere;
  ctx.beginPath();
  ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
  ctx.fill();

  // Planet üzərində zərif atmosfer qurşaqları (Banded clouds)
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.rotate(-0.2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.fillRect(-p.radius, -p.radius * 0.25, p.radius * 2, p.radius * 0.16);
  ctx.fillRect(-p.radius, p.radius * 0.15, p.radius * 2, p.radius * 0.12);
  ctx.restore();

  // Ön halqa yarısı
  if (p.hasRing) {
    ctx.save();
    ctx.rotate(p.ringAngle + smoothScrollY * 0.00025);
    ctx.strokeStyle = "rgba(237, 233, 254, 0.48)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 2.15, p.radius * 0.52, 0, 0, Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(196, 181, 253, 0.24)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 2.45, p.radius * 0.6, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

let galaxySpin = 0;

function animate(time) {
  updateSmoothScroll();
  updateAstronaut();

  ctx.clearRect(0, 0, vw, vh);

  if (pointer.x !== null && pointer.y !== null) {
    pointer.smoothX += (pointer.x - pointer.smoothX) * 0.045;
    pointer.smoothY += (pointer.y - pointer.smoothY) * 0.045;
  } else {
    pointer.smoothX += (vw * 0.5 - pointer.smoothX) * 0.02;
    pointer.smoothY += (vh * 0.5 - pointer.smoothY) * 0.02;
  }

  // 1. Dərin kosmos ulduzları və teleskop parıltıları
  for (const star of deepStars) {
    star.y -= scrollVelocity * star.depth * 0.4;
    if (star.y < 0) star.y += vh;
    if (star.y > vh) star.y -= vh;

    const twinkle = 0.55 + 0.45 * Math.sin(time * 0.002 * star.twinkleSpeed * 50 + star.phase);
    ctx.fillStyle = `rgba(${star.color}, ${twinkle * 0.85})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();

    if (star.hasSpike) {
      ctx.strokeStyle = `rgba(${star.color}, ${twinkle * 0.32})`;
      ctx.lineWidth = 0.7;
      const len = star.size * 4.5;
      ctx.beginPath();
      ctx.moveTo(star.x - len, star.y);
      ctx.lineTo(star.x + len, star.y);
      ctx.moveTo(star.x, star.y - len);
      ctx.lineTo(star.x, star.y + len);
      ctx.stroke();
    }
  }

  // 2. Realistik Qalaktika (3D Perspektiv Əyilmə + Yavaş Fırlanma)
  const gx = vw * 0.52 + (pointer.smoothX - vw * 0.5) * -0.025;
  const gy = vh * 0.48 + (pointer.smoothY - vh * 0.5) * -0.025 - smoothScrollY * 0.12;
  const scaleFactor = Math.max(vw, vh) / 880;

  galaxySpin += 0.00035 + scrollVelocity * 0.00035;

  ctx.save();
  ctx.translate(gx, gy);
  // Qalaktika müstəvisinin kosmosdakı maili bucağı (Andromeda kimi)
  ctx.rotate(-0.42 + Math.sin(smoothScrollY * 0.0004) * 0.05);
  ctx.scale(scaleFactor, scaleFactor * 0.54); // Perspektiv sıxılma
  ctx.rotate(galaxySpin);
  ctx.drawImage(galaxyCanvas, -galaxySize / 2, -galaxySize / 2);
  ctx.restore();

  // 3. Klik şok dalğaları
  for (let s = shockwaves.length - 1; s >= 0; s--) {
    const sw = shockwaves[s];
    sw.radius += 5.5;
    sw.alpha *= 0.95;

    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(216, 180, 254, ${sw.alpha})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (sw.radius > sw.maxRadius || sw.alpha < 0.01) {
      shockwaves.splice(s, 1);
    }
  }

  // 4. Atmosferli və halqalı planetlər
  for (const planet of planets) {
    drawRealisticPlanet(planet, time);
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
