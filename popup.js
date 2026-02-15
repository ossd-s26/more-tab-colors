document.addEventListener('DOMContentLoaded', function() {
  
  const colorButtons = document.querySelectorAll('.color-btn[data-color]');
  
  const resetButton = document.getElementById('reset-btn');
  
  const resetAllButton = document.getElementById('reset-all-btn');
  
  colorButtons.forEach(button => {
    button.addEventListener('click', function() {
      const color = this.getAttribute('data-color');
      
      applyColorToActiveTab(color);
    });
  });
  
  resetButton.addEventListener('click', function() {
    removeTabFromGroup();
  });
  
  resetAllButton.addEventListener('click', function() {
    resetAllTabs();
  });
  
});

/* Apply a color to the currently active tab.*/
function applyColorToActiveTab(color) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    
    if (tabs.length === 0) {
      console.error('No active tab found');
      return;
    }
    
    const activeTab = tabs[0];
    const tabId = activeTab.id;
    
    if (activeTab.groupId && activeTab.groupId !== -1) { //alr in a group
      chrome.tabGroups.update(activeTab.groupId, { color: color }, function() {
        console.log(`Updated group color to ${color}`);
        window.close();
      });
    } else {
      chrome.tabs.group({ tabIds: tabId }, function(groupId) {
        chrome.tabGroups.update(groupId, { color: color }, function() {
          console.log(`Created new group and applied ${color} color`);
          window.close();
        });
      });
    }
  });
}

/* Remove the active tab from its group (reset)*/
function removeTabFromGroup() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length === 0) {
      console.error('No active tab found');
      return;
    }
    
    const activeTab = tabs[0];
    const tabId = activeTab.id;
    
    if (activeTab.groupId && activeTab.groupId !== -1) {
      chrome.tabs.ungroup(tabId, function() {
        console.log('Tab removed from group');
        window.close();
      });
    } else {
      console.log('Tab is not in a group');
      window.close();
    }
  });
}

/* Reset all tabs */

function resetAllTabs() {
  chrome.tabs.query({ currentWindow: true }, function(tabs) {
    
    const groupedTabIds = tabs
      .filter(tab => tab.groupId && tab.groupId !== -1)
      .map(tab => tab.id);
    
    if (groupedTabIds.length > 0) {
      chrome.tabs.ungroup(groupedTabIds, function() {
        console.log(`Ungrouped ${groupedTabIds.length} tabs`);
        window.close();
      });
    } else {
      console.log('No tabs are in groups');
      window.close();
    }
  });
}