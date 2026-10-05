import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyGitHubWebhook(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
) {
  if (!signatureHeader?.startsWith("sha256=") || !secret) return false;

  const expected = `sha256=${createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;

  const actualBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
