# LinkedIn Comment Generator Extension — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chrome/Edge extension that generates 3 varied LinkedIn comment drafts via AI (OpenAI or Claude) using a right-click context menu and side panel UI.

**Architecture:** Manifest V3 extension with a background service worker (handles context menu + API calls), a side panel (displays drafts), and a settings page (configuration). No content scripts, no build step, no frameworks. Direct `fetch` calls to AI provider APIs.

**Tech Stack:** Vanilla HTML/CSS/JS, Chrome Extension Manifest V3, OpenAI REST API, Anthropic REST API

---

## File Structure

```
linkedin-comment-extension/
├── manifest.json          — Extension config, permissions, context menu, side panel
├── background.js          — Service worker: context menu, API orchestration, messaging
├── sidepanel.html         — Side panel markup
├── sidepanel.js           — Side panel logic: render drafts, copy, regenerate
├── sidepanel.css          — Side panel styles (black/grey theme)
├── settings.html          — Settings page markup
├── settings.js            — Settings page logic: save/load config
├── settings.css           — Settings page styles (black/grey theme)
├── utils/
│   ├── api.js             — Provider-specific API call wrappers (OpenAI + Claude)
│   ├── storage.js         — chrome.storage.local read/write helpers
│   └── pricing.js         — Token cost lookup table per model
└── icons/
    ├── icon16.png          — Extension icon 16x16
    ├── icon48.png          — Extension icon 48x48
    └── icon128.png         — Extension icon 128x128
```

---

### Task 1: Project Scaffold + Manifest

**Files:**
- Create: `manifest.json`
- Create: `background.js` (minimal)
- Create: `sidepanel.html` (minimal)
- Create: `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`

- [ ] **Step 1: Create manifest.json**

```json
{
  "manifest_version": 3,
  "name": "LinkedIn Comment Generator",
  "version": "1.0.0",
  "description": "Generate personalized LinkedIn comment drafts powered by AI",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "permissions": [
    "contextMenus",
    "sidePanel",
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://api.openai.com/*",
    "https://api.anthropic.com/*"
  ]
}
```

- [ ] **Step 2: Create minimal background.js**

```js
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
    // TODO: will be wired up in Task 4
  }
});
```

- [ ] **Step 3: Create minimal sidepanel.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comment Generator</title>
  <link rel="stylesheet" href="sidepanel.css">
</head>
<body>
  <div id="app">
    <header>
      <span class="app-title">Comment Generator</span>
      <button id="settings-btn" class="icon-btn" title="Settings">⚙️</button>
    </header>
    <div id="content">
      <p class="empty-state">Select text on LinkedIn, right-click, and choose "Generate Comments"</p>
    </div>
  </div>
  <script src="sidepanel.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create placeholder sidepanel.css with theme**

```css
/* sidepanel.css — Black and grey theme */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0d0d0d;
  color: #d4d4d4;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  min-width: 320px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #2a2a2a;
}

.app-title {
  font-weight: 600;
  font-size: 15px;
  color: #e5e5e5;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.icon-btn:hover {
  opacity: 1;
}

#content {
  padding: 16px;
}

.empty-state {
  text-align: center;
  color: #737373;
  padding: 40px 16px;
  line-height: 1.6;
}
```

- [ ] **Step 5: Create minimal sidepanel.js**

```js
// sidepanel.js

document.getElementById("settings-btn").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
```

- [ ] **Step 6: Generate placeholder icons**

Create simple placeholder PNG icons at 16x16, 48x48, and 128x128 pixels. These can be solid grey squares with a "C" letter — they'll be replaced with proper icons later. Use a canvas-based generator script or any simple image tool.

For now, create a simple script `generate-icons.js` to run once in Node.js:

```js
// generate-icons.js — Run once with: node generate-icons.js
// Creates simple placeholder icons

const { createCanvas } = require("canvas");
const fs = require("fs");

const sizes = [16, 48, 128];

if (!fs.existsSync("icons")) fs.mkdirSync("icons");

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Dark background
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, size, size);

  // Letter C
  ctx.fillStyle = "#e5e5e5";
  ctx.font = `bold ${Math.floor(size * 0.6)}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("C", size / 2, size / 2);

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(`icons/icon${size}.png`, buffer);
  console.log(`Created icon${size}.png`);
});
```

Alternatively, manually create simple icon PNGs with any image editor.

- [ ] **Step 7: Load extension in browser and verify**

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project directory
4. Verify: extension appears with icon in toolbar
5. Go to any webpage, select text, right-click — "Generate Comments" should appear in context menu
6. Click the extension icon — side panel should open with the empty state message

- [ ] **Step 8: Initialize git and commit**

```bash
git init
git add manifest.json background.js sidepanel.html sidepanel.js sidepanel.css icons/
git commit -m "feat: scaffold extension with manifest, context menu, and side panel shell"
```

---

### Task 2: Storage Helpers + Pricing Table

**Files:**
- Create: `utils/storage.js`
- Create: `utils/pricing.js`

- [ ] **Step 1: Create utils/storage.js**

```js
// utils/storage.js — chrome.storage.local helpers

const DEFAULTS = {
  provider: "openai",
  model: "gpt-4o",
  apiKey: "",
  systemPrompt: `You are a LinkedIn comment assistant. Generate 3 thoughtful, genuine comments that add value to the conversation.

Create these variations:
1. INSIGHTFUL — Share an observation or insight that builds on the post's ideas
2. QUESTION — Ask a thoughtful question that deepens the discussion
3. PERSONAL EXPERIENCE — Relate a relevant personal or professional experience

Guidelines:
- Keep each comment concise (2-4 sentences)
- Be authentic — avoid generic praise or filler phrases
- Add genuine value — say something worth reading
- Match the tone of the original post
- Do not use hashtags

Format your response as JSON:
{
  "comments": [
    { "type": "insightful", "text": "..." },
    { "type": "question", "text": "..." },
    { "type": "experience", "text": "..." }
  ]
}`,
  usageStats: {
    totalTokens: 0,
    totalCost: 0,
    totalGenerations: 0
  }
};

export async function getSettings() {
  const data = await chrome.storage.local.get(Object.keys(DEFAULTS));
  return { ...DEFAULTS, ...data };
}

export async function saveSettings(settings) {
  await chrome.storage.local.set(settings);
}

export async function updateUsageStats(promptTokens, completionTokens, cost) {
  const { usageStats } = await chrome.storage.local.get("usageStats");
  const stats = usageStats || DEFAULTS.usageStats;

  const updated = {
    totalTokens: stats.totalTokens + promptTokens + completionTokens,
    totalCost: stats.totalCost + cost,
    totalGenerations: stats.totalGenerations + 1
  };

  await chrome.storage.local.set({ usageStats: updated });
  return updated;
}

export async function resetUsageStats() {
  await chrome.storage.local.set({ usageStats: DEFAULTS.usageStats });
}

export { DEFAULTS };
```

- [ ] **Step 2: Create utils/pricing.js**

```js
// utils/pricing.js — Token cost lookup per model (USD per 1M tokens)

const PRICING = {
  // OpenAI models — per 1M tokens
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gpt-4-turbo": { input: 10.00, output: 30.00 },
  "gpt-3.5-turbo": { input: 0.50, output: 1.50 },

  // Claude models — per 1M tokens
  "claude-sonnet-4-20250514": { input: 3.00, output: 15.00 },
  "claude-haiku-4-5-20251001": { input: 0.80, output: 4.00 }
};

const MODELS = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" }
  ],
  claude: [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
    { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" }
  ]
};

export function calculateCost(model, promptTokens, completionTokens) {
  const pricing = PRICING[model];
  if (!pricing) return 0;

  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

export function getModelsForProvider(provider) {
  return MODELS[provider] || [];
}

export function formatCost(cost) {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(3)}`;
}

export { PRICING, MODELS };
```

- [ ] **Step 3: Commit**

```bash
git add utils/
git commit -m "feat: add storage helpers and pricing table for OpenAI and Claude models"
```

---

### Task 3: API Call Layer

**Files:**
- Create: `utils/api.js`

- [ ] **Step 1: Create utils/api.js with OpenAI wrapper**

```js
// utils/api.js — Direct fetch wrappers for OpenAI and Claude

export async function callOpenAI(apiKey, model, systemPrompt, userMessage) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.8
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error("Invalid API key. Check your settings.");
    if (response.status === 429) throw new Error("Rate limited. Try again in a moment.");
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    promptTokens: data.usage?.prompt_tokens || 0,
    completionTokens: data.usage?.completion_tokens || 0
  };
}

export async function callClaude(apiKey, model, systemPrompt, userMessage) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: "user", content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error("Invalid API key. Check your settings.");
    if (response.status === 429) throw new Error("Rate limited. Try again in a moment.");
    throw new Error(error.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    promptTokens: data.usage?.input_tokens || 0,
    completionTokens: data.usage?.output_tokens || 0
  };
}

export async function generateComments(provider, apiKey, model, systemPrompt, postText) {
  const userMessage = `Here is a LinkedIn post. Generate 3 comment variations as specified in your instructions.\n\n---\n${postText}\n---`;

  const callFn = provider === "claude" ? callClaude : callOpenAI;
  const result = await callFn(apiKey, model, systemPrompt, userMessage);

  const comments = parseComments(result.content);

  return {
    comments,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens
  };
}

function parseComments(content) {
  // Try JSON parse first
  try {
    // Extract JSON from potential markdown code block
    const jsonMatch = content.match(/\{[\s\S]*"comments"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.comments) && parsed.comments.length >= 3) {
        return parsed.comments.slice(0, 3).map(c => ({
          type: c.type || "comment",
          text: c.text
        }));
      }
    }
  } catch (e) {
    // JSON parse failed, fall through to fallback
  }

  // Fallback: split by numbered lines
  const lines = content.split(/\n/).filter(l => l.trim());
  const comments = [];
  let current = "";

  for (const line of lines) {
    if (/^\d+[\.\)]/.test(line.trim()) && current) {
      comments.push(current.trim());
      current = line.replace(/^\d+[\.\)]\s*/, "").replace(/^\*\*.*?\*\*\s*[-:]*\s*/, "");
    } else {
      current += " " + line;
    }
  }
  if (current.trim()) comments.push(current.trim());

  const types = ["insightful", "question", "experience"];
  return comments.slice(0, 3).map((text, i) => ({
    type: types[i] || "comment",
    text: text.trim()
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add utils/api.js
git commit -m "feat: add API call wrappers for OpenAI and Claude with response parsing"
```

---

### Task 4: Wire Up Background Service Worker

**Files:**
- Modify: `background.js`

- [ ] **Step 1: Replace background.js with full implementation**

```js
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
```

- [ ] **Step 2: Reload extension and verify**

1. Go to `chrome://extensions/`, click reload on the extension
2. Go to any webpage, select text, right-click → "Generate Comments"
3. Side panel should open
4. Check the service worker console (click "Service worker" link on extensions page) — should see no errors (API call will fail without a key, which is expected)

- [ ] **Step 3: Commit**

```bash
git add background.js
git commit -m "feat: wire up background worker with context menu, API calls, and messaging"
```

---

### Task 5: Side Panel UI — Drafts Display

**Files:**
- Modify: `sidepanel.html`
- Modify: `sidepanel.js`
- Modify: `sidepanel.css`

- [ ] **Step 1: Update sidepanel.html with full structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comment Generator</title>
  <link rel="stylesheet" href="sidepanel.css">
</head>
<body>
  <div id="app">
    <header>
      <span class="app-title">Comment Generator</span>
      <button id="settings-btn" class="icon-btn" title="Settings">⚙️</button>
    </header>

    <div id="status-bar" class="status-bar hidden">
      <span id="status-info"></span>
    </div>

    <div id="content">
      <!-- Empty state -->
      <div id="empty-state" class="empty-state">
        <p>Select text on LinkedIn, right-click, and choose "Generate Comments"</p>
      </div>

      <!-- Loading state -->
      <div id="loading-state" class="loading-state hidden">
        <div class="spinner"></div>
        <p>Generating comments...</p>
      </div>

      <!-- Error state -->
      <div id="error-state" class="error-state hidden">
        <p id="error-message"></p>
        <button id="error-settings-btn" class="link-btn hidden">Open Settings</button>
      </div>

      <!-- Comments -->
      <div id="comments-container" class="hidden"></div>
    </div>

    <div id="regenerate-container" class="hidden">
      <button id="regenerate-btn" class="regenerate-btn">🔄 Regenerate</button>
    </div>
  </div>
  <script src="sidepanel.js" type="module"></script>
</body>
</html>
```

- [ ] **Step 2: Update sidepanel.js with full logic**

```js
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
```

- [ ] **Step 3: Update sidepanel.css with full styles**

```css
/* sidepanel.css — Black and grey theme */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0d0d0d;
  color: #d4d4d4;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  min-width: 320px;
}

.hidden {
  display: none !important;
}

/* Header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #2a2a2a;
}

.app-title {
  font-weight: 600;
  font-size: 15px;
  color: #e5e5e5;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.icon-btn:hover {
  opacity: 1;
}

/* Status bar */
.status-bar {
  padding: 8px 16px;
  background: #141414;
  font-size: 12px;
  color: #737373;
  border-bottom: 1px solid #1f1f1f;
}

/* States */
.empty-state,
.loading-state,
.error-state {
  text-align: center;
  color: #737373;
  padding: 40px 16px;
  line-height: 1.6;
}

.error-state {
  color: #b35555;
}

/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #2a2a2a;
  border-top-color: #737373;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Comment cards */
.comment-card {
  padding: 14px 16px;
  border-bottom: 1px solid #1f1f1f;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-type {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #a3a3a3;
}

.copy-btn {
  background: #e5e5e5;
  color: #0d0d0d;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #cccccc;
}

.comment-text {
  font-size: 13px;
  line-height: 1.5;
  color: #b3b3b3;
}

/* Regenerate */
#regenerate-container {
  padding: 12px 16px;
  text-align: center;
  border-top: 1px solid #1f1f1f;
}

.regenerate-btn {
  background: transparent;
  color: #a3a3a3;
  border: 1px solid #333;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.regenerate-btn:hover {
  border-color: #555;
  color: #d4d4d4;
}

/* Link button */
.link-btn {
  background: none;
  border: none;
  color: #a3a3a3;
  text-decoration: underline;
  cursor: pointer;
  font-size: 13px;
  margin-top: 12px;
}

.link-btn:hover {
  color: #d4d4d4;
}
```

- [ ] **Step 4: Reload extension and verify**

1. Reload extension at `chrome://extensions/`
2. Select text on any page → right-click → "Generate Comments"
3. Side panel should open and show loading spinner
4. Without API key: should show error state with "Open Settings" link
5. Verify: copy button exists, regenerate button exists, settings gear works

- [ ] **Step 5: Commit**

```bash
git add sidepanel.html sidepanel.js sidepanel.css
git commit -m "feat: implement side panel UI with comment cards, copy, and regenerate"
```

---

### Task 6: Settings Page

**Files:**
- Create: `settings.html`
- Create: `settings.js`
- Create: `settings.css`
- Modify: `manifest.json` (add options_page)

- [ ] **Step 1: Add options_page to manifest.json**

Add the following key to `manifest.json` at the top level:

```json
"options_page": "settings.html"
```

- [ ] **Step 2: Create settings.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Settings — Comment Generator</title>
  <link rel="stylesheet" href="settings.css">
</head>
<body>
  <div id="app">
    <header>
      <span class="page-title">⚙️ Settings</span>
    </header>

    <!-- Provider -->
    <div class="field">
      <label for="provider">Provider</label>
      <select id="provider">
        <option value="openai">OpenAI</option>
        <option value="claude">Claude</option>
      </select>
    </div>

    <!-- Model -->
    <div class="field">
      <label for="model">Model</label>
      <select id="model"></select>
    </div>

    <!-- API Key -->
    <div class="field">
      <label for="api-key">API Key</label>
      <div class="input-group">
        <input type="password" id="api-key" placeholder="Enter your API key">
        <button id="toggle-key" class="toggle-btn">👁</button>
      </div>
      <span class="hint">Stored locally on this device only</span>
    </div>

    <!-- System Prompt -->
    <div class="field">
      <label for="system-prompt">System Prompt</label>
      <textarea id="system-prompt" rows="10" placeholder="Instructions for the AI..."></textarea>
      <span class="hint">Customize how comments are generated</span>
    </div>

    <!-- Usage Stats -->
    <div class="field">
      <label>Usage</label>
      <div class="stats">
        <div class="stat-row">
          <span>Tokens used</span>
          <span id="stat-tokens">0</span>
        </div>
        <div class="stat-row">
          <span>Estimated cost</span>
          <span id="stat-cost">$0.0000</span>
        </div>
        <div class="stat-row">
          <span>Comments generated</span>
          <span id="stat-generations">0</span>
        </div>
      </div>
      <button id="reset-stats" class="link-btn">Reset stats</button>
    </div>

    <!-- Save -->
    <div class="actions">
      <button id="save-btn" class="save-btn">Save Settings</button>
      <span id="save-status" class="save-status hidden">Saved!</span>
    </div>
  </div>
  <script src="settings.js" type="module"></script>
</body>
</html>
```

- [ ] **Step 3: Create settings.js**

```js
// settings.js — Settings page logic

import { getSettings, saveSettings, resetUsageStats, DEFAULTS } from "./utils/storage.js";
import { getModelsForProvider, formatCost } from "./utils/pricing.js";

const els = {
  provider: document.getElementById("provider"),
  model: document.getElementById("model"),
  apiKey: document.getElementById("api-key"),
  toggleKey: document.getElementById("toggle-key"),
  systemPrompt: document.getElementById("system-prompt"),
  statTokens: document.getElementById("stat-tokens"),
  statCost: document.getElementById("stat-cost"),
  statGenerations: document.getElementById("stat-generations"),
  resetStats: document.getElementById("reset-stats"),
  saveBtn: document.getElementById("save-btn"),
  saveStatus: document.getElementById("save-status")
};

function populateModels(provider, selectedModel) {
  const models = getModelsForProvider(provider);
  els.model.innerHTML = "";
  models.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.name;
    if (m.id === selectedModel) opt.selected = true;
    els.model.appendChild(opt);
  });
}

function renderStats(stats) {
  els.statTokens.textContent = stats.totalTokens.toLocaleString();
  els.statCost.textContent = formatCost(stats.totalCost);
  els.statGenerations.textContent = stats.totalGenerations.toLocaleString();
}

async function loadSettings() {
  const settings = await getSettings();

  els.provider.value = settings.provider;
  populateModels(settings.provider, settings.model);
  els.apiKey.value = settings.apiKey;
  els.systemPrompt.value = settings.systemPrompt;
  renderStats(settings.usageStats);
}

els.provider.addEventListener("change", () => {
  const models = getModelsForProvider(els.provider.value);
  populateModels(els.provider.value, models[0]?.id);
});

els.toggleKey.addEventListener("click", () => {
  const isPassword = els.apiKey.type === "password";
  els.apiKey.type = isPassword ? "text" : "password";
  els.toggleKey.textContent = isPassword ? "🔒" : "👁";
});

els.resetStats.addEventListener("click", async () => {
  await resetUsageStats();
  renderStats(DEFAULTS.usageStats);
});

els.saveBtn.addEventListener("click", async () => {
  await saveSettings({
    provider: els.provider.value,
    model: els.model.value,
    apiKey: els.apiKey.value,
    systemPrompt: els.systemPrompt.value
  });

  els.saveStatus.classList.remove("hidden");
  setTimeout(() => els.saveStatus.classList.add("hidden"), 2000);
});

loadSettings();
```

- [ ] **Step 4: Create settings.css**

```css
/* settings.css — Black and grey theme */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0d0d0d;
  color: #d4d4d4;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 0 40px;
}

header {
  padding: 14px 16px;
  border-bottom: 1px solid #2a2a2a;
}

.page-title {
  font-weight: 600;
  font-size: 15px;
  color: #e5e5e5;
}

/* Fields */
.field {
  padding: 14px 16px;
  border-bottom: 1px solid #1f1f1f;
}

label {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #737373;
  margin-bottom: 6px;
}

select,
input[type="text"],
input[type="password"] {
  width: 100%;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 13px;
  color: #b3b3b3;
  font-family: inherit;
}

select:focus,
input:focus,
textarea:focus {
  outline: none;
  border-color: #444;
}

textarea {
  width: 100%;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 12px;
  color: #b3b3b3;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group input {
  flex: 1;
}

.toggle-btn {
  background: #1f1f1f;
  color: #a3a3a3;
  border: 1px solid #2a2a2a;
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.toggle-btn:hover {
  border-color: #444;
}

.hint {
  display: block;
  font-size: 11px;
  color: #525252;
  margin-top: 4px;
}

/* Stats */
.stats {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 8px 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.stat-row span:first-child {
  color: #737373;
}

.stat-row span:last-child {
  color: #b3b3b3;
}

.link-btn {
  background: none;
  border: none;
  color: #525252;
  text-decoration: underline;
  cursor: pointer;
  font-size: 11px;
  margin-top: 6px;
}

.link-btn:hover {
  color: #a3a3a3;
}

/* Actions */
.actions {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-btn {
  width: 100%;
  background: #e5e5e5;
  color: #0d0d0d;
  border: none;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #cccccc;
}

.save-status {
  color: #737373;
  font-size: 13px;
  white-space: nowrap;
}

.hidden {
  display: none !important;
}
```

- [ ] **Step 5: Reload extension and verify settings page**

1. Reload extension at `chrome://extensions/`
2. Click extension icon → side panel opens → click gear icon
3. Settings page should open in a new tab
4. Verify: provider dropdown switches model list, API key toggle works, save button shows "Saved!"
5. Enter a test API key, save, reload settings page — key should persist

- [ ] **Step 6: Commit**

```bash
git add manifest.json settings.html settings.js settings.css
git commit -m "feat: implement settings page with provider/model selection, API key, and usage stats"
```

---

### Task 7: End-to-End Testing

**Files:** None (testing only)

- [ ] **Step 1: Test with OpenAI API key**

1. Open settings, select OpenAI provider, enter a valid OpenAI API key, save
2. Go to LinkedIn (or any page with text)
3. Select a paragraph of text → right-click → "Generate Comments"
4. Side panel should: show loading → display 3 comment cards
5. Verify each card has a type label and text
6. Click "Copy" on a card → paste somewhere → verify text matches
7. Click "Regenerate" → verify new comments appear

- [ ] **Step 2: Test with Claude API key**

1. Open settings, switch to Claude provider, enter a valid Claude/Anthropic API key, save
2. Repeat the generation flow from Step 1
3. Verify comments generate successfully with Claude

- [ ] **Step 3: Test error states**

1. Enter an invalid API key → generate → verify "Invalid API key" error shows with "Open Settings" link
2. Remove API key entirely → generate → verify "No API key configured" message
3. Verify usage stats update in settings after successful generations

- [ ] **Step 4: Test in Edge browser**

1. Open `edge://extensions/`
2. Enable developer mode, load unpacked
3. Repeat the full generation flow
4. Verify side panel works identically to Chrome

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during end-to-end testing"
```

---

### Task 8: README + Final Cleanup

**Files:**
- Create: `README.md`
- Create: `.gitignore`

- [ ] **Step 1: Create .gitignore**

```
node_modules/
.DS_Store
*.log
generate-icons.js
```

- [ ] **Step 2: Create README.md**

```markdown
# LinkedIn Comment Generator

A browser extension that generates personalized LinkedIn comment drafts powered by AI (OpenAI or Claude).

## Features

- Right-click on selected text to generate 3 varied comment drafts
- Comment styles: Insightful, Question, Personal Experience
- Side panel UI — stays open while browsing
- Supports OpenAI (GPT-4o, GPT-4o-mini, etc.) and Claude (Sonnet, Haiku)
- Customizable system prompt
- Token usage and cost tracking
- Dark theme (black/grey)
- Zero dependencies — vanilla HTML/CSS/JS

## Install

1. Clone or download this repository
2. Open `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
3. Enable **Developer mode**
4. Click **Load unpacked** and select the project folder
5. Click the extension icon and open **Settings**
6. Add your API key (OpenAI or Anthropic)

## Usage

1. Go to LinkedIn (or any page)
2. Select the text of a post
3. Right-click → **Generate Comments**
4. Side panel opens with 3 comment drafts
5. Click **Copy** on your preferred comment
6. Paste into LinkedIn's comment box

## Configuration

Open Settings (gear icon in side panel) to configure:

- **Provider**: OpenAI or Claude
- **Model**: Select from available models
- **API Key**: Your provider API key (stored locally only)
- **System Prompt**: Customize comment generation instructions

## Privacy

- API key is stored locally on your device only (never synced)
- No analytics, telemetry, or third-party services
- Post text is sent only to your selected AI provider
- No data is stored beyond your settings and usage stats
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore README.md
git commit -m "docs: add README and .gitignore"
```
