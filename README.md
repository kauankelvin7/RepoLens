# RepoLens

**Repository health, built on evidence.**

[![Live](https://img.shields.io/badge/Live-repolens--zeta.vercel.app-000?style=flat-square&logo=vercel)](https://repolens-zeta.vercel.app)
![CI](https://img.shields.io/github/actions/workflow/status/kauankelvin7/RepoLens/ci.yml?branch=main&label=CI&style=flat-square)
![CodeQL](https://img.shields.io/github/actions/workflow/status/kauankelvin7/RepoLens/codeql.yml?branch=main&label=CodeQL&style=flat-square)
![License](https://img.shields.io/github/license/kauankelvin7/RepoLens?style=flat-square)

RepoLens analyzes a public GitHub repository and turns objective engineering signals into an evidence-first health report. Every score is tied to observable repository signals and real file references where available. It focuses on documentation, CI/CD, security, maintenance, and engineering quality without sending source code to an external AI model.

Private repositories are intentionally not exposed by the public analyzer; they will require an explicit user-authorization flow in a future version.

## What it evaluates

- README, license, contributing guide and project documentation
- GitHub Actions workflows and test presence
- Dependabot and CodeQL configuration
- SECURITY.md, environment examples and lockfiles
- Issue and pull request templates
- Repository activity and metadata quality
- Language distribution and typed-language signals
- Prioritized, explainable recommendations

## Evidence-first analysis

The UI is designed around one question:

> Why did RepoLens reach this conclusion?

For each engineering category, RepoLens surfaces detected/missing signals and the repository files that support the result, such as `README.md`, test files, GitHub Actions workflows, `SECURITY.md`, Dependabot configuration and lockfiles.

This keeps the product deterministic and auditable: no hidden model decides whether a repository is "good".

## Architecture

The analyzer normally uses only three GitHub REST API requests per repository:

1. Repository metadata
2. Language statistics
3. Recursive Git tree

The analysis engine is deterministic and runs server-side.

```text
Browser
  -> POST /api/analyze
  -> validation + rate limit
  -> GitHub REST API
  -> deterministic scoring engine
  -> evidence extraction
  -> evidence-first dashboard
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for trust boundaries and design decisions.

## Local development

Requirements: Node.js 20.9+ and npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

A token is optional for public repositories, but `GITHUB_TOKEN` raises the GitHub API rate limit.

## Quality gates

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions runs the same checks on pushes and pull requests. CodeQL and Dependabot configurations are included.

## GitHub App

RepoLens is also deployed as a real GitHub App integration.

It includes:

- RS256 GitHub App JWT generation
- installation discovery and installation token primitives
- HMAC SHA-256 webhook verification
- an App configuration status endpoint
- a signed webhook endpoint at `/api/webhooks/github`
- repository-scoped cache invalidation on signed GitHub webhook events
- production App authentication validation through `/api/app/status`

See [docs/GITHUB_APP.md](docs/GITHUB_APP.md) for the recommended permissions and setup.

## Security

Credentials remain server-side. Never prefix secret variables with `NEXT_PUBLIC_`. See [SECURITY.md](SECURITY.md).

## License

MIT © 2026 Kauan Kelvin Santos Barbosa
