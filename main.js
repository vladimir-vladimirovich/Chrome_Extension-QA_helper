var contextMenuItem = {
  "id": "parent",
  "title": "QA",
  "contexts": ["all"]
};

var innerMenu = {
    "id": "id2",
    "title": "QA Inner",
    "parentId": "parent",
    "contexts": ["all"]
};

chrome.contextMenus.create(contextMenuItem);
// chrome.contextMenus.create(innerMenu);

// ================================================================

var textToBePasted = '{panel:title=PT QA Test Results|borderColor=#828282|titleBGColor=#7EC45C|bgColor=#E1FADE}\n' +
    '| *Test status:* | Test is OK (/) |\n' +
    '| *Test scope\\Notes:* | |\n' +
    '| *Device\\OS\\Browser:* | |\n' +
    '| *Env URL:* | |\n' +
    '| *Version stamp:* | |\n' +
    '{panel}';

chrome.contextMenus.onClicked.addListener(function (clickEvent) {
  if(clickEvent) {
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {onClick: textToBePasted})
      })
  }
});
