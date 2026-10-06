import { NextResponse } from "next/server";

import { verifyGitHubWebhook } from "@/lib/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebhookMeta = {
  event: string;
  delivery: string | null;
  repository: string | null;
  action: string | null;
  appId: number | null;
  installationId: number | null;
  receivedAt: string;
};

declare global {
  var __repoLensLastWebhookMeta: WebhookMeta | undefined;
}

export function GET() {
  const meta = globalThis.__repoLensLastWebhookMeta;

  if (!meta) {
    return NextResponse.json(
      { ready: false },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { ready: true, ...meta },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook ainda não configurado no servidor." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyGitHubWebhook(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const event = request.headers.get("x-github-event") ?? "unknown";
  const delivery = request.headers.get("x-github-delivery") ?? null;
  const repository =
    payload.repository && typeof payload.repository === "object"
      ? (payload.repository as { full_name?: string }).full_name
      : undefined;

  const installation =
    payload.installation && typeof payload.installation === "object"
      ? (payload.installation as { id?: number; app_id?: number })
      : undefined;

  const hook =
    payload.hook && typeof payload.hook === "object"
      ? (payload.hook as { app_id?: number })
      : undefined;

  const appId = installation?.app_id ?? hook?.app_id ?? null;
  const installationId = installation?.id ?? null;
  const action = typeof payload.action === "string" ? payload.action : null;

  globalThis.__repoLensLastWebhookMeta = {
    event,
    delivery,
    repository: repository ?? null,
    action,
    appId,
    installationId,
    receivedAt: new Date().toISOString(),
  };

  console.info(
    JSON.stringify({
      scope: "github-webhook",
      event,
      delivery,
      repository: repository ?? null,
      action,
      appId,
      installationId,
    }),
  );

  return NextResponse.json({
    ok: true,
    event,
    delivery,
    repository: repository ?? null,
    action,
    appId,
    installationId,
  });
}
