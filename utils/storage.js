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
