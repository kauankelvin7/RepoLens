"use client";

import { FormEvent, useState, type CSSProperties } from "react";

import type { RepoAnalysis, Severity } from "@/types/analysis";

const EXAMPLES = [
  "kauankelvin7/RepoLens",
  "vercel/next.js",
  "facebook/react",
];

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

function isRepoAnalysis(value: unknown): value is RepoAnalysis {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<RepoAnalysis>;
  return (
    typeof candidate.overallScore === "number" &&
    Boolean(candidate.repository) &&
    Array.isArray(candidate.scores) &&
    candidate.scores.every(
      (score) => Boolean(score) && Array.isArray(score.criteria),
    ) &&
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
      id="analyze"
      aria-label="Analisador de repositório"
      aria-busy={loading}
    >
      <form className="command-card" onSubmit={analyze}>
        <div className="command-heading">
          <div>
            <span className="section-kicker">ANALISAR</span>
            <h2>Qual repositório você quer diagnosticar?</h2>
          </div>
          <span className="command-hint">repositórios públicos</span>
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
                Gerar diagnóstico
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
          <span>TESTAR COM</span>
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
            <strong>Análise interrompida</strong>
            <span>{error}</span>
          </div>
        ) : null}
      </form>

      {loading ? <LoadingState /> : null}
      {analysis ? <AnalysisDashboard analysis={analysis} /> : null}
    </section>
  );
}

function LoadingState() {
  return (
    <section className="loading-state" aria-live="polite">
      <div className="loading-copy">
        <span className="button-status-dot" aria-hidden="true" />
        <div>
          <strong>Lendo o repositório</strong>
          <p>
            Metadados, linguagens, árvore de arquivos e critérios de engenharia.
          </p>
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
            diagnóstico concluído
          </div>

          <h2 id="result-title">{repository.fullName}</h2>

          <p>
            {repository.description ??
              "Este repositório ainda não possui uma descrição pública."}
          </p>

          <div className="result-actions">
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

            {repository.homepage ? (
              <a
                href={repository.homepage}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Abrir homepage ↗
              </a>
            ) : null}
          </div>
        </div>

        <div className="score-hero" data-tone={scoreTone(analysis.overallScore)}>
          <div className="score-header">
            <span className="score-label">ÍNDICE GERAL</span>
            <span className="score-grade">Faixa {analysis.grade}</span>
          </div>

          <div className="score-number">
            <strong>{analysis.overallScore}</strong>
            <span>/100</span>
          </div>

          <div className="score-meter" style={scoreStyle(analysis.overallScore)}>
            <span />
          </div>

          <div className="score-meta">
            <span>5 PILARES · PESO IGUAL</span>
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
        <div className="section-intro">
          <div>
            <span className="section-kicker">CRITÉRIOS & EVIDÊNCIAS</span>
            <h2 id="evidence-title">De onde veio cada ponto.</h2>
          </div>

          <p>
            O score não é uma opinião. Cada linha mostra o peso máximo, os
            pontos obtidos e a evidência que sustentou o resultado.
          </p>
        </div>

        <div className="category-stack">
          {analysis.scores.map((score, index) => (
            <CategoryPanel
              key={score.key}
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
              <span className="section-kicker">CHECKLIST</span>
              <h2 id="signals-title">Controles detectados</h2>
            </div>
          </div>

          <SignalSummary analysis={analysis} />
        </section>

        <section className="surface-section" aria-labelledby="languages-title">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">STACK</span>
              <h2 id="languages-title">Linguagens principais</h2>
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
        <div className="section-intro">
          <div>
            <span className="section-kicker">PRIORIDADES</span>
            <h2 id="recommendations-title">O que vale corrigir primeiro.</h2>
          </div>
          <p>
            A fila é ordenada por severidade e aponta apenas lacunas detectadas
            no repositório analisado.
          </p>
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
              <strong>Nenhuma lacuna básica detectada.</strong>
              <p>O repositório atende aos critérios avaliados pelo modelo atual.</p>
            </div>
          </div>
        )}
      </section>

      <div className="analysis-footnote">
        <span>
          ANALISADO {formatDate(analysis.analyzedAt)} · {repository.visibility}
        </span>
        <span>
          GITHUB REST API · ÁRVORE DE ARQUIVOS · CONFIANÇA {confidence}
        </span>
      </div>
    </div>
  );
}

function CategoryPanel({
  score,
  index,
}: {
  score: RepoAnalysis["scores"][number];
  index: number;
}) {
  return (
    <article
      className="category-panel"
      data-tone={scoreTone(score.score)}
      aria-labelledby={`category-${score.key}`}
    >
      <div className="category-score">
        <span className="category-index">{String(index).padStart(2, "0")}</span>

        <div className="category-copy">
          <div className="category-title-row">
            <h3 id={`category-${score.key}`}>{score.label}</h3>
            <span>{score.summary}</span>
          </div>
          <p>{score.description}</p>
        </div>

        <strong>{score.score}</strong>
      </div>

      <div className="category-meter" style={scoreStyle(score.score)}>
        <span />
      </div>

      <div className="criteria-table">
        {score.criteria.map((item) => (
          <div className="criterion-row" key={item.id}>
            <div className="criterion-status">
              <span
                className={item.met ? "evidence-icon yes" : "evidence-icon no"}
                aria-hidden="true"
              >
                {item.met ? "✓" : "–"}
              </span>

              <div>
                <strong>{item.label}</strong>
                <small>{item.detail ?? (item.met ? "Detectado" : "Ausente")}</small>
              </div>
            </div>

            <div className="criterion-evidence">
              {item.evidence.length ? (
                item.evidence.slice(0, 2).map((path) => (
                  <code key={path} title={path}>
                    {path}
                  </code>
                ))
              ) : (
                <span className="criterion-no-file">
                  {item.detail ? "metadado do GitHub" : "sem arquivo associado"}
                </span>
              )}

              {item.evidence.length > 2 ? (
                <small>+{item.evidence.length - 2}</small>
              ) : null}
            </div>

            <div className="criterion-points">
              <strong>{item.points}</strong>
              <span>/ {item.maxPoints} pts</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function SignalSummary({ analysis }: { analysis: RepoAnalysis }) {
  const items = [
    ["README", analysis.signals.readme],
    ["GitHub Actions", analysis.signals.workflows > 0],
    ["Testes", analysis.signals.tests],
    ["SECURITY.md", analysis.signals.securityPolicy],
    ["Lockfile", analysis.signals.lockfile],
    ["CodeQL", analysis.signals.codeql],
  ] as const;

  return (
    <div className="signal-summary">
      {items.map(([label, present]) => (
        <div className="summary-row" key={label}>
          <span className={present ? "evidence-icon yes" : "evidence-icon no"}>
            {present ? "✓" : "–"}
          </span>
          <span>{label}</span>
          <small>{present ? "detectado" : "ausente"}</small>
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
