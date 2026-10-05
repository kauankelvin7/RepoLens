"use client";

import { FormEvent, useState, type CSSProperties } from "react";

import type { RepoAnalysis, Severity } from "@/types/analysis";

const EXAMPLES = [
  "kauankelvin7/portifolio-dev",
  "vercel/next.js",
  "facebook/react",
];

const SIGNAL_LABELS: Array<[keyof RepoAnalysis["signals"], string]> = [
  ["readme", "README"],
  ["license", "Licença"],
  ["contributing", "Contribuição"],
  ["securityPolicy", "SECURITY.md"],
  ["tests", "Testes"],
  ["workflows", "GitHub Actions"],
  ["dependabot", "Dependabot"],
  ["codeql", "CodeQL"],
  ["issueTemplates", "Issue templates"],
  ["pullRequestTemplate", "PR template"],
  ["lockfile", "Lockfile"],
  ["typedLanguage", "Linguagem tipada"],
];

function scoreStyle(score: number) {
  return {
    "--score-angle": `${score * 3.6}deg`,
  } as CSSProperties;
}

function isSignalPresent(
  value: RepoAnalysis["signals"][keyof RepoAnalysis["signals"]],
) {
  return typeof value === "number" ? value > 0 : value;
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

function isRepoAnalysis(value: unknown): value is RepoAnalysis {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<RepoAnalysis>;
  return (
    typeof candidate.overallScore === "number" &&
    Boolean(candidate.repository) &&
    Array.isArray(candidate.scores) &&
    Array.isArray(candidate.recommendations)
  );
}

export function RepoAnalyzer() {
  const [repo, setRepo] = useState("kauankelvin7/portifolio-dev");
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
    <section className="analyzer-shell" aria-label="Analisador de repositório">
      <form className="search-panel" onSubmit={analyze}>
        <label htmlFor="repo-input">Repositório GitHub</label>
        <div className="search-row">
          <div className="input-wrap">
            <span aria-hidden="true">github.com/</span>
            <input
              id="repo-input"
              value={repo}
              onChange={(event) => setRepo(event.target.value)}
              placeholder="usuario/repositorio"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={error ? "repo-error" : undefined}
            />
          </div>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Analisando
              </>
            ) : (
              <>
                Analisar
                <span aria-hidden="true">↗</span>
              </>
            )}
          </button>
        </div>

        <div className="examples" aria-label="Exemplos">
          <span>Testar:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setRepo(example)}
            >
              {example}
            </button>
          ))}
        </div>

        {error ? (
          <p className="form-error" id="repo-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {!analysis && !loading ? (
        <div className="empty-state">
          <div className="empty-grid" aria-hidden="true">
            <span>README</span>
            <span>CI/CD</span>
            <span>TESTS</span>
            <span>SECURITY</span>
            <span>DOCS</span>
            <span>DEPENDENCIES</span>
          </div>
          <div>
            <strong>Uma leitura técnica em segundos.</strong>
            <p>
              Informe um repositório público para gerar um diagnóstico baseado
              em sinais verificáveis da própria base.
            </p>
          </div>
        </div>
      ) : null}

      {loading ? <LoadingState /> : null}
      {analysis ? <AnalysisDashboard analysis={analysis} /> : null}
    </section>
  );
}

function LoadingState() {
  return (
    <div className="loading-state" aria-live="polite">
      <div className="loading-orbit">
        <span />
        <span />
      </div>
      <div>
        <strong>Lendo o repositório</strong>
        <p>Metadados, linguagens e árvore de arquivos.</p>
      </div>
    </div>
  );
}

function AnalysisDashboard({ analysis }: { analysis: RepoAnalysis }) {
  const repository = analysis.repository;

  return (
    <div className="results" aria-live="polite">
      <div className="repo-heading">
        <div>
          <div className="repo-kicker">
            <span className="status-dot" />
            análise concluída
          </div>
          <h2>{repository.fullName}</h2>
          <p>
            {repository.description ??
              "Este repositório ainda não possui uma descrição pública."}
          </p>
        </div>
        <a
          href={repository.url}
          target="_blank"
          rel="noreferrer"
          className="secondary-button"
        >
          Abrir no GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="overview-grid">
        <article className="overall-card">
          <div
            className="score-ring"
            style={scoreStyle(analysis.overallScore)}
            aria-label={`Nota geral ${analysis.overallScore} de 100`}
          >
            <div>
              <strong>{analysis.overallScore}</strong>
              <span>/100</span>
            </div>
          </div>
          <div className="overall-copy">
            <span className="grade">GRADE {analysis.grade}</span>
            <h3>Saúde geral do repositório</h3>
            <p>
              Uma síntese equilibrada dos cinco pilares avaliados pelo RepoLens.
            </p>
          </div>
        </article>

        <div className="repo-stats">
          <Stat label="Stars" value={repository.stars.toLocaleString("pt-BR")} />
          <Stat label="Forks" value={repository.forks.toLocaleString("pt-BR")} />
          <Stat
            label="Issues"
            value={repository.openIssues.toLocaleString("pt-BR")}
          />
          <Stat label="Branch" value={repository.defaultBranch} />
          <Stat label="Licença" value={repository.license ?? "Não detectada"} />
          <Stat label="Último push" value={formatDate(repository.pushedAt)} />
        </div>
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="section-index">01</span>
            <h3>Pilares de engenharia</h3>
          </div>
          <p>Notas de 0 a 100 calculadas por sinais observáveis.</p>
        </div>
        <div className="score-grid">
          {analysis.scores.map((score) => (
            <article className="score-card" key={score.key}>
              <div className="score-topline">
                <span>{score.label}</span>
                <strong>{score.score}</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${score.score}%` }} />
              </div>
              <p>{score.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="two-column">
        <section className="section-block">
          <div className="section-heading compact">
            <div>
              <span className="section-index">02</span>
              <h3>Sinais detectados</h3>
            </div>
          </div>
          <div className="signals-grid">
            {SIGNAL_LABELS.map(([key, label]) => {
              const value = analysis.signals[key];
              const present = isSignalPresent(value);
              return (
                <div className="signal-row" key={key}>
                  <span className={present ? "signal yes" : "signal no"}>
                    {present ? "✓" : "—"}
                  </span>
                  <span>{label}</span>
                  {typeof value === "number" && value > 0 ? (
                    <small>{value}</small>
                  ) : null}
                </div>
              );
            })}
          </div>
          {analysis.signals.treeTruncated ? (
            <p className="notice">
              A árvore retornada pelo GitHub foi truncada; alguns sinais podem
              não ter sido detectados.
            </p>
          ) : null}
        </section>

        <section className="section-block">
          <div className="section-heading compact">
            <div>
              <span className="section-index">03</span>
              <h3>Linguagens</h3>
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

      <section className="section-block recommendations">
        <div className="section-heading">
          <div>
            <span className="section-index">04</span>
            <h3>Próximas melhorias</h3>
          </div>
          <p>Ordenadas por impacto técnico.</p>
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
                    <h4>{item.title}</h4>
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
            <strong>Nenhuma recomendação básica pendente.</strong>
            <p>O repositório atende a todos os sinais avaliados pelo MVP.</p>
          </div>
        )}
      </section>

      <div className="analysis-footnote">
        <span>
          Analisado em {formatDate(analysis.analyzedAt)} · visibilidade{" "}
          {repository.visibility}
        </span>
        <span>Sem envio de código-fonte a terceiros.</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong title={value}>{value}</strong>
    </div>
  );
}
