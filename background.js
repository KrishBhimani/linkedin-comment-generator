// background.js — Service worker: context menu, API orchestration, messaging

import { getSettings, updateUsageStats } from "./utils/storage.js";
import { generateComments } from "./utils/api.js";
import { calculateCost } from "./utils/pricing.js";

let lastPostText = "";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generate-comments",
    title: "Generate Comments",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "generate-comments" || !info.selectionText) return;

  lastPostText = info.selectionText;

  // Open side panel
  await chrome.sidePanel.open({ tabId: tab.id });

  // Notify side panel to show loading
  chrome.runtime.sendMessage({ type: "loading" });

  // Generate comments
  await runGeneration(lastPostText);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "regenerate") {
    runGeneration(lastPostText);
  }
  if (message.type === "get-last-post") {
    sendResponse({ postText: lastPostText });
  }
});

async function runGeneration(postText) {
  try {
    const settings = await getSettings();

    if (!settings.apiKey) {
      chrome.runtime.sendMessage({
        type: "error",
        message: "No API key configured. Open settings to add your key."
      });
      return;
    }

    const result = await generateComments(
      settings.provider,
      settings.apiKey,
      settings.model,
      settings.systemPrompt,
      postText
    );

    const cost = calculateCost(settings.model, result.promptTokens, result.completionTokens);
    const updatedStats = await updateUsageStats(result.promptTokens, result.completionTokens, cost);

    chrome.runtime.sendMessage({
      type: "comments",
      comments: result.comments,
      usage: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        cost,
        model: settings.model,
        provider: settings.provider
      },
      stats: updatedStats
    });
  } catch (error) {
    chrome.runtime.sendMessage({
      type: "error",
      message: error.message
    });
  }
}
