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
