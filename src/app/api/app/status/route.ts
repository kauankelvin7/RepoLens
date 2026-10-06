import { NextResponse } from "next/server";

import {
  isGitHubAppAuthConfigured,
  isGitHubAppConfigured,
  validateGitHubAppAuthentication,
} from "@/lib/github-app";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const authConfigured = isGitHubAppAuthConfigured();

  let authenticated = false;
  let appId: number | null = null;
  let appSlug: string | null = process.env.GITHUB_APP_SLUG ?? null;

  if (authConfigured) {
    try {
      const app = await validateGitHubAppAuthentication();
      authenticated = true;
      appId = app.id;
      appSlug = app.slug ?? appSlug;
    } catch {
      authenticated = false;
    }
  }

  return NextResponse.json(
    {
      configured: isGitHubAppConfigured(),
      authConfigured,
      authenticated,
      webhookConfigured: Boolean(process.env.GITHUB_WEBHOOK_SECRET),
      appSlugConfigured: Boolean(process.env.GITHUB_APP_SLUG),
      appId,
      appSlug,
      serverTokenConfigured: Boolean(process.env.GITHUB_TOKEN),
      publicAnalysisAvailable: true,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
