import { NextResponse } from "next/server";

import { analyzeSnapshot } from "@/lib/analyzer";
import { fetchRepositorySnapshot, toPublicGitHubError } from "@/lib/github";
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

  let body: { repo?: unknown };
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
    // Public analysis intentionally never uses GitHub App installation tokens.
    // This prevents anonymous callers from accessing private repositories that
    // may have installed the RepoLens GitHub App. GITHUB_TOKEN, when provided,
    // must be scoped to public repositories only.
    const snapshot = await fetchRepositorySnapshot(
      parsed.owner,
      parsed.repo,
      process.env.GITHUB_TOKEN,
    );

    if (snapshot.repository.private) {
      return NextResponse.json(
        {
          error:
            "Repositórios privados exigirão autorização explícita em uma versão futura.",
        },
        { status: 403 },
      );
    }

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
