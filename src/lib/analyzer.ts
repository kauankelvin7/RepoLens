import type { GitHubSnapshot } from "@/lib/github";
import type {
  LanguageShare,
  Recommendation,
  RepoAnalysis,
  RepositoryEvidence,
  RepositorySignals,
  ScoreBreakdown,
  ScoreKey,
} from "@/types/analysis";

const SCORE_LABELS: Record<ScoreKey, string> = {
  documentation: "Documentação",
  automation: "CI/CD",
  security: "Segurança",
  maintenance: "Manutenção",
  engineering: "Engenharia",
};

function clamp(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreSummary(score: number) {
  if (score >= 90) return "Excelente";
  if (score >= 75) return "Sólido";
  if (score >= 60) return "Bom, com lacunas";
  if (score >= 40) return "Precisa evoluir";
  return "Prioridade alta";
}

function makeScore(key: ScoreKey, score: number): ScoreBreakdown {
  const normalized = clamp(score);
  return {
    key,
    label: SCORE_LABELS[key],
    score: normalized,
    summary: scoreSummary(normalized),
  };
}

function recommendation(
  id: string,
  title: string,
  description: string,
  severity: Recommendation["severity"],
  category: ScoreKey,
): Recommendation {
  return { id, title, description, severity, category };
}

function languageShares(languages: Record<string, number>): LanguageShare[] {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);

  if (!total) return [];

  return entries.slice(0, 6).map(([name, bytes]) => ({
    name,
    bytes,
    percentage: Math.round((bytes / total) * 1000) / 10,
  }));
}

function gradeFor(score: number): RepoAnalysis["grade"] {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function analyzeSnapshot(
  snapshot: GitHubSnapshot,
  now = new Date(),
): RepoAnalysis {
  const repository = snapshot.repository;
  const rawPaths = snapshot.paths;
  const paths = rawPaths.map((path) => path.toLowerCase());

  const matchingPaths = (patterns: RegExp[]) =>
    rawPaths
      .filter((_, index) =>
        patterns.some((pattern) => pattern.test(paths[index])),
      )
      .slice(0, 10);

  const evidence: RepositoryEvidence = {
    readme: matchingPaths([/^readme(?:\.|$)/]),
    license: matchingPaths([/^license(?:\.|$)/, /^copying(?:\.|$)/]),
    contributing: matchingPaths([
      /^contributing(?:\.|$)/,
      /^\.github\/contributing(?:\.|$)/,
    ]),
    codeOfConduct: matchingPaths([
      /^code_of_conduct(?:\.|$)/,
      /^\.github\/code_of_conduct(?:\.|$)/,
    ]),
    securityPolicy: matchingPaths([
      /^security(?:\.|$)/,
      /^\.github\/security(?:\.|$)/,
    ]),
    workflows: matchingPaths([
      /^\.github\/workflows\/[^/]+\.(yml|yaml)$/,
    ]),
    codeql: matchingPaths([
      /^\.github\/workflows\/[^/]*codeql[^/]*\.(yml|yaml)$/,
    ]),
    dependabot: matchingPaths([/^\.github\/dependabot\.yml$/]),
    lockfile: matchingPaths([
      /(^|\/)package-lock\.json$/,
      /(^|\/)pnpm-lock\.yaml$/,
      /(^|\/)yarn\.lock$/,
      /(^|\/)bun\.lockb?$/,
      /(^|\/)cargo\.lock$/,
      /(^|\/)poetry\.lock$/,
      /(^|\/)pipfile\.lock$/,
      /(^|\/)go\.sum$/,
      /(^|\/)composer\.lock$/,
      /(^|\/)gemfile\.lock$/,
    ]),
    tests: matchingPaths([
      /(^|\/)(__tests__|tests?|specs?)(\/|$)/,
      /\.(test|spec)\.[a-z0-9]+$/,
    ]),
    issueTemplates: matchingPaths([/^\.github\/issue_template\//]),
    pullRequestTemplate: matchingPaths([
      /^\.github\/pull_request_template(?:\.|\/)/,
      /^pull_request_template(?:\.|$)/,
    ]),
    docsDirectory: matchingPaths([/^docs\//]),
    envExample: matchingPaths([
      /(^|\/)\.env\.example$/,
      /(^|\/)\.env\.sample$/,
      /(^|\/)example\.env$/,
    ]),
  };

  const signals: RepositorySignals = {
    readme: evidence.readme.length > 0,
    license:
      Boolean(repository.license?.spdx_id || repository.license?.name) ||
      evidence.license.length > 0,
    contributing: evidence.contributing.length > 0,
    codeOfConduct: evidence.codeOfConduct.length > 0,
    securityPolicy: evidence.securityPolicy.length > 0,
    workflows: evidence.workflows.length,
    codeql: evidence.codeql.length > 0,
    dependabot: evidence.dependabot.length > 0,
    lockfile: evidence.lockfile.length > 0,
    tests: evidence.tests.length > 0,
    issueTemplates: evidence.issueTemplates.length > 0,
    pullRequestTemplate: evidence.pullRequestTemplate.length > 0,
    docsDirectory: evidence.docsDirectory.length > 0,
    envExample: evidence.envExample.length > 0,
    typedLanguage: Object.keys(snapshot.languages).some((language) =>
      [
        "typescript",
        "rust",
        "go",
        "java",
        "kotlin",
        "c#",
        "swift",
        "scala",
      ].includes(language.toLowerCase()),
    ),
    treeTruncated: snapshot.treeTruncated,
  };

  let documentation = 0;
  if (signals.readme) documentation += 35;
  if (repository.description) documentation += 15;
  if (signals.license) documentation += 15;
  if (signals.contributing) documentation += 10;
  if (signals.codeOfConduct) documentation += 5;
  if (repository.homepage) documentation += 5;
  if ((repository.topics?.length ?? 0) >= 3) documentation += 10;
  if (signals.docsDirectory) documentation += 5;

  let automation = 0;
  if (signals.workflows > 0) automation += 45;
  if (signals.tests) automation += 20;
  if (signals.lockfile) automation += 15;
  if (signals.dependabot) automation += 10;
  if (signals.codeql) automation += 10;

  let security = 0;
  if (signals.securityPolicy) security += 30;
  if (signals.dependabot) security += 25;
  if (signals.lockfile) security += 15;
  if (signals.codeql) security += 20;
  if (signals.envExample) security += 10;

  const pushedAt = new Date(repository.pushed_at);
  const ageDays = Number.isFinite(pushedAt.getTime())
    ? Math.max(0, (now.getTime() - pushedAt.getTime()) / 86_400_000)
    : 3650;

  let maintenance = 0;
  if (ageDays <= 30) maintenance += 30;
  else if (ageDays <= 90) maintenance += 22;
  else if (ageDays <= 180) maintenance += 12;
  else if (ageDays <= 365) maintenance += 5;
  if (signals.contributing) maintenance += 15;
  if (signals.issueTemplates) maintenance += 15;
  if (signals.pullRequestTemplate) maintenance += 15;
  if (repository.description) maintenance += 10;
  if ((repository.topics?.length ?? 0) >= 3) maintenance += 10;
  if (!repository.archived) maintenance += 5;

  let engineering = 0;
  if (signals.tests) engineering += 30;
  if (signals.typedLanguage) engineering += 20;
  if (signals.workflows > 0) engineering += 20;
  if (signals.lockfile) engineering += 15;
  if (signals.readme || signals.docsDirectory) engineering += 15;

  const scores = [
    makeScore("documentation", documentation),
    makeScore("automation", automation),
    makeScore("security", security),
    makeScore("maintenance", maintenance),
    makeScore("engineering", engineering),
  ];

  const overallScore = clamp(
    scores.reduce((sum, score) => sum + score.score, 0) / scores.length,
  );

  const recommendations: Recommendation[] = [];

  if (!signals.readme)
    recommendations.push(
      recommendation(
        "readme",
        "Crie um README de entrada forte",
        "Explique problema, proposta, arquitetura, instalação, uso e decisões técnicas.",
        "high",
        "documentation",
      ),
    );

  if (!signals.tests)
    recommendations.push(
      recommendation(
        "tests",
        "Adicione testes automatizados",
        "Cubra regras críticas e conecte a suíte ao CI para evitar regressões.",
        "high",
        "engineering",
      ),
    );

  if (!signals.workflows)
    recommendations.push(
      recommendation(
        "ci",
        "Configure integração contínua",
        "Execute lint, testes e build em cada pull request usando GitHub Actions.",
        "high",
        "automation",
      ),
    );

  if (!signals.securityPolicy)
    recommendations.push(
      recommendation(
        "security-policy",
        "Publique uma política de segurança",
        "Inclua SECURITY.md com processo responsável para reporte de vulnerabilidades.",
        "medium",
        "security",
      ),
    );

  if (!signals.dependabot)
    recommendations.push(
      recommendation(
        "dependabot",
        "Ative atualizações de dependências",
        "Use Dependabot para reduzir o tempo de exposição a dependências vulneráveis.",
        "medium",
        "security",
      ),
    );

  if (!signals.codeql)
    recommendations.push(
      recommendation(
        "codeql",
        "Adicione CodeQL ao pipeline",
        "Faça análise estática de segurança automaticamente nas branches principais.",
        "medium",
        "security",
      ),
    );

  if (!signals.contributing)
    recommendations.push(
      recommendation(
        "contributing",
        "Documente como contribuir",
        "Um CONTRIBUTING.md melhora colaboração e demonstra maturidade de engenharia.",
        "low",
        "maintenance",
      ),
    );

  if (!signals.issueTemplates || !signals.pullRequestTemplate)
    recommendations.push(
      recommendation(
        "templates",
        "Padronize issues e pull requests",
        "Templates tornam contexto, critérios de aceite e revisão mais consistentes.",
        "low",
        "maintenance",
      ),
    );

  if (!signals.license)
    recommendations.push(
      recommendation(
        "license",
        "Defina uma licença",
        "Uma licença explícita esclarece como o código pode ser usado e distribuído.",
        "low",
        "documentation",
      ),
    );

  if (repository.archived)
    recommendations.push(
      recommendation(
        "archived",
        "Confirme o estado do projeto",
        "O repositório está arquivado; mantenha esse estado apenas se o desenvolvimento realmente terminou.",
        "low",
        "maintenance",
      ),
    );

  const severityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );

  return {
    repository: {
      fullName: repository.full_name,
      name: repository.name,
      owner: repository.owner.login,
      description: repository.description,
      url: repository.html_url,
      homepage: repository.homepage,
      defaultBranch: repository.default_branch,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      openIssues: repository.open_issues_count,
      archived: repository.archived,
      pushedAt: repository.pushed_at,
      license:
        repository.license?.spdx_id ?? repository.license?.name ?? null,
      topics: repository.topics ?? [],
      visibility:
        repository.visibility ?? (repository.private ? "private" : "public"),
    },
    overallScore,
    grade: gradeFor(overallScore),
    scores,
    signals,
    evidence,
    languages: languageShares(snapshot.languages),
    recommendations: recommendations.slice(0, 8),
    analyzedAt: now.toISOString(),
  };
}
