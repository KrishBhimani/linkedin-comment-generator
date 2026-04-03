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
