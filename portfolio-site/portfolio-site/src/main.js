const GH_USER = "yourusername";

// 1. Year & Toast Notification
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

// 4. Planetary Orbit Rise Observer (Aşağıdan planet kimi yavaşca yüklənərək orbitə çıxma)
const orbitObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Sürüşən kimi dərhal deyil, kiçik bir orbital gecikmə ilə yüklənərək çıxır
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
              <div class="flex justify-between items-center font-mono text-xs text-zinc-400 mb-3">
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
    hud.textContent = `ORBIT: ${Math.round(pct)}% | VEL: ${Math.abs(scrollVelocity).toFixed(1)}`;
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

// 8. Zero-Gravity Astronaut Mouse Follower (Kursoru izləyən kosmonavt)
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
  // Kursorun bir az sağ-yuxarısında süzülür ki, oxumağa mane olmasın
  astroState.targetX = e.clientX + 26;
  astroState.targetY = e.clientY - 38;
});

function updateAstronaut() {
  if (!astroEl) return;

  // Yaylı çəkisizlik fizikası (Spring zero-gravity inertia)
  const ax = (astroState.targetX - astroState.x) * 0.032;
  const ay = (astroState.targetY - astroState.y) * 0.032;

  astroState.vx = (astroState.vx + ax) * 0.86;
  astroState.vy = (astroState.vy + ay) * 0.86;

  astroState.x += astroState.vx;
  astroState.y += astroState.vy;

  // Hərəkət istiqamətinə uyğun bədənin əyilməsi (banking)
  const tiltAngle = Math.max(-28, Math.min(28, astroState.vx * 2.4));
  astroEl.style.transform = `translate3d(${astroState.x.toFixed(1)}px, ${astroState.y.toFixed(1)}px, 0)`;
  if (astroTilt) {
    astroTilt.style.transform = `rotate(${tiltAngle.toFixed(1)}deg)`;
  }
}

// 9. Deep Space, Spiral Galaxy & Ringed Planets Canvas Engine
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
  shockwaves.push({ x: e.clientX, y: e.clientY, radius: 0, maxRadius: 340, alpha: 0.45 });
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

// Fon ulduzları
const bgStarCount = vw < 640 ? 100 : 210;
const bgStars = Array.from({ length: bgStarCount }, () => ({
  x: Math.random() * vw,
  y: Math.random() * vh,
  size: Math.random() * 1.5 + 0.3,
  depth: Math.random() * 0.65 + 0.1,
  twinkleSpeed: Math.random() * 0.03 + 0.01,
  twinklePhase: Math.random() * Math.PI * 2,
  color: Math.random() > 0.35 ? "255, 255, 255" : "186, 230, 253",
}));

// Scroll ilə orbitdə hərəkət edən planetlər
const planets = [
  {
    baseX: 0.84,
    baseY: 0.24,
    radius: vw < 640 ? 28 : 46,
    orbitSpeedY: 0.16,
    orbitRadiusX: 35,
    orbitFreq: 0.0012,
    c1: "#a855f7",
    c2: "#1e1b4b",
    glow: "rgba(168, 85, 247, 0.28)",
    hasRing: true,
    ringAngle: -0.38,
  },
  {
    baseX: 0.13,
    baseY: 0.68,
    radius: vw < 640 ? 20 : 32,
    orbitSpeedY: 0.24,
    orbitRadiusX: 28,
    orbitFreq: 0.0016,
    c1: "#38bdf8",
    c2: "#0c4a6e",
    glow: "rgba(56, 189, 248, 0.24)",
    hasRing: false,
    ringAngle: 0,
  },
  {
    baseX: 0.88,
    baseY: 0.86,
    radius: vw < 640 ? 12 : 18,
    orbitSpeedY: 0.32,
    orbitRadiusX: 20,
    orbitFreq: 0.002,
    c1: "#f472b6",
    c2: "#4c0519",
    glow: "rgba(244, 114, 182, 0.22)",
    hasRing: false,
    ringAngle: 0,
  },
];

// 3 Qollu Spiral Qalaktika ulduzları
const galaxyCount = vw < 640 ? 190 : 360;
const arms = 3;
const galaxyColors = [
  "192, 132, 252",
  "129, 140, 248",
  "56, 189, 248",
  "244, 114, 182",
  "255, 255, 255",
];

const galaxyParticles = Array.from({ length: galaxyCount }, (_, i) => {
  const maxRadius = Math.max(vw, vh) * 0.64;
  const distRatio = Math.pow(Math.random(), 1.35);
  const radius = 32 + distRatio * maxRadius;
  const armAngle = ((i % arms) * (Math.PI * 2)) / arms;
  const spinAngle = distRatio * 4.4;
  const scatter = (Math.random() - 0.5) * (0.45 + distRatio * 0.7);

  return {
    radius,
    baseAngle: armAngle + spinAngle + scatter,
    orbitalSpeed: 0.00045 + (1 - distRatio) * 0.0014,
    size: Math.random() * 2.1 + 0.6,
    alpha: (1 - distRatio * 0.62) * (Math.random() * 0.6 + 0.35),
    color: galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
    zTilt: 0.56,
  };
});

let galaxyRotation = 0;

function drawNebulaCore(cx, cy) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(vw, vh) * 0.46);
  grad.addColorStop(0, "rgba(192, 132, 252, 0.18)");
  grad.addColorStop(0.28, "rgba(99, 102, 241, 0.1)");
  grad.addColorStop(0.58, "rgba(14, 165, 233, 0.045)");
  grad.addColorStop(1, "rgba(2, 3, 6, 0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(vw, vh) * 0.46, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlanet(p, time) {
  // Scroll mövqeyinə əsasən orbital yerdəyişmə
  const px =
    vw * p.baseX +
    Math.sin(smoothScrollY * p.orbitFreq + time * 0.0004) * p.orbitRadiusX +
    (pointer.smoothX - vw * 0.5) * -0.02;

  let py = vw * 0 + vh * p.baseY - smoothScrollY * p.orbitSpeedY;
  // Ekranın yuxarısından çıxarsa aşağıdan yenidən orbitə daxil olur
  const wrapH = vh + p.radius * 4;
  py = (((py + p.radius * 2) % wrapH) + wrapH) % wrapH - p.radius * 2;

  ctx.save();
  ctx.translate(px, py);

  // Atmosfer parıltısı
  const atmo = ctx.createRadialGradient(0, 0, p.radius * 0.7, 0, 0, p.radius * 1.9);
  atmo.addColorStop(0, p.glow);
  atmo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = atmo;
  ctx.beginPath();
  ctx.arc(0, 0, p.radius * 1.9, 0, Math.PI * 2);
  ctx.fill();

  // Arxa halqa yarısı (Saturn kimi)
  if (p.hasRing) {
    ctx.save();
    ctx.rotate(p.ringAngle + smoothScrollY * 0.0003);
    ctx.strokeStyle = "rgba(216, 180, 254, 0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 2.15, p.radius * 0.55, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Planet kürəsi (3D kölgəli gradient)
  const sphere = ctx.createRadialGradient(
    -p.radius * 0.35,
    -p.radius * 0.35,
    p.radius * 0.1,
    0,
    0,
    p.radius
  );
  sphere.addColorStop(0, p.c1);
  sphere.addColorStop(1, p.c2);

  ctx.fillStyle = sphere;
  ctx.beginPath();
  ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
  ctx.fill();

  // Ön halqa yarısı
  if (p.hasRing) {
    ctx.save();
    ctx.rotate(p.ringAngle + smoothScrollY * 0.0003);
    ctx.strokeStyle = "rgba(233, 213, 255, 0.55)";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 2.15, p.radius * 0.55, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function animate(time) {
  updateSmoothScroll();
  updateAstronaut();

  ctx.clearRect(0, 0, vw, vh);

  if (pointer.x !== null && pointer.y !== null) {
    pointer.smoothX += (pointer.x - pointer.smoothX) * 0.05;
    pointer.smoothY += (pointer.y - pointer.smoothY) * 0.05;
  } else {
    pointer.smoothX += (vw * 0.5 - pointer.smoothX) * 0.02;
    pointer.smoothY += (vh * 0.5 - pointer.smoothY) * 0.02;
  }

  // 1. Dərin kosmos ulduzları
  for (const star of bgStars) {
    star.y -= scrollVelocity * star.depth * 0.42;
    if (star.y < 0) star.y += vh;
    if (star.y > vh) star.y -= vh;

    const twinkle = 0.45 + 0.55 * Math.sin(time * 0.002 * star.twinkleSpeed * 50 + star.twinklePhase);
    ctx.fillStyle = `rgba(${star.color}, ${twinkle * 0.8})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Qalaktika mərkəzi və Nebula
  const parallaxShiftX = (pointer.smoothX - vw * 0.5) * -0.03;
  const parallaxShiftY = (pointer.smoothY - vh * 0.5) * -0.03 - smoothScrollY * 0.14;
  const cx = vw * 0.5 + parallaxShiftX;
  const cy = vh * 0.48 + parallaxShiftY;

  drawNebulaCore(cx, cy);

  galaxyRotation += 0.00065 + scrollVelocity * 0.0005;

  // 3. Klik şok dalğaları
  for (let s = shockwaves.length - 1; s >= 0; s--) {
    const sw = shockwaves[s];
    sw.radius += 5.5;
    sw.alpha *= 0.95;

    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(192, 132, 252, ${sw.alpha})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (sw.radius > sw.maxRadius || sw.alpha < 0.01) {
      shockwaves.splice(s, 1);
    }
  }

  // 4. Spiral Qalaktika ulduzları
  const tiltAngle = -0.28 + Math.sin(smoothScrollY * 0.0005) * 0.08;
  const cosT = Math.cos(tiltAngle);
  const sinT = Math.sin(tiltAngle);

  for (const p of galaxyParticles) {
    p.baseAngle += p.orbitalSpeed;
    const totalAngle = p.baseAngle + galaxyRotation;

    const rawX = Math.cos(totalAngle) * p.radius;
    const rawY = Math.sin(totalAngle) * p.radius * p.zTilt;

    let px = cx + (rawX * cosT - rawY * sinT);
    let py = cy + (rawX * sinT + rawY * cosT);

    if (pointer.x !== null && pointer.y !== null) {
      const dx = px - pointer.x;
      const dy = py - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 160 && dist > 0) {
        const force = (160 - dist) / 160;
        px += (dx / dist) * force * 18;
        py += (dy / dist) * force * 18;
      }
    }

    for (const sw of shockwaves) {
      const dx = px - sw.x;
      const dy = py - sw.y;
      const dist = Math.hypot(dx, dy);
      if (Math.abs(dist - sw.radius) < 35 && dist > 0) {
        px += (dx / dist) * 14;
        py += (dy / dist) * 14;
      }
    }

    ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Orbitdə fırlanan və scroll ilə hərəkət edən planetlər
  for (const planet of planets) {
    drawPlanet(planet, time);
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
