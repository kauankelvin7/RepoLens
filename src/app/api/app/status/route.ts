import { NextResponse } from "next/server";

import { isGitHubAppConfigured } from "@/lib/github-app";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    configured: isGitHubAppConfigured(),
    appSlugConfigured: Boolean(process.env.GITHUB_APP_SLUG),
    serverTokenConfigured: Boolean(process.env.GITHUB_TOKEN),
    publicAnalysisAvailable: true,
  });
}
