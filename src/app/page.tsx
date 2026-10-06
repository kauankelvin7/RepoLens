import Link from "next/link";

import { RepoAnalyzer } from "@/components/repo-analyzer";

export default function Home() {
  return (
    <main className="page-frame">
      <div className="page-shell">
        <header className="site-header">
          <Link className="brand" href="/" aria-label="RepoLens, início">
            <span className="brand-mark" aria-hidden="true">
              RL
            </span>
            <span className="brand-name">RepoLens</span>
          </Link>

          <div className="api-status" aria-label="GitHub API disponível">
            <span className="status-dot" aria-hidden="true" />
            <span className="api-status-copy">
              <strong>GITHUB API</strong>
              <small>análise determinística</small>
            </span>
          </div>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-eyebrow">
            <span>REPOSITORY HEALTH</span>
            <span className="eyebrow-line" aria-hidden="true" />
            <span>OPEN SOURCE</span>
          </div>

          <h1 id="hero-title" className="hero-title">
            <span className="hero-primary">
              Veja o que seu repositório{" "}
              <br />
              comunica
            </span>
            <span className="hero-secondary">
              antes de alguém{" "}
              <br />
              abrir o código.
            </span>
          </h1>

          <p className="hero-description">
            RepoLens transforma sinais verificáveis do GitHub em uma leitura
            técnica de documentação, CI/CD, segurança, manutenção e qualidade
            de engenharia — sem depender de uma caixa-preta.
          </p>
        </section>

        <RepoAnalyzer />

        <footer className="trust-section" aria-labelledby="trust-title">
          <div className="trust-copy">
            <span className="section-kicker">PRIVACIDADE</span>
            <h2 id="trust-title">Built on evidence.</h2>
            <p>
              Nenhum código é enviado para modelos externos. A análise pública
              usa metadados, linguagens e a árvore exposta pela API do GitHub.
            </p>
          </div>

          <div className="trust-points" aria-label="Princípios de confiança">
            <span>
              <span className="status-dot" aria-hidden="true" />
              Privacy-first
            </span>
            <span>
              <span className="status-dot" aria-hidden="true" />
              Deterministic
            </span>
            <span>
              <span className="status-dot" aria-hidden="true" />
              GitHub API only
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
