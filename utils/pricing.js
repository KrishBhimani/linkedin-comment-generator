// utils/pricing.js — Token cost lookup per model (USD per 1M tokens)

const PRICING = {
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gpt-4-turbo": { input: 10.00, output: 30.00 },
  "gpt-3.5-turbo": { input: 0.50, output: 1.50 },
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
