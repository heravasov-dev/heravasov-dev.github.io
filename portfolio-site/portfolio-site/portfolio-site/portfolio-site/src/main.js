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

// 4. Planetary Orbit Rise Observer (Aşağı üfüqdən yavaşca orbitə yüklənmə)
const orbitObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("in-orbit");
        }, 180);
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
              <p class="text-sm text-zinc-300/85 leading-relaxed mb-6">
                ${repo.description || "No description provided in repository metadata."}
              </p>
            </div>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="font-mono text-xs text-amber-300 uppercase tracking-wider hover:text-amber-200 inline-flex items-center gap-1.5">
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
  smoothScrollY += (targetScrollY - smoothScrollY) * 0.05;
  const instantDelta = smoothScrollY - prev;
  scrollVelocity = scrollVelocity * 0.92 + instantDelta * 0.08;

  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pct = Math.min(100, Math.max(0, (smoothScrollY / maxScroll) * 100));

  if (scrollProgress) {
    scrollProgress.style.width = `${pct}%`;
  }

  if (hud) {
    hud.textContent = `ORBIT: ${Math.round(pct)}% | DEEP_FIELD`;
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

// 8. Zero-Gravity Astronaut Mouse Follower (Reaktiv alov və fənər işığı ilə)
const astroEl = document.getElementById("astronaut-follower");
const astroTilt = document.getElementById("astronaut-tilt");
const astroThrusters = document.getElementById("astro-thrusters");
const astroState = {
  x: window.innerWidth * 0.78,
  y: window.innerHeight * 0.3,
  targetX: window.innerWidth * 0.78,
  targetY: window.innerHeight * 0.3,
  vx: 0,
  vy: 0,
};

window.addEventListener("mousemove", (e) => {
  astroState.targetX = e.clientX + 28;
  astroState.targetY = e.clientY - 42;
});

function updateAstronaut() {
  if (!astroEl) return;

  const ax = (astroState.targetX - astroState.x) * 0.03;
  const ay = (astroState.targetY - astroState.y) * 0.03;

  astroState.vx = (astroState.vx + ax) * 0.87;
  astroState.vy = (astroState.vy + ay) * 0.87;

  astroState.x += astroState.vx;
  astroState.y += astroState.vy;

  const speed = Math.hypot(astroState.vx, astroState.vy);
  const tiltAngle = Math.max(-30, Math.min(30, astroState.vx * 2.5));

  astroEl.style.transform = `translate3d(${astroState.x.toFixed(1)}px, ${astroState.y.toFixed(1)}px, 0)`;
  if (astroTilt) {
    astroTilt.style.transform = `rotate(${tiltAngle.toFixed(1)}deg)`;
  }
  if (astroThrusters) {
    // Hərəkət sürətinə görə itələyici alovun parlaqlığı artır
    const thrustOpacity = Math.min(1, 0.15 + speed * 0.12);
    astroThrusters.setAttribute("opacity", thrustOpacity.toFixed(2));
  }
}

// 9. PHOTOREALISTIC DEEP SPACE, FBM NEBULA GALAXY & BANDED PLANETS ENGINE
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
  shockwaves.push({ x: e.clientX, y: e.clientY, radius: 0, maxRadius: 360, alpha: 0.38 });
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

// --- 2D Value Noise & FBM (Realistik kosmik bulud və planet səthi teksturası üçün) ---
function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x, y, octaves = 4) {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise(x * freq, y * freq);
    freq *= 2.02;
    amp *= 0.5;
  }
  return val;
}

// --- 1. FOTOREALİSTİK QALAKTİKA TEKSTURASI (Pixel-Level Nebula + 8500+ Ulduz) ---
const galaxySize = 1150;
const galaxyCanvas = document.createElement("canvas");
galaxyCanvas.width = galaxySize;
galaxyCanvas.height = galaxySize;
const gCtx = galaxyCanvas.getContext("2d");

function buildPhotorealisticGalaxy() {
  const half = galaxySize / 2;

  // A. Pixel əsaslı FBM Qaz Buludu və Toz Zolaqları (Real astronomik şəkil effekti)
  const res = 280; // Performans üçün 280x280 hesablanıb 1150x1150-yə hamar böyüdülür
  const off = document.createElement("canvas");
  off.width = res;
  off.height = res;
  const oCtx = off.getContext("2d");
  const imgData = oCtx.createImageData(res, res);
  const data = imgData.data;

  const rHalf = res / 2;
  for (let py = 0; py < res; py++) {
    for (let px = 0; px < res; px++) {
      const dx = (px - rHalf) / rHalf;
      const dy = (py - rHalf) / rHalf;
      const dist = Math.hypot(dx, dy);
      if (dist > 1.0) continue;

      const angle = Math.atan2(dy, dx);
      // 2 əsas spiral qolun loqarifmik burulması
      const spiralPhase = angle * 2 + Math.log(dist + 0.04) * 5.4;
      const armWave = 0.5 + 0.5 * Math.cos(spiralPhase);

      // FBM küyü ilə təbii bulud strukturu
      const n1 = fbm(px * 0.045, py * 0.045, 4);
      const n2 = fbm(px * 0.11 + 12.3, py * 0.11 + 7.1, 3);

      // Tünd toz zolağı (Dark dust lane qolun daxili kənarında)
      const dustWave = Math.pow(Math.max(0, Math.cos(spiralPhase - 0.55)), 3);
      const dustMask = 1 - dustWave * n2 * 0.72 * Math.min(1, dist * 3.5);

      // Mərkəzi qızılı nüvə intensivliyi (Galactic Bulge)
      const bulge = Math.exp(-dist * dist * 16);
      // Disk və spiral qol intensivliyi
      const disk = Math.exp(-dist * 2.6) * (0.28 + 0.72 * Math.pow(armWave, 1.8) * (0.4 + 0.8 * n1));

      const totalLight = (bulge * 1.4 + disk) * dustMask * (1 - dist);

      // Realistik rəng qarışımı:
      // Nüvədə isti ağ-qızılı (255, 232, 185), qollarda mavi-bənövşəyi (110, 145, 255) və çəhrayı H-II (215, 95, 195)
      const h2Region = Math.max(0, n2 - 0.56) * 2.4 * armWave * (1 - bulge);

      let r = bulge * 255 + disk * (115 + h2Region * 140) * dustMask;
      let g = bulge * 228 + disk * (135 + n1 * 45) * dustMask;
      let b = bulge * 175 + disk * (235 + n1 * 30) * dustMask;
      let a = Math.min(255, totalLight * 215);

      const idx = (py * res + px) * 4;
      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = Math.max(0, a);
    }
  }
  oCtx.putImageData(imgData, 0, 0);

  gCtx.clearRect(0, 0, galaxySize, galaxySize);
  gCtx.imageSmoothingEnabled = true;
  gCtx.imageSmoothingQuality = "high";
  gCtx.drawImage(off, 0, 0, galaxySize, galaxySize);

  // B. Realistik Ulduz Spektrinə (O, B, A, G, K, M) uyğun 8,500 ulduz zərrəciyi
  gCtx.save();
  gCtx.globalCompositeOperation = "lighter";

  const spectralColors = [
    "175, 210, 255", // O/B tipi: Mavi-ağ gənc ulduzlar
    "225, 240, 255", // A tipi: Parlaq ağ
    "255, 248, 225", // F/G tipi: Günəş sarısı
    "255, 210, 155", // K tipi: Narıncı nəhənglər
    "245, 175, 235", // Ionlaşmış ulduz topaları
  ];

  const totalStars = 8500;
  for (let i = 0; i < totalStars; i++) {
    const t = Math.pow(Math.random(), 1.55);
    const radius = 6 + t * (half * 0.9);
    const armOffset = (i % 2) * Math.PI;
    const spiralTwist = Math.log(t + 0.04) * 5.4;
    const scatter = (Math.random() - 0.5) * (0.55 + t * 1.35);
    const angle = armOffset + spiralTwist + scatter;

    const x = half + Math.cos(angle) * radius;
    const y = half + Math.sin(angle) * radius;

    const isBrightCluster = Math.random() < 0.035;
    const size = isBrightCluster ? Math.random() * 1.7 + 0.9 : Math.random() * 0.9 + 0.2;
    const alpha = (1 - t * 0.6) * (isBrightCluster ? 0.85 : Math.random() * 0.55 + 0.12);

    const color = t < 0.22 ? "255, 244, 214" : spectralColors[Math.floor(Math.random() * spectralColors.length)];
    gCtx.fillStyle = `rgba(${color}, ${alpha})`;
    gCtx.fillRect(x, y, size, size);
  }

  // C. Parlaq Qalaktika Nüvəsi (Core Glow)
  const core = gCtx.createRadialGradient(half, half, 0, half, half, half * 0.22);
  core.addColorStop(0, "rgba(255, 255, 255, 0.98)");
  core.addColorStop(0.14, "rgba(255, 242, 204, 0.78)");
  core.addColorStop(0.4, "rgba(251, 191, 36, 0.25)");
  core.addColorStop(1, "rgba(0, 0, 0, 0)");
  gCtx.fillStyle = core;
  gCtx.beginPath();
  gCtx.arc(half, half, half * 0.22, 0, Math.PI * 2);
  gCtx.fill();

  gCtx.restore();
}
buildPhotorealisticGalaxy();

// --- 2. PROSEDURAL REAL SƏTHLİ PLANET GENERATORU (Offscreen 3D Sphere) ---
function createPlanetTexture(radius, palette, isGasGiant) {
  const pad = radius * 2.8;
  const size = Math.ceil(pad * 2);
  const pCanvas = document.createElement("canvas");
  pCanvas.width = size;
  pCanvas.height = size;
  const pCtx = pCanvas.getContext("2d");
  const img = pCtx.createImageData(size, size);
  const d = img.data;

  // İşıq mənbəyi vektoru (yuxarı-sol öndən gələn günəş işığı)
  const lx = -0.58;
  const ly = -0.52;
  const lz = 0.62;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const nx = (px - pad) / radius;
      const ny = (py - pad) / radius;
      const r2 = nx * nx + ny * ny;

      if (r2 > 1.0) continue;

      const nz = Math.sqrt(1 - r2);
      // Sferik koordinatlar üzərində səth və bulud küyü
      const lat = ny * 4.5 + fbm(nx * 2.2, ny * 2.2, 3) * (isGasGiant ? 0.65 : 1.8);
      const band = isGasGiant
        ? 0.5 + 0.5 * Math.sin(lat * 4.2 + fbm(nx * 5, ny * 5, 3) * 2.5)
        : fbm(nx * 3.4 + 4.1, ny * 3.4 + 1.9, 4);

      // Lambertian işıqlanma + atmosfer yumşalması (Terminator xətti)
      const dot = nx * lx + ny * ly + nz * lz;
      const light = Math.max(0.03, Math.min(1, dot * 1.15 + 0.14));

      // Fresnel kənar atmosfer parıltısı (Rim light)
      const fresnel = Math.pow(1 - nz, 3.2) * Math.max(0, dot + 0.35);

      const r = (palette.base[0] * (0.65 + 0.45 * band) * light + palette.atmo[0] * fresnel * 140);
      const g = (palette.base[1] * (0.65 + 0.45 * band) * light + palette.atmo[1] * fresnel * 140);
      const b = (palette.base[2] * (0.65 + 0.45 * band) * light + palette.atmo[2] * fresnel * 140);

      // Kənar anti-aliasing
      const edgeAlpha = r2 > 0.96 ? (1 - r2) / 0.04 : 1;

      const idx = (py * size + px) * 4;
      d[idx] = Math.min(255, r);
      d[idx + 1] = Math.min(255, g);
      d[idx + 2] = Math.min(255, b);
      d[idx + 3] = Math.min(255, edgeAlpha * 255);
    }
  }

  pCtx.putImageData(img, 0, 0);
  return { canvas: pCanvas, center: pad };
}

const planetData = [
  {
    baseX: 0.85,
    baseY: 0.25,
    radius: vw < 640 ? 32 : 52,
    orbitSpeedY: 0.15,
    orbitRadiusX: 34,
    orbitFreq: 0.001,
    hasRing: true,
    ringAngle: -0.35,
    atmoGlow: "rgba(196, 181, 253, 0.24)",
    tex: createPlanetTexture(
      vw < 640 ? 32 : 52,
      { base: [215, 195, 245], atmo: [0.75, 0.65, 1.0] },
      true
    ),
  },
  {
    baseX: 0.11,
    baseY: 0.68,
    radius: vw < 640 ? 22 : 36,
    orbitSpeedY: 0.22,
    orbitRadiusX: 26,
    orbitFreq: 0.0014,
    hasRing: false,
    ringAngle: 0,
    atmoGlow: "rgba(56, 189, 248, 0.26)",
    tex: createPlanetTexture(
      vw < 640 ? 22 : 36,
      { base: [85, 175, 245], atmo: [0.3, 0.8, 1.0] },
      false
    ),
  },
  {
    baseX: 0.88,
    baseY: 0.89,
    radius: vw < 640 ? 14 : 21,
    orbitSpeedY: 0.29,
    orbitRadiusX: 18,
    orbitFreq: 0.0018,
    hasRing: false,
    ringAngle: 0,
    atmoGlow: "rgba(251, 146, 60, 0.2)",
    tex: createPlanetTexture(
      vw < 640 ? 14 : 21,
      { base: [225, 125, 85], atmo: [1.0, 0.55, 0.25] },
      false
    ),
  },
];

function drawBandedPlanet(p, time) {
  const px =
    vw * p.baseX +
    Math.sin(smoothScrollY * p.orbitFreq + time * 0.0003) * p.orbitRadiusX +
    (pointer.smoothX - vw * 0.5) * -0.022;

  let py = vh * p.baseY - smoothScrollY * p.orbitSpeedY;
  const wrapH = vh + p.radius * 5;
  py = (((py + p.radius * 2.5) % wrapH) + wrapH) % wrapH - p.radius * 2.5;

  ctx.save();
  ctx.translate(px, py);

  // Xarici atmosfer halosu
  const halo = ctx.createRadialGradient(0, 0, p.radius * 0.85, 0, 0, p.radius * 1.75);
  halo.addColorStop(0, p.atmoGlow);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, p.radius * 1.75, 0, Math.PI * 2);
  ctx.fill();

  // Arxa halqa (Cassini Division boşluğu ilə)
  if (p.hasRing) {
    ctx.save();
    ctx.rotate(p.ringAngle + smoothScrollY * 0.00025);
    // Daxili C-halqası
    ctx.strokeStyle = "rgba(196, 181, 253, 0.16)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 1.55, p.radius * 0.36, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    // Əsas B-halqası
    ctx.strokeStyle = "rgba(237, 233, 254, 0.34)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 1.98, p.radius * 0.46, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    // Cassini boşluğundan sonrakı A-halqası
    ctx.strokeStyle = "rgba(216, 180, 254, 0.24)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 2.38, p.radius * 0.56, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 3D Sferik Planet Teksturası
  ctx.drawImage(p.tex.canvas, -p.tex.center, -p.tex.center);

  // Ön halqa
  if (p.hasRing) {
    ctx.save();
    ctx.rotate(p.ringAngle + smoothScrollY * 0.00025);
    ctx.strokeStyle = "rgba(196, 181, 253, 0.22)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 1.55, p.radius * 0.36, 0, 0, Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(245, 243, 255, 0.52)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 1.98, p.radius * 0.46, 0, 0, Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(216, 180, 254, 0.35)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 2.38, p.radius * 0.56, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// --- 3. DƏRİN KOSMOS ULDUZLARI VƏ AXAN ULDUZLAR (METEORİTLƏR) ---
const deepStarCount = vw < 640 ? 180 : 380;
const deepStars = Array.from({ length: deepStarCount }, () => {
  const starSpectra = ["255, 255, 255", "195, 225, 255", "255, 242, 204", "255, 215, 175"];
  return {
    x: Math.random() * vw,
    y: Math.random() * vh,
    size: Math.random() < 0.07 ? Math.random() * 1.5 + 0.9 : Math.random() * 1.05 + 0.2,
    depth: Math.random() * 0.55 + 0.06,
    twinkleSpeed: Math.random() * 0.02 + 0.006,
    phase: Math.random() * Math.PI * 2,
    color: starSpectra[Math.floor(Math.random() * starSpectra.length)],
    hasSpike: Math.random() < 0.035,
  };
});

const meteors = [];
function spawnMeteor() {
  if (meteors.length < 2 && Math.random() < 0.008) {
    meteors.push({
      x: Math.random() * vw * 1.1,
      y: Math.random() * vh * 0.4,
      vx: -(6 + Math.random() * 6),
      vy: 3 + Math.random() * 4,
      len: 70 + Math.random() * 80,
      alpha: 0.9,
    });
  }
}

let galaxySpin = 0;

function animate(time) {
  updateSmoothScroll();
  updateAstronaut();

  ctx.clearRect(0, 0, vw, vh);

  if (pointer.x !== null && pointer.y !== null) {
    pointer.smoothX += (pointer.x - pointer.smoothX) * 0.04;
    pointer.smoothY += (pointer.y - pointer.smoothY) * 0.04;
  } else {
    pointer.smoothX += (vw * 0.5 - pointer.smoothX) * 0.02;
    pointer.smoothY += (vh * 0.5 - pointer.smoothY) * 0.02;
  }

  // 1. Dərin kosmos ulduzları və JWST difraksiya şüaları
  for (const star of deepStars) {
    star.y -= scrollVelocity * star.depth * 0.38;
    if (star.y < 0) star.y += vh;
    if (star.y > vh) star.y -= vh;

    const twinkle = 0.58 + 0.42 * Math.sin(time * 0.002 * star.twinkleSpeed * 50 + star.phase);
    ctx.fillStyle = `rgba(${star.color}, ${twinkle * 0.88})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();

    if (star.hasSpike) {
      ctx.strokeStyle = `rgba(${star.color}, ${twinkle * 0.35})`;
      ctx.lineWidth = 0.65;
      const len = star.size * 5;
      ctx.beginPath();
      ctx.moveTo(star.x - len, star.y);
      ctx.lineTo(star.x + len, star.y);
      ctx.moveTo(star.x, star.y - len);
      ctx.lineTo(star.x, star.y + len);
      ctx.stroke();
    }
  }

  // 2. Fotorealistik FBM Qalaktika (3D Perspektiv Əyilmə + Yavaş Fırlanma)
  const gx = vw * 0.5 + (pointer.smoothX - vw * 0.5) * -0.022;
  const gy = vh * 0.48 + (pointer.smoothY - vh * 0.5) * -0.022 - smoothScrollY * 0.11;
  const scaleFactor = Math.max(vw, vh) / 820;

  galaxySpin += 0.00028 + scrollVelocity * 0.0003;

  ctx.save();
  ctx.translate(gx, gy);
  ctx.rotate(-0.4 + Math.sin(smoothScrollY * 0.00035) * 0.045);
  ctx.scale(scaleFactor, scaleFactor * 0.52);
  ctx.rotate(galaxySpin);
  ctx.drawImage(galaxyCanvas, -galaxySize / 2, -galaxySize / 2);
  ctx.restore();

  // 3. Təbii Axan Ulduzlar (Meteoritlər)
  spawnMeteor();
  for (let m = meteors.length - 1; m >= 0; m--) {
    const met = meteors[m];
    met.x += met.vx;
    met.y += met.vy;
    met.alpha *= 0.975;

    const tailX = met.x - met.vx * (met.len / 10);
    const tailY = met.y - met.vy * (met.len / 10);
    const grad = ctx.createLinearGradient(met.x, met.y, tailX, tailY);
    grad.addColorStop(0, `rgba(255, 255, 255, ${met.alpha})`);
    grad.addColorStop(0.3, `rgba(186, 230, 253, ${met.alpha * 0.5})`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(met.x, met.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    if (met.alpha < 0.03 || met.x < -150 || met.y > vh + 150) {
      meteors.splice(m, 1);
    }
  }

  // 4. Klik şok dalğaları
  for (let s = shockwaves.length - 1; s >= 0; s--) {
    const sw = shockwaves[s];
    sw.radius += 5.5;
    sw.alpha *= 0.95;

    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(253, 230, 138, ${sw.alpha})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (sw.radius > sw.maxRadius || sw.alpha < 0.01) {
      shockwaves.splice(s, 1);
    }
  }

  // 5. Atmosferli və Səth Teksturalı Planetlər
  for (const planet of planetData) {
    drawBandedPlanet(planet, time);
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
