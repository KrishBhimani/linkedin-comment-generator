# LinkedIn Comment Generator — Chrome Extension Design Spec

## Overview

A browser extension (Chrome/Edge) that generates personalized LinkedIn comment drafts. Users select post text, right-click to trigger generation, and receive 3 varied comment drafts in a side panel. Built with vanilla HTML/CSS/JS, powered by OpenAI or Claude APIs.

## Problem

Manually copying LinkedIn post content into an AI chat, generating comments, and pasting them back is repetitive and slow. This extension automates the flow while keeping the user in control of what gets posted.

## Goals

- Generate 3 varied, high-quality comment drafts from any LinkedIn post
- Minimize friction: select text → right-click → get drafts → copy → paste
- Work across Chrome, Edge, and other Chromium browsers
- Ship fast with vanilla JS, no frameworks or build steps
- Open-source friendly: configurable for any user

## Non-Goals (v1)

- Auto-inserting comments into LinkedIn's comment box (planned for v2)
- Injecting any UI into LinkedIn's DOM
- Supporting non-Chromium browsers (Firefox, Safari)
- Backend server — all API calls happen directly from the extension

---

## Architecture

### Extension Components

| Component | File(s) | Purpose |
|-----------|---------|---------|
| Manifest | `manifest.json` | Manifest V3 config, permissions, context menu |
| Background Worker | `background.js` | Context menu registration, API calls, state management |
| Side Panel | `sidepanel.html`, `sidepanel.js`, `sidepanel.css` | Displays comment drafts, copy buttons, token/cost info |
| Settings Page | `settings.html`, `settings.js`, `settings.css` | Provider/model selection, API key, system prompt, usage stats |

### No Content Scripts

The extension never injects into LinkedIn's pages. It only reads the selected text passed through the browser's context menu API. This makes it immune to LinkedIn DOM changes.

### Data Flow

```
User selects post text on LinkedIn
  → Right-click → "Generate Comments" context menu item
  → background.js receives selected text
  → background.js reads settings from chrome.storage.local
  → background.js calls AI provider API (OpenAI or Claude)
  → Response parsed into 3 comment drafts
  → Drafts sent to side panel via chrome.runtime messaging
  → Side panel renders drafts with copy buttons
  → User clicks "Copy" → text copied to clipboard
  → User pastes into LinkedIn comment box
```

---

## AI Integration

### Providers

Two providers supported, selectable in settings:

1. **OpenAI** — Models: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
2. **Claude** — Models: claude-sonnet-4-20250514, claude-haiku-4-5-20251001

### No SDK — Direct Fetch

Both providers are called via direct `fetch` requests from the background service worker. No npm packages, no bundler, no build step. Each provider has its own thin wrapper function in `utils/api.js` that handles the different auth headers and request formats:

- **OpenAI**: Bearer token auth, `POST https://api.openai.com/v1/chat/completions`
- **Claude**: `x-api-key` header + `anthropic-version` header, `POST https://api.anthropic.com/v1/messages`

### API Call Structure

Each generation sends:
- **System prompt**: User-configurable, with a sensible default
- **User message**: The selected LinkedIn post text + instruction to generate 3 varied comments

### Default System Prompt

```
You are a LinkedIn comment assistant. Generate 3 thoughtful, genuine comments that add value to the conversation.

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
}
```

### Response Parsing

The AI is instructed to return JSON. The background worker parses the JSON response and extracts the 3 comments. If parsing fails (malformed JSON), it falls back to splitting the response by numbered lines.

### Token & Cost Tracking

After each API call:
- Extract token usage from the API response (`usage.prompt_tokens`, `usage.completion_tokens`)
- Calculate estimated cost based on the model's known pricing
- Store cumulative usage in `chrome.storage.local`
- Display per-generation and cumulative stats in the side panel status bar and settings page

---

## UI Design

### Theme

Black and grey tones throughout. No accent colors.

- Background: `#0d0d0d`
- Card/input background: `#141414`
- Borders: `#1f1f1f` to `#2a2a2a`
- Primary text: `#d4d4d4`
- Secondary text: `#737373`
- Labels: `#a3a3a3`
- Buttons: `#e5e5e5` text on dark, `#0d0d0d` text on light buttons

### Side Panel

- **Header**: App name + settings gear icon
- **Status bar**: Current provider/model, tokens used this generation, estimated cost
- **3 Draft cards**: Each labeled by style (Insightful / Question / Personal Experience), with comment text and a "Copy" button
- **Regenerate button**: Re-runs generation with the same post text
- **Loading state**: Shown while API call is in progress
- **Error state**: Shown if API call fails (invalid key, rate limit, network error)

### Settings Page

A separate HTML page (`settings.html`) opened in a new tab when the user clicks the gear icon in the side panel header. Contains:

- **Provider dropdown**: OpenAI / Claude
- **Model dropdown**: Populated based on selected provider
- **API Key input**: Masked by default, toggle to reveal, "stored locally" note
- **System Prompt textarea**: Pre-filled with default, user can customize
- **Usage Stats**: Tokens used, estimated cost, comments generated (cumulative)
- **Save button**: Persists all settings to `chrome.storage.local`

### First-Run Experience

If no API key is stored, the side panel shows a setup prompt directing the user to the settings page. The extension is non-functional until an API key is provided.

---

## Storage

All data stored in `chrome.storage.local` (device-only, never synced):

| Key | Type | Description |
|-----|------|-------------|
| `provider` | string | `"openai"` or `"claude"` |
| `model` | string | Selected model ID |
| `apiKey` | string | User's API key |
| `systemPrompt` | string | Custom or default system prompt |
| `usageStats` | object | `{ totalTokens, totalCost, totalGenerations }` |

### Security

- API key stored in `chrome.storage.local` only — never synced, never exposed in UI after initial entry (masked)
- API calls made directly from background worker (service worker context)
- No data sent anywhere except the selected AI provider's API
- No analytics, no telemetry, no third-party services

---

## Permissions

Manifest V3 permissions required:

| Permission | Reason |
|------------|--------|
| `contextMenus` | Register right-click "Generate Comments" menu item |
| `sidePanel` | Open and control the side panel |
| `storage` | Store settings and usage stats locally |
| `activeTab` | Access selected text from the active tab |

`host_permissions` required for API calls from the background worker:
- `https://api.openai.com/*`
- `https://api.anthropic.com/*`

---

## Error Handling

| Error | Handling |
|-------|----------|
| No API key configured | Side panel shows setup prompt, links to settings |
| Invalid API key | Show error in side panel: "Invalid API key. Check settings." |
| Rate limit (429) | Show error: "Rate limited. Try again in a moment." |
| Network error | Show error: "Network error. Check your connection." |
| Malformed AI response | Fallback parser attempts to extract comments from plain text |
| Empty selection | Context menu item is only enabled when text is selected |

---

## File Structure

```
linkedin-comment-extension/
├── manifest.json
├── background.js
├── sidepanel.html
├── sidepanel.js
├── sidepanel.css
├── settings.html
├── settings.js
├── settings.css
├── utils/
│   ├── api.js          # API call logic for OpenAI and Claude
│   ├── storage.js      # chrome.storage.local helpers
│   └── pricing.js      # Token cost calculation per model
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## Future (v2)

- Auto-insert selected comment into LinkedIn's comment box via content script
- Comment history — view and reuse past generated comments
- Keyboard shortcut trigger (instead of right-click)
- Custom comment style slots (user defines their own 3 styles)
