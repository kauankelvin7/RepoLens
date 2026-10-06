import { RepoLensMark } from "@/components/repolens-mark";

const PRODUCT_LINKS = [
  ["Analisar repositório", "#analyze"],
  ["Como a nota é calculada", "#method"],
  ["Privacidade e limites", "#trust"],
] as const;

const PROJECT_LINKS = [
  ["Código no GitHub", "https://github.com/kauankelvin7/RepoLens"],
  ["GitHub App", "https://github.com/apps/repolens-by-kauan"],
  ["Licença MIT", "https://github.com/kauankelvin7/RepoLens/blob/main/LICENSE"],
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <div className="footer-brand">
            <RepoLensMark className="footer-mark" />
            <div>
              <strong>RepoLens</strong>
              <span>Diagnóstico técnico com evidências que você pode conferir.</span>
            </div>
          </div>

          <p>
            O RepoLens lê os sinais públicos de um repositório e mostra, sem
            caixa-preta, de onde veio cada ponto da análise.
          </p>
        </div>

        <div className="footer-links">
          <FooterColumn title="Explorar" links={PRODUCT_LINKS} />
          <FooterColumn title="Projeto" links={PROJECT_LINKS} external />
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Kauan Kelvin Santos Barbosa</span>
        <span>Open source · MIT · GitHub Developer Program Member</span>
        <span>Projeto independente, sem afiliação com o GitHub.</span>
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
