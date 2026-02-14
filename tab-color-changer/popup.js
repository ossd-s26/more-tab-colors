document.getElementById("toggleBtn").addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({ currentWindow: true })
  
    const validTabs = tabs.filter(
      tab =>
        tab.id &&
        tab.url &&
        !tab.url.startsWith("chrome://") &&
        !tab.url.startsWith("edge://")
    )
  
    if (validTabs.length === 0) return
  
    // check if already in red group
    let existingGroupId = null
  
    for (const tab of validTabs) {
      if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
        const group = await chrome.tabGroups.get(tab.groupId)
        if (group.title === "RED") {
          existingGroupId = tab.groupId
          break
        }
      }
    }
  
  //ungroup red
    if (existingGroupId !== null) {
      await chrome.tabs.ungroup(validTabs.map(t => t.id))
      return
    }
  
    // group red
    const groupId = await chrome.tabs.group({
      tabIds: validTabs.map(t => t.id)
    })
  
    await chrome.tabGroups.update(groupId, {
      title: "RED",
      color: "red"
    })
  })