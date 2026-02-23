browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  const key = "tab_" + tabId; 

  //check if this specific tab has a saved color
  const result = await browser.storage.local.get(key);
  const savedColor = result[key];

  //apply the color (or reset if none exists)
  if (savedColor) {
    updateWindowTheme(activeInfo.windowId, savedColor);
    //also ensure if favicon is applied
    try {
      await browser.tabs.sendMessage(tabId, { type: "setColorFavicon", color: savedColor });
    } catch (e) {}
  } else {
    browser.theme.reset(activeInfo.windowId);
    try {
      await browser.tabs.sendMessage(tabId, { type: "resetColorFavicon" });
    } catch (e) {}
  }
});

function updateWindowTheme(windowId, color) {
  browser.theme.update(windowId, {
    colors: {
      frame: color,
      tab_background_text: "#000",
      toolbar: color,
    }
  });
}

// clean memory when a tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
  browser.storage.local.remove("tab_" + tabId);
});

//for content script to retrieve saved tab color from background
browser.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg && msg.type === "getSavedTabColor" && sender && sender.tab) {
    const tabId = sender.tab.id;
    const key = "tab_" + tabId;
    const result = await browser.storage.local.get(key);
    return { color: result[key] || null };
  }
});

//reapply favicon after navigation/reload, because sites often overwrite it
browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status !== "complete") return;
  const key = "tab_" + tabId;
  const result = await browser.storage.local.get(key);
  const savedColor = result[key];

  if (savedColor) {
    try {
      await browser.tabs.sendMessage(tabId, { type: "setColorFavicon", color: savedColor });
    } catch (e) {}
  } else {
    try {
      await browser.tabs.sendMessage(tabId, { type: "resetColorFavicon" });
    } catch (e) {}
  }
});