if (!document.getElementById("tab-color-bar")) {
    const bar = document.createElement("div")
    bar.id = "tab-color-bar"
  
    bar.style.position = "fixed"
    bar.style.top = "0"
    bar.style.left = "0"
    bar.style.width = "100%"
    bar.style.height = "6px"
    bar.style.backgroundColor = "red"
    bar.style.zIndex = "999999"
  
    document.body.appendChild(bar)
  }