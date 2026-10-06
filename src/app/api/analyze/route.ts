import { NextResponse } from "next/server";

import { analyzeSnapshot } from "@/lib/analyzer";
import { fetchRepositorySnapshot, toPublicGitHubError } from "@/lib/github";
import {
  getInstallationToken,
  getRepositoryInstallationToken,
  isGitHubAppAuthConfigured,
} from "@/lib/github-app";
import { consumeRateLimit } from "@/lib/rate-limit";
import { parseRepoReference } from "@/lib/repo-input";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";

  const rate = consumeRateLimit(ip, 15, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Muitas análises em pouco tempo. Tente novamente em instantes." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000)),
          ),
        },
      },
    );
  }

  let body: { repo?: unknown; installationId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (typeof body.repo !== "string" || body.repo.length > 300) {
    return NextResponse.json(
      { error: "Informe um repositório válido." },
      { status: 400 },
    );
  }

  let parsed: { owner: string; repo: string };
  try {
    parsed = parseRepoReference(body.repo);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Entrada inválida." },
      { status: 400 },
    );
  }

  try {
    let token = process.env.GITHUB_TOKEN;

    if (body.installationId !== undefined) {
      if (
        typeof body.installationId !== "number" ||
        !Number.isInteger(body.installationId)
      ) {
        return NextResponse.json(
          { error: "Installation ID inválido." },
          { status: 400 },
        );
      }
      token = await getInstallationToken(body.installationId);
    } else if (isGitHubAppAuthConfigured()) {
      try {
        token =
          (await getRepositoryInstallationToken(parsed.owner, parsed.repo)) ??
          token;
      } catch {
        // Public analysis must keep working even if App auth is temporarily
        // unavailable. The regular server token/anonymous path remains valid.
      }
    }

    const snapshot = await fetchRepositorySnapshot(
      parsed.owner,
      parsed.repo,
      token,
    );
    const analysis = analyzeSnapshot(snapshot);

    return NextResponse.json(analysis, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-RateLimit-Remaining": String(rate.remaining),
      },
    });
  } catch (error) {
    const publicError = toPublicGitHubError(error);
    return NextResponse.json(
      { error: publicError.message },
      { status: publicError.status },
    );
  }
}
