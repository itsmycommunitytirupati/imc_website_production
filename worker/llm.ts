import { DEFAULT_MODEL, type Env } from "./env";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Workers AI returns different shapes per model family; normalise to text.
export async function chat(env: Env, messages: Message[], maxTokens = 800): Promise<string> {
  const model = env.GUIDE_MODEL || DEFAULT_MODEL;
  // Reasoning models "think" for 20+ seconds before answering; switch that off so
  // each agent step takes about a second.
  const thinking = model.includes("gemma-4") || model.includes("qwen3")
    ? { chat_template_kwargs: { enable_thinking: false } }
    : model.includes("gpt-oss") ? { reasoning_effort: "low" } : {};
  const r = (await env.AI.run(model, { messages, max_tokens: maxTokens, temperature: 0.1, ...thinking })) as Record<string, unknown> | string;
  const raw =
    typeof r === "string"
      ? r
      : (r.response ?? (r.choices as { message?: { content?: unknown } }[] | undefined)?.[0]?.message?.content ?? (r.result as { response?: unknown } | undefined)?.response);
  const text = typeof raw === "string" ? raw : raw == null ? "" : JSON.stringify(raw);
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

// Pull the first complete JSON object out of a model reply (tolerates code fences and chatter).
export function parseJson<T = Record<string, unknown>>(text: string): T | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === "\\") i++;
      else if (ch === '"') inString = false;
    } else if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) {
      try {
        return JSON.parse(text.slice(start, i + 1)) as T;
      } catch {
        return null;
      }
    }
  }
  return null;
}
