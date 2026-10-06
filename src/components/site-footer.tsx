const PRODUCT_LINKS = [
  ["Analisar repositório", "#analyze"],
  ["Modelo de avaliação", "#method"],
  ["Limites e privacidade", "#trust"],
] as const;

const PROJECT_LINKS = [
  ["Código-fonte", "https://github.com/kauankelvin7/RepoLens"],
  ["GitHub App", "https://github.com/apps/repolens-by-kauan"],
  ["Licença MIT", "https://github.com/kauankelvin7/RepoLens/blob/main/LICENSE"],
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <div className="footer-brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation">
                <circle cx="10.5" cy="10.5" r="5.75" />
                <path d="m15 15 4.25 4.25" />
              </svg>
            </span>
            <div>
              <strong>RepoLens</strong>
              <span>Evidence-first repository diagnostics.</span>
            </div>
          </div>

          <p>
            Um analisador determinístico para repositórios públicos do GitHub.
            Explica cada nota com critérios, pesos e evidências observáveis.
          </p>
        </div>

        <div className="footer-links">
          <FooterColumn title="Produto" links={PRODUCT_LINKS} />
          <FooterColumn title="Projeto" links={PROJECT_LINKS} external />
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Kauan Kelvin Santos Barbosa</span>
        <span>Open source · MIT · GitHub Developer Program Member</span>
        <span>Projeto independente. Não afiliado ao GitHub.</span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  external = false,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
  external?: boolean;
}) {
  return (
    <div className="footer-column">
      <h2>{title}</h2>
      <ul>
        {links.map(([label, href]) => (
          <li key={href}>
            <a
              href={href}
              {...(external
                ? { target: "_blank", rel: "noreferrer" }
                : undefined)}
            >
              {label}
              {external ? <span aria-hidden="true">↗</span> : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
