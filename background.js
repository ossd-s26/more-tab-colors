browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  const key = "tab_" + tabId; 

  //check if this specific tab has a saved color
  const result = await browser.storage.local.get(key);
  const savedColor = result[key];

  //apply the color (or reset if none exists)
  if (savedColor) {
    updateWindowTheme(activeInfo.windowId, savedColor);
  } else {
    browser.theme.reset(activeInfo.windowId);
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