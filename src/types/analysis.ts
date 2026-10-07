export type ScoreKey =
  | "documentation"
  | "automation"
  | "security"
  | "maintenance"
  | "engineering";

export type Severity = "high" | "medium" | "low";

export interface ScoreCriterion {
  id: string;
  label: string;
  points: number;
  maxPoints: number;
  met: boolean;
  detail: string | null;
  evidence: string[];
}

export interface ScoreBreakdown {
  key: ScoreKey;
  label: string;
  description: string;
  score: number;
  summary: string;
  criteria: ScoreCriterion[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: ScoreKey;
}

export interface LanguageShare {
  name: string;
  bytes: number;
  percentage: number;
}

export interface RepositorySummary {
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  url: string;
  homepage: string | null;
  defaultBranch: string;
  stars: number;
  forks: number;
  openIssues: number;
  archived: boolean;
  pushedAt: string;
  license: string | null;
  topics: string[];
  visibility: string;
}

export interface RepositorySignals {
  readme: boolean;
  license: boolean;
  contributing: boolean;
  codeOfConduct: boolean;
  securityPolicy: boolean;
  workflows: number;
  codeql: boolean;
  dependabot: boolean;
  dependencyUpdates: boolean;
  lockfile: boolean;
  tests: boolean;
  securityTests: boolean;
  securityDocs: boolean;
  accessPolicies: boolean;
  issueTemplates: boolean;
  pullRequestTemplate: boolean;
  docsDirectory: boolean;
  envExample: boolean;
  typedLanguage: boolean;
  treeTruncated: boolean;
}

export interface RepositoryEvidence {
  readme: string[];
  license: string[];
  contributing: string[];
  codeOfConduct: string[];
  securityPolicy: string[];
  workflows: string[];
  codeql: string[];
  dependabot: string[];
  dependencyUpdates: string[];
  lockfile: string[];
  tests: string[];
  securityTests: string[];
  securityDocs: string[];
  accessPolicies: string[];
  issueTemplates: string[];
  pullRequestTemplate: string[];
  docsDirectory: string[];
  envExample: string[];
}

export interface RepoAnalysis {
  repository: RepositorySummary;
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  scores: ScoreBreakdown[];
  signals: RepositorySignals;
  evidence: RepositoryEvidence;
  languages: LanguageShare[];
  recommendations: Recommendation[];
  analyzedAt: string;
}
