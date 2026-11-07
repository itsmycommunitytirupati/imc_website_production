// PhonePe Payment Gateway, Standard Checkout V2 (plain fetch, no SDK).
// Docs: developer.phonepe.com → Payment Gateway → Website → Standard Checkout → API reference.
//
// PHONEPE_ENV picks the hosts: "production", "sandbox", or "mock". Mock fakes PhonePe inside this
// Worker for local testing and is refused unless ADMIN_DEV_BYPASS=1 (wrangler dev only), so a
// deployed Worker can never accept fake payments.
import type { Env } from "./env";
import { sha256 } from "./http";

export type OrderState = "PENDING" | "COMPLETED" | "FAILED";
export interface OrderStatus {
  state: OrderState;
  orderId: string;
  paymentMode: string;
  transactionId: string;
}

const HOSTS = {
  production: { auth: "https://api.phonepe.com/apis/identity-manager", api: "https://api.phonepe.com/apis/pg" },
  sandbox: { auth: "https://api-preprod.phonepe.com/apis/pg-sandbox", api: "https://api-preprod.phonepe.com/apis/pg-sandbox" },
};

export function gatewayMode(env: Env): "production" | "sandbox" | "mock" | null {
  const mode = env.PHONEPE_ENV;
  if (mode === "mock") return env.ADMIN_DEV_BYPASS === "1" ? "mock" : null;
  if ((mode === "production" || mode === "sandbox") && env.PHONEPE_CLIENT_ID && env.PHONEPE_CLIENT_SECRET) return mode;
  return null;
}

/**
 * Whether people can pay on this address. Test mode (sandbox) only takes payments on preview
 * addresses (<alias>-imc-website-production…workers.dev) and local dev, never on imctirupati.com
 * or the main workers.dev address, so a forgotten "sandbox" can't sell real seats for fake money.
 */
export function canTakePayments(env: Env, request: Request) {
  const mode = gatewayMode(env);
  if (mode !== "sandbox") return Boolean(mode);
  const host = new URL(request.headers.get("origin") || request.url).hostname;
  return /^[a-z0-9-]+-imc-website-production\./.test(host) || host === "127.0.0.1" || host === "localhost";
}

let token: { value: string; expiresAt: number; key: string } | null = null;

async function accessToken(env: Env, mode: "production" | "sandbox"): Promise<string> {
  const key = `${mode}:${env.PHONEPE_CLIENT_ID}`;
  // Refresh five minutes before expiry, as PhonePe recommends.
  if (token && token.key === key && token.expiresAt - 300 > Date.now() / 1000) return token.value;
  const body = new URLSearchParams({
    client_id: env.PHONEPE_CLIENT_ID ?? "",
    client_version: env.PHONEPE_CLIENT_VERSION || "1",
    client_secret: env.PHONEPE_CLIENT_SECRET ?? "",
    grant_type: "client_credentials",
  });
  const res = await fetch(`${HOSTS[mode].auth}/v1/oauth/token`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; expires_at?: number };
  if (!res.ok || !data.access_token) throw new Error(`phonepe_auth_${res.status}`);
  token = { value: data.access_token, expiresAt: Number(data.expires_at) || Date.now() / 1000 + 600, key };
  return token.value;
}

async function call<T>(env: Env, mode: "production" | "sandbox", method: "GET" | "POST", path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`${HOSTS[mode].api}${path}`, {
    method,
    headers: { "content-type": "application/json", authorization: `O-Bearer ${await accessToken(env, mode)}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { ok: res.ok, status: res.status, data: (await res.json().catch(() => ({}))) as T };
}

/** Connection check for /api/health?check=payments: can we get a token? Never returns secrets. */
export async function checkConnection(env: Env, probe?: "sandbox" | "production"): Promise<{ mode: string | null; ok: boolean; error?: string }> {
  // `probe` tries the same credentials against the other environment, to tell test keys from live
  // ones. It only asks for a token; no order is created.
  const mode = probe && gatewayMode(env) ? probe : gatewayMode(env);
  if (mode !== "production" && mode !== "sandbox") return { mode, ok: mode === "mock" };
  try {
    await accessToken(env, mode);
    return { mode, ok: true };
  } catch (err) {
    return { mode, ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

/** Creates a checkout order; returns the PhonePe page to send the person to. */
export async function createOrder(env: Env, o: { merchantOrderId: string; amountPaise: number; redirectUrl: string; expireAfter: number; event: string; ref: string }) {
  const mode = gatewayMode(env);
  if (!mode) throw new Error("payments_unavailable");
  if (mode === "mock") {
    await env.DB.prepare("UPDATE payments SET phonepe_order_id = ? WHERE merchant_order_id = ?").bind(`MOCK${o.merchantOrderId}`, o.merchantOrderId).run();
    return { orderId: `MOCK${o.merchantOrderId}`, checkoutUrl: `/pay/mock?o=${encodeURIComponent(o.merchantOrderId)}&back=${encodeURIComponent(o.redirectUrl)}` };
  }
  const res = await call<{ orderId?: string; redirectUrl?: string; code?: string }>(env, mode, "POST", "/checkout/v2/pay", {
    merchantOrderId: o.merchantOrderId,
    amount: o.amountPaise,
    expireAfter: o.expireAfter,
    metaInfo: { udf1: o.event.slice(0, 256), udf2: o.ref },
    paymentFlow: { type: "PG_CHECKOUT", message: `IMC Tirupati ${o.ref}`, merchantUrls: { redirectUrl: o.redirectUrl } },
  });
  if (!res.ok || !res.data.redirectUrl) throw new Error(`phonepe_pay_${res.status}_${res.data.code ?? ""}`);
  return { orderId: res.data.orderId ?? "", checkoutUrl: res.data.redirectUrl };
}

/** The source of truth for a payment: never confirm a booking from a redirect or webhook alone. */
export async function orderStatus(env: Env, merchantOrderId: string): Promise<OrderStatus | null> {
  const mode = gatewayMode(env);
  if (!mode) return null;
  if (mode === "mock") {
    const row = await env.DB.prepare("SELECT phonepe_order_id, payment_mode FROM payments WHERE merchant_order_id = ?").bind(merchantOrderId).first<{ phonepe_order_id: string; payment_mode: string }>();
    // The mock page stores its outcome in payment_mode as MOCK_COMPLETED / MOCK_FAILED.
    const state: OrderState = row?.payment_mode === "MOCK_COMPLETED" ? "COMPLETED" : row?.payment_mode === "MOCK_FAILED" ? "FAILED" : "PENDING";
    return { state, orderId: row?.phonepe_order_id ?? "", paymentMode: "MOCK_UPI", transactionId: state === "COMPLETED" ? `MOCKTXN${merchantOrderId.slice(-8)}` : "" };
  }
  const res = await call<{ orderId?: string; state?: OrderState; paymentDetails?: { paymentMode?: string; transactionId?: string; state?: string }[]; code?: string }>(
    env,
    mode,
    "GET",
    `/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status?details=false`,
  );
  if (!res.ok || !res.data.state) return null;
  const attempt = res.data.paymentDetails?.[0];
  return { state: res.data.state, orderId: res.data.orderId ?? "", paymentMode: attempt?.paymentMode ?? "", transactionId: attempt?.transactionId ?? "" };
}

export async function refund(env: Env, r: { merchantRefundId: string; merchantOrderId: string; amountPaise: number }) {
  const mode = gatewayMode(env);
  if (!mode) throw new Error("payments_unavailable");
  if (mode === "mock") return { refundId: `MOCKREF${r.merchantRefundId}`, state: "COMPLETED" };
  const res = await call<{ refundId?: string; state?: string; code?: string }>(env, mode, "POST", "/payments/v2/refund", {
    merchantRefundId: r.merchantRefundId,
    originalMerchantOrderId: r.merchantOrderId,
    amount: r.amountPaise,
  });
  if (!res.ok) throw new Error(`phonepe_refund_${res.status}_${res.data.code ?? ""}`);
  return { refundId: res.data.refundId ?? "", state: res.data.state ?? "PENDING" };
}

export async function refundStatus(env: Env, merchantRefundId: string) {
  const mode = gatewayMode(env);
  if (!mode || mode === "mock") return mode === "mock" ? { state: "COMPLETED" } : null;
  const res = await call<{ state?: string }>(env, mode, "GET", `/payments/v2/refund/${encodeURIComponent(merchantRefundId)}/status`);
  return res.ok && res.data.state ? { state: res.data.state } : null;
}

/**
 * Webhook authentication: PhonePe sends Authorization = SHA256("username:password") of the
 * credentials set in its dashboard. The payload itself is never trusted; the handler re-checks
 * the order with the Status API, so a forged call can at most trigger a harmless re-check.
 */
export async function webhookAuthorized(env: Env, header: string | null) {
  if (!env.PHONEPE_WEBHOOK_USERNAME || !env.PHONEPE_WEBHOOK_PASSWORD) return false;
  const expected = await sha256(`${env.PHONEPE_WEBHOOK_USERNAME}:${env.PHONEPE_WEBHOOK_PASSWORD}`);
  const got = (header ?? "").trim().replace(/^sha256\s+/i, "").toLowerCase();
  return got.length === expected.length && got === expected;
}
