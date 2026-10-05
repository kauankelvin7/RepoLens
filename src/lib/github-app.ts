import { createSign } from "node:crypto";

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

export function isGitHubAppConfigured() {
  return Boolean(
    process.env.GITHUB_APP_ID &&
      process.env.GITHUB_PRIVATE_KEY &&
      process.env.GITHUB_WEBHOOK_SECRET,
  );
}

export function createGitHubAppJwt() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!appId || !privateKey) {
    throw new Error("GitHub App não configurado.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: appId,
    }),
  );

  const unsigned = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256")
    .update(unsigned)
    .sign(privateKey)
    .toString("base64url");

  return `${unsigned}.${signature}`;
}

export async function getInstallationToken(installationId: number) {
  if (!Number.isInteger(installationId) || installationId <= 0) {
    throw new Error("Installation ID inválido.");
  }

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${createGitHubAppJwt()}`,
        "User-Agent": "RepoLens",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Falha ao criar installation token (${response.status}).`);
  }

  const data = (await response.json()) as { token?: string };
  if (!data.token) throw new Error("GitHub não retornou installation token.");

  return data.token;
}
