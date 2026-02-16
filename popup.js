document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveBtn');
  
  //create the color picker using iro.js
  const colorPicker = new iro.ColorPicker("#picker", {
    width: 150,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  });

  //get our saved color from storage
  browser.storage.local.get("savedColor").then((result) => {
    if (result.savedColor) {
      colorPicker.color.set(result.savedColor);
      applyTheme(result.savedColor);
    }
  });

  //apply button functionality
  saveBtn.addEventListener('click', () => {
    const chosenColor = colorPicker.color.hexString; 
    browser.storage.local.set({ savedColor: chosenColor });
    applyTheme(chosenColor);
  });

  //reset button - restore default (no custom theme)
  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', () => {
    browser.theme.reset();
    browser.storage.local.remove('savedColor');
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
