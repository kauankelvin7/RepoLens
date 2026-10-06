import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { verifyGitHubWebhook } from "@/lib/webhook";

export const runtime = "nodejs";

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

  const cacheInvalidated = Boolean(repository);
  if (repository) {
    revalidateTag(`repo:${repository}`, "max");
  }

  console.info(
    JSON.stringify({
      scope: "github-webhook",
      event,
      delivery,
      repository: repository ?? null,
      action,
      appId,
      installationId,
      cacheInvalidated,
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
    cacheInvalidated,
  });
}
