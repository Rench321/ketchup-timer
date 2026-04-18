const hero = document.querySelector(".hero");
const media = document.querySelector(".hero__media");
const primaryDownload = document.querySelector("[data-primary-download]");
const downloadStatus = document.querySelector("#download-status");

const directDownloads = {
  windows: {
    href: "https://github.com/Rench321/ketchup-timer/releases/latest/download/Ketchup-Windows-x64-setup.exe",
    label: "Download for Windows",
    status: "Windows download highlighted. Other platforms remain available below.",
  },
  linux: {
    href: "https://github.com/Rench321/ketchup-timer/releases/latest/download/Ketchup-Linux-x64.AppImage",
    label: "Download for Linux",
    status: "Linux download highlighted. Other platforms remain available below.",
  },
  mac: {
    href: "#download",
    label: "Choose macOS Download",
    status: "Choose Apple Silicon or Intel for macOS. Other platforms remain available below.",
  },
};

const releaseApiUrl = "https://api.github.com/repos/Rench321/ketchup-timer/releases/latest";
const assetMatchers = {
  windows: [/Ketchup-Windows-x64-setup\.exe$/i, /Ketchup_.*_x64-setup\.exe$/i],
  windowsMsi: [/Ketchup-Windows-x64\.msi$/i, /Ketchup_.*_x64.*\.msi$/i],
  macApple: [/Ketchup-macOS-Apple-Silicon\.dmg$/i, /Ketchup_.*_(aarch64|arm64)\.dmg$/i],
  macIntel: [/Ketchup-macOS-Intel\.dmg$/i, /Ketchup_.*_(x64|x86_64)\.dmg$/i],
  linux: [/Ketchup-Linux-x64\.AppImage$/i, /Ketchup_.*_(amd64|x86_64)\.AppImage$/i],
  linuxDeb: [/Ketchup-Linux-x64\.deb$/i, /Ketchup_.*_(amd64|x86_64)\.deb$/i],
  linuxRpm: [/Ketchup-Linux-x64\.rpm$/i, /Ketchup[-_].*(x86_64|amd64).*\.rpm$/i],
};
const platformDownloadKey = {
  windows: "windows",
  linux: "linux",
};

const platformName = navigator.userAgentData?.platform || navigator.platform || "";
const normalizedPlatform = platformName.toLowerCase();
const detectedPlatform = normalizedPlatform.includes("win")
  ? "windows"
  : normalizedPlatform.includes("linux")
    ? "linux"
    : normalizedPlatform.includes("mac")
      ? "mac"
      : "";

if (detectedPlatform) {
  const download = directDownloads[detectedPlatform];
  const primaryLabel = primaryDownload?.querySelector("span");
  const matchingCards = document.querySelectorAll(`[data-platform="${detectedPlatform}"]`);

  if (primaryDownload) {
    primaryDownload.href = download.href;
  }

  if (primaryLabel) {
    primaryLabel.textContent = download.label;
  }

  matchingCards.forEach((card) => card.classList.add("download-link--preferred"));

  if (downloadStatus) {
    downloadStatus.textContent = download.status;
  }
}

const findAsset = (assets, patterns) =>
  assets.find((asset) => patterns.some((pattern) => pattern.test(asset.name)));

const hydrateReleaseDownloads = async () => {
  try {
    const response = await fetch(releaseApiUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!response.ok) {
      return;
    }

    const release = await response.json();
    const assets = Array.isArray(release.assets) ? release.assets : [];
    let updatedLinks = 0;

    Object.entries(assetMatchers).forEach(([key, patterns]) => {
      const asset = findAsset(assets, patterns);
      const link = document.querySelector(`[data-download-key="${key}"]`);

      if (!asset?.browser_download_url || !link) {
        return;
      }

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

if (hero && media && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let bounds;

  const refreshBounds = () => {
    bounds = hero.getBoundingClientRect();
  };

  hero.addEventListener("pointerenter", refreshBounds, { passive: true });

  hero.addEventListener("pointermove", (event) => {
    if (!bounds) {
      refreshBounds();
    }

    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    media.style.setProperty("--tilt-x", `${x * 12}px`);
    media.style.setProperty("--tilt-y", `${y * 12}px`);
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    bounds = undefined;
    media.style.removeProperty("--tilt-x");
    media.style.removeProperty("--tilt-y");
  }, { passive: true });

  window.addEventListener("resize", () => {
    bounds = undefined;
  }, { passive: true });
}
