import Link from "next/link";

import { RepoLensMark } from "@/components/repolens-mark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label="RepoLens, início">
          <RepoLensMark />
          <span className="brand-copy">
            <strong>RepoLens</strong>
            <small>Repository diagnostics</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Navegação principal">
          <a href="#analyze">Analisar</a>
          <a href="#method">Método</a>
          <a href="#trust">Confiança</a>
          <a
            href="https://github.com/kauankelvin7/RepoLens"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </nav>

        <a className="header-cta" href="#analyze">
          Analisar repo
          <span aria-hidden="true">↘</span>
        </a>
      </div>
    </header>
  );
}
