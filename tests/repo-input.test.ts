import { describe, expect, it } from "vitest";

import { parseRepoReference } from "@/lib/repo-input";

describe("parseRepoReference", () => {
  it("accepts owner/repository", () => {
    expect(parseRepoReference("vercel/next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("accepts a GitHub URL and strips .git", () => {
    expect(
      parseRepoReference("https://github.com/kauankelvin7/portifolio-dev.git"),
    ).toEqual({
      owner: "kauankelvin7",
      repo: "portifolio-dev",
    });
  });

  it("rejects non-GitHub URLs", () => {
    expect(() =>
      parseRepoReference("https://gitlab.com/example/project"),
    ).toThrow(/github\.com/i);
  });
});
