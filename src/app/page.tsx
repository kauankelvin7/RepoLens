import Link from "next/link";

import { RepoAnalyzer } from "@/components/repo-analyzer";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="RepoLens, início">
          <span className="brand-mark" aria-hidden="true">
            RL
          </span>
          <span>RepoLens</span>
        </Link>
        <div className="header-badge">
          <span className="status-dot" aria-hidden="true" />
          GitHub API · análise determinística
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">
          <span>REPOSITORY HEALTH</span>
          <span className="eyebrow-line" />
          <span>OPEN SOURCE</span>
        </div>
        <h1>
          Veja o que seu repositório comunica{" "}
          <span className="text-muted">antes de alguém abrir o código.</span>
        </h1>
        <p className="hero-copy">
          RepoLens transforma sinais objetivos do GitHub em uma leitura rápida de
          documentação, segurança, CI/CD, manutenção e qualidade de engenharia.
        </p>
      </section>

      <RepoAnalyzer />

      <footer className="site-footer">
        <p>
          RepoLens não envia código para modelos externos. A análise usa apenas
          metadados e a árvore de arquivos expostos pela API do GitHub.
        </p>
        <span>Built for engineers who prefer evidence.</span>
      </footer>
    </main>
  );
}
