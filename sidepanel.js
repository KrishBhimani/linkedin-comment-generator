// sidepanel.js — Side panel rendering and interaction

import { formatCost } from "./utils/pricing.js";

const elements = {
  statusBar: document.getElementById("status-bar"),
  statusInfo: document.getElementById("status-info"),
  emptyState: document.getElementById("empty-state"),
  loadingState: document.getElementById("loading-state"),
  errorState: document.getElementById("error-state"),
  errorMessage: document.getElementById("error-message"),
  errorSettingsBtn: document.getElementById("error-settings-btn"),
  commentsContainer: document.getElementById("comments-container"),
  regenerateContainer: document.getElementById("regenerate-container"),
  regenerateBtn: document.getElementById("regenerate-btn"),
  settingsBtn: document.getElementById("settings-btn")
};

const TYPE_LABELS = {
  insightful: "💡 Insightful",
  question: "❓ Question",
  experience: "📝 Personal Experience",
  comment: "💬 Comment"
};

function showState(state) {
  elements.emptyState.classList.toggle("hidden", state !== "empty");
  elements.loadingState.classList.toggle("hidden", state !== "loading");
  elements.errorState.classList.toggle("hidden", state !== "error");
  elements.commentsContainer.classList.toggle("hidden", state !== "comments");
  elements.regenerateContainer.classList.toggle("hidden", state !== "comments");
  elements.statusBar.classList.toggle("hidden", state !== "comments");
}

function renderComments(comments, usage) {
  elements.commentsContainer.innerHTML = "";

  comments.forEach(comment => {
    const card = document.createElement("div");
    card.className = "comment-card";

    const header = document.createElement("div");
    header.className = "comment-header";

    const label = document.createElement("span");
    label.className = "comment-type";
    label.textContent = TYPE_LABELS[comment.type] || TYPE_LABELS.comment;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(comment.text);
      copyBtn.textContent = "Copied!";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
    });

    header.appendChild(label);
    header.appendChild(copyBtn);

    const text = document.createElement("p");
    text.className = "comment-text";
    text.textContent = comment.text;

    card.appendChild(header);
    card.appendChild(text);
    elements.commentsContainer.appendChild(card);
  });

  const totalTokens = usage.promptTokens + usage.completionTokens;
  elements.statusInfo.textContent = `${usage.provider === "claude" ? "Claude" : "OpenAI"}: ${usage.model} · ${totalTokens} tokens · ${formatCost(usage.cost)}`;

  showState("comments");
}

function showError(message) {
  elements.errorMessage.textContent = message;
  const isKeyError = message.toLowerCase().includes("api key") || message.toLowerCase().includes("no api key");
  elements.errorSettingsBtn.classList.toggle("hidden", !isKeyError);
  showState("error");
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "loading") {
    showState("loading");
  } else if (message.type === "comments") {
    renderComments(message.comments, message.usage);
  } else if (message.type === "error") {
    showError(message.message);
  }
});

// Regenerate button
elements.regenerateBtn.addEventListener("click", () => {
  showState("loading");
  chrome.runtime.sendMessage({ type: "regenerate" });
});

// Settings button
elements.settingsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

elements.errorSettingsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
