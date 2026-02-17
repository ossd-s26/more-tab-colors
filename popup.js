document.addEventListener('DOMContentLoaded', async() => {
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');

  const RECENTS_KEY = "recentColors";
  const RECENTS_LIMIT = 10;
  const recentColorsEl = document.getElementById('recentColors');
  
  //create the color picker using iro.js
  const colorPicker = new iro.ColorPicker("#picker", {
    width: 150,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  });

  const tabs = await browser.tabs.query({active: true, currentWindow: true});
  const currentTab = tabs[0];
  const tabKey = "tab_" + currentTab.id;

  const recentColors = await getRecentColors(RECENTS_KEY);
  renderRecentColors(recentColorsEl, recentColors, (hex) => {
    // click a swatch => set picker + apply immediately
    colorPicker.color.set(hex);
    applyTheme(hex);
  });

  //get our saved color from storage
  const result = await browser.storage.local.get(tabKey);
  if (result[tabKey]) {
    colorPicker.color.set(result[tabKey]);
  }

  //apply button functionality
  saveBtn.addEventListener('click', async () => {
    const chosenColor = colorPicker.color.hexString; 
    
    browser.storage.local.set({ [tabKey]: chosenColor });
    
    applyTheme(chosenColor);


    const updatedRecents = addToRecents(recentColors, chosenColor, RECENTS_LIMIT);
    await browser.storage.local.set({ [RECENTS_KEY]: updatedRecents });

    // keep in-memory list aligned + re-render
    recentColors.length = 0;
    recentColors.push(...updatedRecents);
    renderRecentColors(recentColorsEl, recentColors, (hex) => {
      colorPicker.color.set(hex);
      applyTheme(hex);
    });
  });

  //reset button - restore default (no custom theme) 
  resetBtn.addEventListener('click', () => {
    browser.storage.local.remove(tabKey);
    browser.theme.reset();
    colorPicker.color.set('#ffffff');
  });  

});

function applyTheme(color) {
  browser.theme.update({
    colors: {
      frame: color,
      tab_background_text: "#000",
      toolbar: color
    }
  });
}

async function getRecentColors(RECENTS_KEY) {
  const result = await browser.storage.local.get(RECENTS_KEY);
  const list = result[RECENTS_KEY];
  return Array.isArray(list) ? list : [];
}

function addToRecents(recentColors, chosenColor, limit) {
  const normalized = (chosenColor || "").toLowerCase();

  // remove existing occurrence (dedupe)
  const without = recentColors.filter(c => (c || "").toLowerCase() !== normalized);

  // add to front
  return [chosenColor, ...without].slice(0, limit);
}

function renderRecentColors(containerEl, recentColors, onPick) {
  if (!containerEl) return;

  containerEl.innerHTML = "";
  if (!recentColors || recentColors.length === 0) return;

  for (const color of recentColors) {
    const swatch = document.createElement("div");
    swatch.className = "recent-swatch";
    swatch.title = color;
    swatch.style.background = color;
    swatch.addEventListener("click", () => onPick(color));
    containerEl.appendChild(swatch);
  }
}