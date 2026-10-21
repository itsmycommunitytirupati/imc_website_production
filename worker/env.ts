// Bindings and secrets the guide Worker uses (see wrangler.jsonc).
export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  AI: { run(model: string, input: Record<string, unknown>): Promise<unknown> };
  /** Workers AI model for the agent; defaults to Gemma 4 (multilingual, cheap). */
  GUIDE_MODEL?: string;
  /** Optional: enables live web search through Tavily (free tier). Set with `wrangler secret put`. */
  TAVILY_API_KEY?: string;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

export const DEFAULT_MODEL = "@cf/google/gemma-4-26b-a4b-it";
export const GUARD_MODEL = "@cf/meta/llama-guard-3-8b";
