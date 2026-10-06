import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label="RepoLens, início">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <circle cx="10.5" cy="10.5" r="5.75" />
              <path d="m15 15 4.25 4.25" />
            </svg>
          </span>
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
