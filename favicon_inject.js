(() => {
  let originalIcons = null; // array of {rel, href, sizes, type}

  function snapshotOriginalIcons() {
    if (originalIcons !== null) return;
    const icons = Array.from(document.querySelectorAll('link[rel~="icon"]'));
    originalIcons = icons.map(link => ({
      rel: link.getAttribute("rel"),
      href: link.getAttribute("href"),
      sizes: link.getAttribute("sizes"),
      type: link.getAttribute("type")
    }));
  }

  function restoreOriginalIcons() {
    if (originalIcons === null) return;

    // Remove any icons we previously added
    document.querySelectorAll('link[data-more-tab-colors="1"]').forEach(n => n.remove());

    // If the page had no icons originally, also remove current icons we set
    // (but be careful not to destroy site-managed icons if they replaced them)
    // We'll only restore if we have a snapshot.
    const existing = Array.from(document.querySelectorAll('link[rel~="icon"]'));
    existing.forEach(link => link.remove());

    // Put back originals
    for (const icon of originalIcons) {
      const link = document.createElement("link");
      link.setAttribute("rel", icon.rel || "icon");
      if (icon.sizes) link.setAttribute("sizes", icon.sizes);
      if (icon.type) link.setAttribute("type", icon.type);
      if (icon.href) link.setAttribute("href", icon.href);
      document.head.appendChild(link);
    }
  }

  function makeColorFaviconDataUrl(color) {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");

    // Solid square
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 16, 16);

    // Optional: add a border to help visibility on dark/light themes
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.strokeRect(0.5, 0.5, 15, 15);

    return canvas.toDataURL("image/png");
  }

  function setFaviconToColor(color) {
    snapshotOriginalIcons();

    const dataUrl = makeColorFaviconDataUrl(color);

    // Remove our previous injected icon(s)
    document.querySelectorAll('link[data-more-tab-colors="1"]').forEach(n => n.remove());

    // Prefer to update existing favicon link if present, otherwise create one
    let link = document.querySelector('link[rel~="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "icon");
      document.head.appendChild(link);
    }

    link.setAttribute("href", dataUrl);
    link.setAttribute("type", "image/png");
    link.setAttribute("sizes", "16x16");
    link.setAttribute("data-more-tab-colors", "1");
  }

  // Receive messages from extension
  browser.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.type) return;

    if (msg.type === "setColorFavicon" && msg.color) {
      setFaviconToColor(msg.color);
    }

    if (msg.type === "resetColorFavicon") {
      restoreOriginalIcons();
    }
  });

  // On initial load, ask background if this tab has a saved color
  // Background can identify the tab via sender.tab.id.
  browser.runtime.sendMessage({ type: "getSavedTabColor" })
    .then((res) => {
      if (res && res.color) setFaviconToColor(res.color);
    })
    .catch(() => {
      // Ignore (restricted pages / no permission / race conditions)
    });
})();