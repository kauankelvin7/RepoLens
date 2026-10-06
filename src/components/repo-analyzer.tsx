"use client";

import { FormEvent, useState, type CSSProperties } from "react";

import type {
  RepoAnalysis,
  RepositoryEvidence,
  ScoreKey,
  Severity,
} from "@/types/analysis";

const EXAMPLES = [
  "kauankelvin7/RepoLens",
  "vercel/next.js",
  "facebook/react",
];

const PREVIEW_GROUPS = [
  {
    index: "01",
    title: "Documentation",
    description: "README · docs · contributing · license",
  },
  {
    index: "02",
    title: "Engineering",
    description: "tests · CI/CD · dependency health",
  },
  {
    index: "03",
    title: "Security",
    description: "workflows · policies · repository hygiene",
  },
];

type EvidenceKey = keyof RepositoryEvidence;

interface EvidenceDefinition {
  label: string;
  signal:
    | keyof RepoAnalysis["signals"]
    | "repositoryDescription"
    | "repositoryLicense"
    | "repositoryTopics";
  evidence?: EvidenceKey;
  detail?: (analysis: RepoAnalysis) => string | null;
}

const CATEGORY_COPY: Record<
  ScoreKey,
  {
    description: string;
    definitions: EvidenceDefinition[];
  }
> = {
  documentation: {
    description:
      "Avalia se alguém consegue compreender, usar e contribuir sem depender de contexto externo.",
    definitions: [
      { label: "README", signal: "readme", evidence: "readme" },
      {
        label: "Descrição do repositório",
        signal: "repositoryDescription",
        detail: (analysis) => analysis.repository.description,
      },
      {
        label: "Licença",
        signal: "repositoryLicense",
        evidence: "license",
        detail: (analysis) => analysis.repository.license,
      },
      {
        label: "Guia de contribuição",
        signal: "contributing",
        evidence: "contributing",
      },
      {
        label: "Documentação dedicada",
        signal: "docsDirectory",
        evidence: "docsDirectory",
      },
      {
        label: "Tópicos do repositório",
        signal: "repositoryTopics",
        detail: (analysis) =>
          analysis.repository.topics.length
            ? analysis.repository.topics.join(" · ")
            : null,
      },
    ],
  },
  automation: {
    description:
      "Observa validação automática, workflows e sinais de manutenção contínua.",
    definitions: [
      {
        label: "GitHub Actions",
        signal: "workflows",
        evidence: "workflows",
      },
      { label: "Testes detectados", signal: "tests", evidence: "tests" },
      {
        label: "Dependabot",
        signal: "dependabot",
        evidence: "dependabot",
      },
      { label: "CodeQL", signal: "codeql", evidence: "codeql" },
      { label: "Lockfile", signal: "lockfile", evidence: "lockfile" },
    ],
  },
  security: {
    description:
      "Procura políticas, análise estática e controles que reduzem risco operacional.",
    definitions: [
      {
        label: "Política de segurança",
        signal: "securityPolicy",
        evidence: "securityPolicy",
      },
      {
        label: "Dependabot",
        signal: "dependabot",
        evidence: "dependabot",
      },
      { label: "CodeQL", signal: "codeql", evidence: "codeql" },
      { label: "Lockfile", signal: "lockfile", evidence: "lockfile" },
      {
        label: "Exemplo de ambiente",
        signal: "envExample",
        evidence: "envExample",
      },
    ],
  },
  maintenance: {
    description:
      "Mede sinais de colaboração, atividade recente e organização do fluxo de contribuição.",
    definitions: [
      {
        label: "Guia de contribuição",
        signal: "contributing",
        evidence: "contributing",
      },
      {
        label: "Issue templates",
        signal: "issueTemplates",
        evidence: "issueTemplates",
      },
      {
        label: "Pull request template",
        signal: "pullRequestTemplate",
        evidence: "pullRequestTemplate",
      },
      {
        label: "Documentação dedicada",
        signal: "docsDirectory",
        evidence: "docsDirectory",
      },
      {
        label: "Descrição do repositório",
        signal: "repositoryDescription",
        detail: (analysis) => analysis.repository.description,
      },
    ],
  },
  engineering: {
    description:
      "Sintetiza testes, tipagem, automação e sinais estruturais da base.",
    definitions: [
      { label: "Testes", signal: "tests", evidence: "tests" },
      { label: "Linguagem tipada", signal: "typedLanguage" },
      {
        label: "GitHub Actions",
        signal: "workflows",
        evidence: "workflows",
      },
      { label: "Lockfile", signal: "lockfile", evidence: "lockfile" },
      { label: "README", signal: "readme", evidence: "readme" },
    ],
  },
};

function scoreStyle(score: number) {
  return {
    "--score-value": `${score}%`,
  } as CSSProperties;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function severityLabel(severity: Severity) {
  return {
    high: "Prioridade alta",
    medium: "Prioridade média",
    low: "Melhoria",
  }[severity];
}

function scoreTone(score: number) {
  if (score >= 75) return "good";
  if (score >= 50) return "warning";
  return "danger";
}

function signalPresent(
  analysis: RepoAnalysis,
  definition: EvidenceDefinition,
) {
  if (definition.signal === "repositoryDescription") {
    return Boolean(analysis.repository.description);
  }
  if (definition.signal === "repositoryLicense") {
    return Boolean(analysis.repository.license);
  }
  if (definition.signal === "repositoryTopics") {
    return analysis.repository.topics.length >= 3;
  }

  const value = analysis.signals[definition.signal];
  return typeof value === "number" ? value > 0 : value;
}

function isRepoAnalysis(value: unknown): value is RepoAnalysis {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<RepoAnalysis>;
  return (
    typeof candidate.overallScore === "number" &&
    Boolean(candidate.repository) &&
    Boolean(candidate.evidence) &&
    Array.isArray(candidate.scores) &&
    Array.isArray(candidate.recommendations)
  );
}

export function RepoAnalyzer() {
  const [repo, setRepo] = useState("kauankelvin7/RepoLens");
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze(event?: FormEvent) {
    event?.preventDefault();
    const value = repo.trim();
    if (!value || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: value }),
      });

      const data: unknown = await response.json();

      if (!response.ok || !isRepoAnalysis(data)) {
        const message =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Não foi possível analisar o repositório.";
        throw new Error(message);
      }

      setAnalysis(data);
    } catch (caught) {
      setAnalysis(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível analisar o repositório.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="analyzer-shell"
      aria-label="Analisador de repositório"
      aria-busy={loading}
    >
      <form className="command-card" onSubmit={analyze}>
        <div className="command-heading">
          <span className="section-kicker">ANALISAR REPOSITÓRIO</span>
          <span className="command-hint">somente repositórios públicos</span>
        </div>

        <label className="sr-only" htmlFor="repo-input">
          Repositório GitHub
        </label>

        <div className="command-row">
          <div className="repo-input-wrap">
            <span className="repo-prefix" aria-hidden="true">
              github.com/
            </span>
            <input
              id="repo-input"
              value={repo}
              onChange={(event) => setRepo(event.target.value)}
              placeholder="owner/repository"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={error ? "repo-error" : "repo-help"}
            />
          </div>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? (
              <>
                Analisando
                <span className="button-status-dot" aria-hidden="true" />
              </>
            ) : (
              <>
                Analisar
                <span className="button-arrow" aria-hidden="true">
                  ↗
                </span>
              </>
            )}
          </button>
        </div>

        <p className="sr-only" id="repo-help">
          Informe owner/repository ou cole uma URL pública do GitHub.
        </p>

        <div className="example-row" aria-label="Exemplos de repositório">
          <span>EXEMPLOS</span>
          {EXAMPLES.map((example) => (
            <button
              className="example-chip"
              key={example}
              type="button"
              onClick={() => setRepo(example)}
            >
              {example}
            </button>
          ))}
        </div>

        {error ? (
          <div className="form-error" id="repo-error" role="alert">
            <strong>Não foi possível analisar</strong>
            <span>{error}</span>
          </div>
        ) : null}
      </form>

      {!analysis && !loading ? <SignalsPreview /> : null}
      {loading ? <LoadingState /> : null}
      {analysis ? <AnalysisDashboard analysis={analysis} /> : null}
    </section>
  );
}

function SignalsPreview() {
  return (
    <section className="signals-preview" aria-labelledby="signals-preview-title">
      <span className="ghost-word" aria-hidden="true">
        EVIDENCE
      </span>

      <div className="preview-heading">
        <div>
          <span className="section-kicker">O QUE ANALISAMOS</span>
          <h2 id="signals-preview-title">
            Sinais técnicos,
            <br />
            não impressões.
          </h2>
        </div>
        <p>
          Cada conclusão nasce de evidências verificáveis na estrutura pública
          do repositório. Antes da primeira análise, nenhum score é inventado.
        </p>
      </div>

      <div className="preview-grid">
        {PREVIEW_GROUPS.map((group) => (
          <article className="signal-card" key={group.title}>
            <span className="signal-index">{group.index}</span>
            <div>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
            </div>
            <span className="signal-card-arrow" aria-hidden="true">
              ↗
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <section className="loading-state" aria-live="polite">
      <div className="loading-copy">
        <span className="button-status-dot" aria-hidden="true" />
        <div>
          <strong>Lendo sinais verificáveis</strong>
          <p>Metadados, linguagens e árvore do repositório.</p>
        </div>
      </div>

      <div className="skeleton-grid" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

function AnalysisDashboard({ analysis }: { analysis: RepoAnalysis }) {
  const repository = analysis.repository;
  const confidence = analysis.signals.treeTruncated ? "Média" : "Alta";

  return (
    <div className="results" aria-live="polite">
      <section className="result-hero" aria-labelledby="result-title">
        <div className="result-identity">
          <div className="result-status">
            <span className="status-dot" aria-hidden="true" />
            análise concluída
          </div>
          <h2 id="result-title">{repository.fullName}</h2>
          <p>
            {repository.description ??
              "Este repositório ainda não possui uma descrição pública."}
          </p>
          <a
            href={repository.url}
            target="_blank"
            rel="noreferrer"
            className="secondary-button"
          >
            Abrir no GitHub
            <span className="button-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>

        <div className="score-hero" data-tone={scoreTone(analysis.overallScore)}>
          <span className="score-label">SCORE GERAL</span>
          <div className="score-number">
            <strong>{analysis.overallScore}</strong>
            <span>/100</span>
          </div>
          <div className="score-meter" style={scoreStyle(analysis.overallScore)}>
            <span />
          </div>
          <div className="score-meta">
            <span>GRADE {analysis.grade}</span>
            <span>CONFIANÇA {confidence.toUpperCase()}</span>
          </div>
        </div>
      </section>

      <section className="repository-facts" aria-label="Metadados do repositório">
        <Stat label="Stars" value={repository.stars.toLocaleString("pt-BR")} />
        <Stat label="Forks" value={repository.forks.toLocaleString("pt-BR")} />
        <Stat
          label="Issues"
          value={repository.openIssues.toLocaleString("pt-BR")}
        />
        <Stat label="Branch" value={repository.defaultBranch} mono />
        <Stat label="Licença" value={repository.license ?? "Não detectada"} />
        <Stat label="Último push" value={formatDate(repository.pushedAt)} />
      </section>

      <section className="evidence-section" aria-labelledby="evidence-title">
        <div className="section-heading editorial">
          <div>
            <span className="section-kicker">EVIDENCE-FIRST UI</span>
            <h2 id="evidence-title">Por que o RepoLens concluiu isso?</h2>
          </div>
          <p>
            Cada score abaixo mostra os sinais que contribuíram para o
            diagnóstico e as referências técnicas encontradas.
          </p>
        </div>

        <div className="category-stack">
          {analysis.scores.map((score, index) => (
            <CategoryPanel
              key={score.key}
              analysis={analysis}
              score={score}
              index={index + 1}
            />
          ))}
        </div>
      </section>

      <div className="support-grid">
        <section className="surface-section" aria-labelledby="signals-title">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">SINAIS</span>
              <h2 id="signals-title">Leitura rápida</h2>
            </div>
          </div>

          <SignalSummary analysis={analysis} />
        </section>

        <section className="surface-section" aria-labelledby="languages-title">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">LINGUAGENS</span>
              <h2 id="languages-title">Distribuição</h2>
            </div>
          </div>

          {analysis.languages.length ? (
            <div className="language-list">
              {analysis.languages.map((language) => (
                <div className="language-row" key={language.name}>
                  <div className="language-meta">
                    <span>{language.name}</span>
                    <strong>{language.percentage}%</strong>
                  </div>
                  <div className="language-track">
                    <span style={{ width: `${language.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="notice">Nenhuma linguagem foi reportada pelo GitHub.</p>
          )}
        </section>
      </div>

      <section
        className="recommendations-section"
        aria-labelledby="recommendations-title"
      >
        <div className="section-heading editorial">
          <div>
            <span className="section-kicker">PRÓXIMAS MELHORIAS</span>
            <h2 id="recommendations-title">Onde agir primeiro.</h2>
          </div>
          <p>Ordenado por impacto técnico, sem recomendações genéricas.</p>
        </div>

        {analysis.recommendations.length ? (
          <div className="recommendation-list">
            {analysis.recommendations.map((item, index) => (
              <article className="recommendation-card" key={item.id}>
                <span className="recommendation-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="recommendation-title-row">
                    <h3>{item.title}</h3>
                    <span
                      className="severity"
                      data-severity={item.severity}
                    >
                      {severityLabel(item.severity)}
                    </span>
                  </div>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="perfect-state">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <strong>Nenhuma recomendação básica pendente.</strong>
              <p>O repositório atende a todos os sinais avaliados pelo MVP.</p>
            </div>
          </div>
        )}
      </section>

      <div className="analysis-footnote">
        <span>
          ANALISADO {formatDate(analysis.analyzedAt)} · {repository.visibility}
        </span>
        <span>
          ORIGEM · GITHUB REST API + ÁRVORE DE ARQUIVOS · CONFIANÇA {confidence}
        </span>
      </div>
    </div>
  );
}

function CategoryPanel({
  analysis,
  score,
  index,
}: {
  analysis: RepoAnalysis;
  score: RepoAnalysis["scores"][number];
  index: number;
}) {
  const category = CATEGORY_COPY[score.key];

  return (
    <article
      className="category-panel"
      data-tone={scoreTone(score.score)}
      aria-labelledby={`category-${score.key}`}
    >
      <div className="category-score">
        <span className="category-index">{String(index).padStart(2, "0")}</span>
        <div>
          <h3 id={`category-${score.key}`}>{score.label}</h3>
          <p>{category.description}</p>
        </div>
        <strong>{score.score}</strong>
      </div>

      <div className="category-meter" style={scoreStyle(score.score)}>
        <span />
      </div>

      <div className="evidence-list">
        {category.definitions.map((definition) => {
          const present = signalPresent(analysis, definition);
          const paths = definition.evidence
            ? analysis.evidence[definition.evidence]
            : [];
          const detail = definition.detail?.(analysis);

          return (
            <div className="evidence-row" key={definition.label}>
              <div className="evidence-status">
                <span
                  className={present ? "evidence-icon yes" : "evidence-icon no"}
                  aria-hidden="true"
                >
                  {present ? "✓" : "–"}
                </span>
                <div>
                  <strong>{definition.label}</strong>
                  <small>{present ? "Detectado" : "Ausente"}</small>
                </div>
              </div>

              <div className="evidence-references">
                {paths.length
                  ? paths.slice(0, 3).map((path) => (
                      <code key={path} title={path}>
                        {path}
                      </code>
                    ))
                  : detail
                    ? <span>{detail}</span>
                    : <span className="evidence-empty">sem referência detectada</span>}
                {paths.length > 3 ? (
                  <small>+{paths.length - 3} referências</small>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function SignalSummary({ analysis }: { analysis: RepoAnalysis }) {
  const items = [
    ["README", analysis.signals.readme],
    ["CI/CD", analysis.signals.workflows > 0],
    ["TESTS", analysis.signals.tests],
    ["SECURITY", analysis.signals.securityPolicy],
    ["DEPENDENCIES", analysis.signals.lockfile],
    ["CODEQL", analysis.signals.codeql],
  ] as const;

  return (
    <div className="signal-summary">
      {items.map(([label, present]) => (
        <div className="summary-row" key={label}>
          <span className={present ? "evidence-icon yes" : "evidence-icon no"}>
            {present ? "✓" : "–"}
          </span>
          <span>{label}</span>
          <small>{present ? "detected" : "missing"}</small>
        </div>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong className={mono ? "mono" : undefined} title={value}>
        {value}
      </strong>
    </div>
  );
}
