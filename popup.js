document.addEventListener('DOMContentLoaded', async() => {
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  
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

  //get our saved color from storage
  const result = await browser.storage.local.get(tabKey);
  if (result[tabKey]) {
    colorPicker.color.set(result[tabKey]);
  }

  //apply button functionality
  saveBtn.addEventListener('click', () => {
    const chosenColor = colorPicker.color.hexString; 
    
    browser.storage.local.set({ [tabKey]: chosenColor });
    
    applyTheme(chosenColor);
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
