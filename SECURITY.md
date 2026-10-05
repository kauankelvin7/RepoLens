# Security Policy

## Reporting a vulnerability

Please do not disclose exploitable vulnerabilities in a public issue.

Report security findings privately to the repository owner through GitHub's private vulnerability reporting feature when available. Include reproduction steps, affected routes, expected impact, and any suggested mitigation.

## Secrets

RepoLens never requires client-side GitHub credentials. Tokens, GitHub App private keys, and webhook secrets belong only in server-side environment variables and must never be committed to the repository.

## Scope

The public analyzer intentionally reads repository metadata, language statistics, and the Git tree. Source file contents are not sent to external AI services by the application.
