// background.js — Service worker entry point

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generate-comments",
    title: "Generate Comments",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generate-comments" && info.selectionText) {
    console.log("Selected text:", info.selectionText);
    // Will be wired up in Task 4
  }
});
