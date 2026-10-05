# Contributing to RepoLens

Thanks for helping improve RepoLens.

1. Create a focused branch from `main`.
2. Keep changes small and explain the engineering trade-off.
3. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
4. Add or update tests when changing scoring, input parsing, authentication, or webhook behavior.
5. Never commit tokens, private keys, webhook secrets, or real user data.

Scoring changes should remain deterministic, explainable, and based on observable repository signals.
