const PILLARS = [
  {
    index: "01",
    title: "Documentação",
    weight: "20%",
    description: "README, licença, contribuição, homepage, tópicos e docs.",
  },
  {
    index: "02",
    title: "CI/CD",
    weight: "20%",
    description: "Workflows, testes, lockfile, Dependabot e CodeQL.",
  },
  {
    index: "03",
    title: "Controles de segurança",
    weight: "20%",
    description:
      "Sinais públicos de política, automação e evidências versionadas. Não é pentest.",
  },
  {
    index: "04",
    title: "Manutenção",
    weight: "20%",
    description: "Recência, templates, contribuição, tópicos e estado do repo.",
  },
  {
    index: "05",
    title: "Qualidade",
    weight: "20%",
    description: "Testes, tipagem, automação, lockfile e documentação técnica.",
  },
] as const;

const TRUST_ROWS = [
  ["Escopo público", "Somente repositórios públicos no analisador aberto."],
  ["Dados lidos", "Metadados, linguagens e árvore recursiva do GitHub."],
  [
    "Escopo de segurança",
    "Mede controles observáveis na estrutura pública; não certifica ausência de vulnerabilidades.",
  ],
  ["IA externa", "Nenhum código-fonte é enviado para modelos externos."],
  ["GitHub App", "JWT RS256 + webhooks HMAC SHA-256 em produção."],
  ["Cache", "Até 5 min, invalidado por webhook quando o repositório muda."],
] as const;

export function MethodSection() {
  return (
    <section className="method-section" id="method" aria-labelledby="method-title">
      <div className="section-intro">
        <div>
          <span className="section-kicker">MODELO DE AVALIAÇÃO</span>
          <h2 id="method-title">Cinco pilares. Peso explícito.</h2>
        </div>
        <p>
          O índice geral é a média simples dos cinco pilares. Cada ponto nasce
          de um critério verificável; a tela de resultado mostra exatamente
          quanto cada critério contribuiu.
        </p>
      </div>

      <div className="pillar-grid">
        {PILLARS.map((pillar) => (
          <article className="pillar-item" key={pillar.title}>
            <div className="pillar-topline">
              <span>{pillar.index}</span>
              <strong>{pillar.weight}</strong>
            </div>
            <h3>{pillar.title}</h3>
            <p>{pillar.description}</p>
          </article>
        ))}
      </div>

      <div className="method-note">
        <code>overall = (doc + ci/cd + security + maintenance + quality) / 5</code>
        <span>Sem classificação por LLM. Sem score oculto.</span>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="trust-section" id="trust" aria-labelledby="trust-title">
      <div className="section-intro">
        <div>
          <span className="section-kicker">LIMITES & CONFIANÇA</span>
          <h2 id="trust-title">O que entra. O que fica de fora.</h2>
        </div>
        <p>
          RepoLens trata confiança como parte da arquitetura: escopo público
          claro, critérios auditáveis e fronteira explícita para dados privados.
        </p>
      </div>

      <div className="trust-table" role="list">
        {TRUST_ROWS.map(([label, description]) => (
          <div className="trust-row" role="listitem" key={label}>
            <span>{label}</span>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
