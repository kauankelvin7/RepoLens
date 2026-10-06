# RepoLens

**Repository health, without the hand-waving.**

RepoLens analyzes a public GitHub repository and turns objective engineering signals into a practical health report. It focuses on documentation, automation, security, maintenance, and engineering quality without sending source code to an external AI model. Private repositories are intentionally not exposed by the public analyzer; they will require explicit user authorization in a future version.

## What it evaluates

- README, license, contributing guide and project documentation
- GitHub Actions workflows and test presence
- Dependabot and CodeQL configuration
- SECURITY.md, environment examples and lockfiles
- Issue and pull request templates
- Repository activity and metadata quality
- Language distribution and typed-language signals
- Prioritized, explainable recommendations

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
  -> dashboard
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

RepoLens includes:

- RS256 GitHub App JWT generation
- installation discovery and installation token primitives
- HMAC SHA-256 webhook verification
- an App configuration status endpoint
- a signed webhook endpoint at `/api/webhooks/github`
- repository-scoped cache invalidation on signed GitHub webhook events

See [docs/GITHUB_APP.md](docs/GITHUB_APP.md) for the recommended permissions and setup.

## Security

Credentials remain server-side. Never prefix secret variables with `NEXT_PUBLIC_`. See [SECURITY.md](SECURITY.md).

## License

MIT © 2026 Kauan Kelvin Santos Barbosa
