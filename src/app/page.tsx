import { MethodSection, TrustSection } from "@/components/landing-sections";
import { RepoAnalyzer } from "@/components/repo-analyzer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="site-main">
        <div className="page-shell">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-eyebrow">
              <span>GITHUB REPOSITORY DIAGNOSTICS</span>
              <span className="eyebrow-line" aria-hidden="true" />
              <span>PUBLIC REPOS</span>
            </div>

            <h1 id="hero-title" className="hero-title">
              <span className="hero-primary">
                Meça a maturidade{" "}
                <br />
                do seu repositório.
              </span>
              <span className="hero-secondary">
                Com critérios verificáveis.
              </span>
            </h1>

            <div className="hero-support">
              <p className="hero-description">
                RepoLens transforma a estrutura pública do GitHub em um
                diagnóstico explicável de documentação, CI/CD, segurança,
                manutenção e qualidade de engenharia.
              </p>

              <dl className="hero-metrics" aria-label="Como o RepoLens funciona">
                <div>
                  <dt>5</dt>
                  <dd>pilares</dd>
                </div>
                <div>
                  <dt>3</dt>
                  <dd>requisições GitHub</dd>
                </div>
                <div>
                  <dt>0</dt>
                  <dd>código enviado a IA</dd>
                </div>
              </dl>
            </div>
          </section>

          <RepoAnalyzer />
          <MethodSection />
          <TrustSection />
        </div>
      </main>

      <div className="page-shell">
        <SiteFooter />
      </div>
    </>
  );
}
