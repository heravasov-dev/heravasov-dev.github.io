const GH_USER = "heravaso-dev";

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

// 4. Shadow-to-Clear Emerge Observer (Kölgədən aydınlığa çıxma)
const emergeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("emerged");
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
);

function bindEmergeElements() {
  document.querySelectorAll(".shadow-emerge").forEach((el) => emergeObserver.observe(el));
}
bindEmergeElements();

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
  if (!gridEl || !GH_USER || GH_USER === "heravaso-dev") {
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
        <div class="scroll-parallax" data-speed="${idx % 2 === 0 ? -0.03 : -0.06}">
          <article class="cosmic-panel p-7 h-full flex flex-col justify-between shadow-emerge" style="transition-delay: ${idx * 120}ms;">
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

    bindEmergeElements();
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
  // Aşağı əmsal (0.065) sürüşməyə ipək kimi yumşaq ətalət (inertia) verir
  smoothScrollY += (targetScrollY - smoothScrollY) * 0.065;
  const instantDelta = smoothScrollY - prev;
  scrollVelocity = scrollVelocity * 0.9 + instantDelta * 0.1;

  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pct = Math.min(100, Math.max(0, (smoothScrollY / maxScroll) * 100));

  if (scrollProgress) {
    scrollProgress.style.width = `${pct}%`;
  }

  if (hud) {
    hud.textContent = `SECTOR: ${Math.round(pct)}% | VEL: ${Math.abs(scrollVelocity).toFixed(1)}`;
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

// 8. Deep Space & Spiral Galaxy Canvas Engine
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
  shockwaves.push({ x: e.clientX, y: e.clientY, radius: 0, maxRadius: 320, alpha: 0.45 });
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

// Fon ulduzları (Dərin kosmos qatı)
const bgStarCount = vw < 640 ? 90 : 180;
const bgStars = Array.from({ length: bgStarCount }, () => ({
  x: Math.random() * vw,
  y: Math.random() * vh,
  size: Math.random() * 1.4 + 0.3,
  depth: Math.random() * 0.6 + 0.1,
  twinkleSpeed: Math.random() * 0.03 + 0.01,
  twinklePhase: Math.random() * Math.PI * 2,
  color: Math.random() > 0.3 ? "255, 255, 255" : "186, 230, 253",
}));

// Spiral Qalaktika ulduzları və kosmik toz zərrəcikləri
const galaxyCount = vw < 640 ? 180 : 340;
const arms = 3; // 3 qollu spiral qalaktika
const galaxyColors = [
  "192, 132, 252", // Bənövşəyi (Purple)
  "129, 140, 248", // İndiqo (Indigo)
  "56, 189, 248",  // Mavi (Cyan)
  "244, 114, 182", // Çəhrayı nebula (Pink)
  "255, 255, 255", // Parlaq ulduz ağı
];

const galaxyParticles = Array.from({ length: galaxyCount }, (_, i) => {
  const maxRadius = Math.max(vw, vh) * 0.62;
  const distRatio = Math.pow(Math.random(), 1.35); // Mərkəzdə daha sıx
  const radius = 35 + distRatio * maxRadius;
  const armAngle = ((i % arms) * (Math.PI * 2)) / arms;
  const spinAngle = distRatio * 4.2; // Spiral burulma dərəcəsi
  const scatter = (Math.random() - 0.5) * (0.45 + distRatio * 0.7);

  return {
    radius,
    baseAngle: armAngle + spinAngle + scatter,
    orbitalSpeed: (0.0004 + (1 - distRatio) * 0.0014), // Mərkəzə yaxın olanlar daha sürətli fırlanır (Kepler)
    size: Math.random() * 2.1 + 0.6,
    alpha: (1 - distRatio * 0.65) * (Math.random() * 0.6 + 0.3),
    color: galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
    zTilt: 0.58, // Qalaktikanın perspektiv əyilmə bucağı
  };
});

let galaxyRotation = 0;

function drawNebulaCore(cx, cy) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(vw, vh) * 0.45);
  grad.addColorStop(0, "rgba(192, 132, 252, 0.16)");
  grad.addColorStop(0.25, "rgba(99, 102, 241, 0.09)");
  grad.addColorStop(0.55, "rgba(14, 165, 233, 0.04)");
  grad.addColorStop(1, "rgba(3, 4, 8, 0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(vw, vh) * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

function animate(time) {
  updateSmoothScroll();

  ctx.clearRect(0, 0, vw, vh);

  // Kursorun yumşaq izlənməsi
  if (pointer.x !== null && pointer.y !== null) {
    pointer.smoothX += (pointer.x - pointer.smoothX) * 0.05;
    pointer.smoothY += (pointer.y - pointer.smoothY) * 0.05;
  } else {
    pointer.smoothX += (vw * 0.5 - pointer.smoothX) * 0.02;
    pointer.smoothY += (vh * 0.5 - pointer.smoothY) * 0.02;
  }

  // 1. Dərin kosmos ulduzları (Scroll ilə yavaş sürüşür)
  for (const star of bgStars) {
    star.y -= scrollVelocity * star.depth * 0.4;
    if (star.y < 0) star.y += vh;
    if (star.y > vh) star.y -= vh;

    const twinkle = 0.5 + 0.5 * Math.sin(time * 0.002 * star.twinkleSpeed * 50 + star.twinklePhase);
    ctx.fillStyle = `rgba(${star.color}, ${star.alpha || twinkle * 0.75})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Qalaktika mərkəzi: scroll etdikcə həm yuxarı-aşağı sürüşür, həm də fırlanır
  const parallaxShiftX = (pointer.smoothX - vw * 0.5) * -0.03;
  const parallaxShiftY = (pointer.smoothY - vh * 0.5) * -0.03 - smoothScrollY * 0.14;
  const cx = vw * 0.52 + parallaxShiftX;
  const cy = vh * 0.48 + parallaxShiftY;

  // Dumanlıq nüvəsi (Nebula Core)
  drawNebulaCore(cx, cy);

  // Scroll sürəti qalaktikanın fırlanmasına təkan verir
  galaxyRotation += 0.0006 + scrollVelocity * 0.00045;

  // 2. Kosmik şok dalğaları (Kliklədikdə)
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

  // 3. Spiral Qalaktika ulduzları və toz buludu
  const tiltAngle = -0.28 + Math.sin(smoothScrollY * 0.0005) * 0.08;
  const cosT = Math.cos(tiltAngle);
  const sinT = Math.sin(tiltAngle);

  for (const p of galaxyParticles) {
    p.baseAngle += p.orbitalSpeed;
    const totalAngle = p.baseAngle + galaxyRotation;

    // Elliptik orbital koordinatlar
    const rawX = Math.cos(totalAngle) * p.radius;
    const rawY = Math.sin(totalAngle) * p.radius * p.zTilt;

    // Qalaktika oxunun əyilməsi
    let px = cx + (rawX * cosT - rawY * sinT);
    let py = cy + (rawX * sinT + rawY * cosT);

    // Kursor cazibə / əyilmə effekti (Gravitational lensing)
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

    // Şok dalğası təsiri
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

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
