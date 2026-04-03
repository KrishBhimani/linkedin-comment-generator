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
