import { describe, expect, it } from "vitest";

import { analyzeSnapshot } from "@/lib/analyzer";
import type { GitHubSnapshot } from "@/lib/github";

function snapshot(overrides: Partial<GitHubSnapshot> = {}): GitHubSnapshot {
  return {
    repository: {
      name: "repolens",
      full_name: "example/repolens",
      html_url: "https://github.com/example/repolens",
      description: "Repository health analyzer",
      homepage: "https://example.dev",
      default_branch: "main",
      stargazers_count: 10,
      forks_count: 2,
      open_issues_count: 1,
      archived: false,
      pushed_at: "2026-10-01T12:00:00Z",
      visibility: "public",
      private: false,
      topics: ["github", "engineering", "security"],
      license: { spdx_id: "MIT", name: "MIT License" },
      owner: { login: "example" },
    },
    languages: { TypeScript: 900, CSS: 100 },
    paths: [
      "README.md",
      "LICENSE",
      "CONTRIBUTING.md",
      "CODE_OF_CONDUCT.md",
      "SECURITY.md",
      ".env.example",
      "package-lock.json",
      "tests/analyzer.test.ts",
      "docs/ARCHITECTURE.md",
      ".github/dependabot.yml",
      ".github/workflows/ci.yml",
      ".github/workflows/codeql.yml",
      ".github/ISSUE_TEMPLATE/bug_report.yml",
      ".github/pull_request_template.md",
    ],
    treeTruncated: false,
    ...overrides,
  };
}

describe("analyzeSnapshot", () => {
  it("rewards a well maintained repository", () => {
    const result = analyzeSnapshot(
      snapshot(),
      new Date("2026-10-05T12:00:00Z"),
    );

    expect(result.overallScore).toBeGreaterThanOrEqual(95);
    expect(result.grade).toBe("A");
    expect(result.signals.tests).toBe(true);
    expect(result.signals.codeql).toBe(true);
    expect(result.evidence.readme).toEqual(["README.md"]);
    expect(result.evidence.workflows).toEqual([
      ".github/workflows/ci.yml",
      ".github/workflows/codeql.yml",
    ]);
    expect(result.evidence.tests).toContain("tests/analyzer.test.ts");
    expect(result.recommendations).toHaveLength(0);
  });

  it("prioritizes fundamental gaps", () => {
    const weak = snapshot({
      repository: {
        ...snapshot().repository,
        description: null,
        homepage: null,
        topics: [],
        license: null,
        pushed_at: "2024-01-01T00:00:00Z",
      },
      languages: { JavaScript: 100 },
      paths: ["index.js"],
    });

    const result = analyzeSnapshot(
      weak,
      new Date("2026-10-05T12:00:00Z"),
    );

    expect(result.overallScore).toBeLessThan(30);
    expect(result.grade).toBe("F");
    expect(result.recommendations.slice(0, 3).map((item) => item.id)).toEqual([
      "readme",
      "tests",
      "ci",
    ]);
  });
});
