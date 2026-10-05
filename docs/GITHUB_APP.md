# GitHub App setup

RepoLens already contains the server-side primitives for GitHub App JWT authentication, installation tokens, and signed webhooks.

## Recommended settings

Create a GitHub App owned by your account and configure:

- Homepage URL: the deployed RepoLens URL
- Webhook URL: `https://YOUR_DOMAIN/api/webhooks/github`
- Webhook secret: generate a long random value
- Where can this GitHub App be installed?: Any account

### Repository permissions

Start with the minimum:

- Metadata: Read-only
- Contents: Read-only
- Actions: Read-only

Add permissions only when a concrete feature requires them.

### Events

Subscribe initially to:

- Push
- Pull request
- Repository

## Environment variables

Set the values from `.env.example` on the deployment platform. Keep the private key server-side. New lines in the PEM can be stored as literal `\\n`; RepoLens normalizes them before signing.

## Developer Program

The public analyzer already integrates with the GitHub REST API. Registering the GitHub App makes the integration more representative of a production developer tool and unlocks installation-scoped authentication for future private-repository features.
