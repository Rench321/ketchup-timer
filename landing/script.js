/* ── Platform detection & primary download button ──────────────────── */
const primaryDownload = document.querySelector("[data-primary-download]");
const downloadStatus  = document.querySelector("#download-status");

const directDownloads = {
  windows: {
    href:   "https://github.com/Rench321/ketchup-timer/releases/latest/download/Ketchup-Windows-x64-setup.exe",
    label:  "Download for Windows",
    status: "Windows download highlighted. Other platforms remain available below.",
  },
  linux: {
    href:   "https://github.com/Rench321/ketchup-timer/releases/latest/download/Ketchup-Linux-x64.AppImage",
    label:  "Download for Linux",
    status: "Linux download highlighted. Other platforms remain available below.",
  },
  mac: {
    href:   "#download",
    label:  "Choose macOS Download",
    status: "Choose Apple Silicon or Intel for macOS. Other platforms remain available below.",
  },
};

const releaseApiUrl = "https://api.github.com/repos/Rench321/ketchup-timer/releases/latest";
const assetMatchers = {
  windows:  [/Ketchup-Windows-x64-setup\.exe$/i,         /Ketchup_.*_x64-setup\.exe$/i],
  windowsMsi:[/Ketchup-Windows-x64\.msi$/i,              /Ketchup_.*_x64.*\.msi$/i],
  macApple: [/Ketchup-macOS-Apple-Silicon\.dmg$/i,       /Ketchup_.*_(aarch64|arm64)\.dmg$/i],
  macIntel: [/Ketchup-macOS-Intel\.dmg$/i,               /Ketchup_.*_(x64|x86_64)\.dmg$/i],
  linux:    [/Ketchup-Linux-x64\.AppImage$/i,            /Ketchup_.*_(amd64|x86_64)\.AppImage$/i],
  linuxDeb: [/Ketchup-Linux-x64\.deb$/i,                 /Ketchup_.*_(amd64|x86_64)\.deb$/i],
  linuxRpm: [/Ketchup-Linux-x64\.rpm$/i,                 /Ketchup[-_].*(x86_64|amd64).*\.rpm$/i],
};
const platformDownloadKey = { windows: "windows", linux: "linux" };

const platformName       = navigator.userAgentData?.platform || navigator.platform || "";
const normalizedPlatform = platformName.toLowerCase();
const detectedPlatform   = normalizedPlatform.includes("win")
  ? "windows"
  : normalizedPlatform.includes("linux")
    ? "linux"
    : normalizedPlatform.includes("mac")
      ? "mac"
      : "";

if (detectedPlatform) {
  const download      = directDownloads[detectedPlatform];
  const primaryLabel  = primaryDownload?.querySelector("span");
  const matchingCards = document.querySelectorAll(`[data-platform="${detectedPlatform}"]`);

  if (primaryDownload) primaryDownload.href = download.href;
  if (primaryLabel)    primaryLabel.textContent = download.label;
  matchingCards.forEach((card) => card.classList.add("download-link--preferred"));
  if (downloadStatus)  downloadStatus.textContent = download.status;
}

/* ── Release asset hydration ───────────────────────────────────────── */
const findAsset = (assets, patterns) =>
  assets.find((asset) => patterns.some((p) => p.test(asset.name)));

const hydrateReleaseDownloads = async () => {
  try {
    const response = await fetch(releaseApiUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return;

    const release = await response.json();
    const assets  = Array.isArray(release.assets) ? release.assets : [];
    let updatedLinks = 0;

    Object.entries(assetMatchers).forEach(([key, patterns]) => {
      const asset = findAsset(assets, patterns);
      const link  = document.querySelector(`[data-download-key="${key}"]`);
      if (!asset?.browser_download_url || !link) return;

      link.href = asset.browser_download_url;
      updatedLinks += 1;

      if (platformDownloadKey[detectedPlatform] === key && primaryDownload) {
        primaryDownload.href = asset.browser_download_url;
      }
    });

    if (updatedLinks > 0 && downloadStatus && !detectedPlatform) {
      downloadStatus.textContent = "Latest direct download links are ready.";
    }
  } catch {
    // Static fallback links still work after the release workflow publishes stable aliases.
  }
};

hydrateReleaseDownloads();

/* ── Live mechanic demo ────────────────────────────────────────────── */
const initMechanicDemo = () => {
  const workTrack   = document.getElementById("demo-work");
  const breakTrack  = document.getElementById("demo-break");
  const workFill    = document.getElementById("demo-work-fill");
  const breakFill   = document.getElementById("demo-break-fill");
  const workTime    = document.getElementById("demo-work-time");
  const breakTime   = document.getElementById("demo-break-time");
  const switchBtn   = document.getElementById("demo-switch");
  const switchLabel = document.getElementById("demo-switch-label");
  const rail        = document.getElementById("demo-rail");
  const thumb       = document.getElementById("demo-thumb");

  if (!switchBtn || !rail || !thumb) return;

  const WORK_TOTAL  = 25 * 60;  // 1500 s
  const BREAK_TOTAL = 5  * 60;  // 300  s
  const THUMB_SIZE  = 22;
  const THUMB_PAD   = 2;

  let workRemaining  = 18 * 60 + 4;  // 1084 s — mid-cycle start
  let breakRemaining = 2  * 60 + 47; // 167  s
  let phase = "work";

  /* ---- Thumb positioning ------------------------------------------ */
  const positionThumb = () => {
    const travel = rail.offsetWidth - THUMB_SIZE - THUMB_PAD;
    if (phase === "work") {
      thumb.style.transform = `translateY(-50%) translateX(${THUMB_PAD}px)`;
      thumb.style.background = "var(--tomato)";
      thumb.style.boxShadow  = "0 0 10px var(--tomato-glow)";
    } else {
      thumb.style.transform = `translateY(-50%) translateX(${Math.max(THUMB_PAD, travel)}px)`;
      thumb.style.background = "var(--leaf)";
      thumb.style.boxShadow  = "0 0 10px var(--leaf-glow)";
    }
  };

  /* ---- UI update --------------------------------------------------- */
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const updateUI = () => {
    workTime.textContent  = fmt(workRemaining);
    breakTime.textContent = fmt(breakRemaining);

    workFill.style.width  = `${(workRemaining  / WORK_TOTAL)  * 100}%`;
    breakFill.style.width = `${(breakRemaining / BREAK_TOTAL) * 100}%`;

    if (phase === "work") {
      workTrack.classList.add("is-active");
      breakTrack.classList.remove("is-active");
      switchLabel.textContent = "Switch to Break";
      switchBtn.setAttribute("aria-label", "Currently in work phase. Click to switch to break.");
    } else {
      breakTrack.classList.add("is-active");
      workTrack.classList.remove("is-active");
      switchLabel.textContent = "Switch to Work";
      switchBtn.setAttribute("aria-label", "Currently in break phase. Click to switch to work.");
    }

    positionThumb();
  };

  /* ---- Tick -------------------------------------------------------- */
  const tick = () => {
    if (phase === "work") {
      if (workRemaining > 0) {
        workRemaining--;
      } else if (breakRemaining > 0) {
        phase = "break";
      } else {
        workRemaining  = WORK_TOTAL;
        breakRemaining = BREAK_TOTAL;
        phase = "work";
      }
    } else {
      if (breakRemaining > 0) {
        breakRemaining--;
      } else if (workRemaining > 0) {
        phase = "work";
      } else {
        workRemaining  = WORK_TOTAL;
        breakRemaining = BREAK_TOTAL;
        phase = "work";
      }
    }
    updateUI();
  };

  /* ---- Auto-switch every 2 s --------------------------------------- */
  let autoSwitch;
  const scheduleAutoSwitch = () => {
    clearInterval(autoSwitch);
    autoSwitch = setInterval(() => {
      phase = phase === "work" ? "break" : "work";
      updateUI();
    }, 2000);
  };

  /* ---- Manual switch resets the 2 s timer -------------------------- */
  switchBtn.addEventListener("click", () => {
    phase = phase === "work" ? "break" : "work";
    updateUI();
    scheduleAutoSwitch();
  });

  /* ---- Keep thumb travel correct on resize ------------------------- */
  new ResizeObserver(positionThumb).observe(rail);

  /* ---- Kick off ----------------------------------------------------- */
  updateUI();
  setInterval(tick, 1000);
  scheduleAutoSwitch();
};

initMechanicDemo();

/* ── Scroll-reveal via IntersectionObserver ────────────────────────── */
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
}
