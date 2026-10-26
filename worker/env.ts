// Bindings and secrets the guide Worker uses (see wrangler.jsonc).
export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  AI: { run(model: string, input: Record<string, unknown>): Promise<unknown> };
  /** Workers AI model for the agent; defaults to Gemma 4 (multilingual, cheap). */
  GUIDE_MODEL?: string;
  /** Optional: enables live web search through Tavily (free tier). Set with `wrangler secret put`. */
  TAVILY_API_KEY?: string;
  /** Community data (migrations/). */
  DB: D1Database;
  /** Comma-separated emails allowed into the admin. */
  ADMIN_EMAILS?: string;
  /** Cloudflare Access team domain (e.g. "imc-tirupati") and application AUD tag. */
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  /** Turnstile: public site key (var) and secret (Worker secret). Forms skip the check until set. */
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET?: string;
}

// Minimal D1 types (enough for this Worker; avoids a types dependency).
export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  meta: { changes: number; last_row_id: number };
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

export const DEFAULT_MODEL = "@cf/google/gemma-4-26b-a4b-it";
export const GUARD_MODEL = "@cf/meta/llama-guard-3-8b";
