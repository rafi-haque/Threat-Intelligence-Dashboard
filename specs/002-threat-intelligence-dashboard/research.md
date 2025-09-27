# Research: Threat Intelligence Dashboard

Decision: Use a hybrid backend on a small DigitalOcean Droplet for the data
fetchers and a lightweight Node.js (Express) API for read-only queries. Use
MongoDB Atlas for flexible storage. Frontend will be an SPA (React) deployed to
GitHub Pages or Vercel.

Rationale: DigitalOcean demonstrates cloud infra management skills (Droplet)
while keeping the implementation straightforward. MongoDB Atlas aligns with
schema flexibility requirements. React + Chart.js/Leaflet provide a fast
developer experience for SPA visualizations.

Alternatives considered:
- Azure Functions + Azure App Service (serverless) — lower operational burden,
  but more configuration for a student project and less direct Droplet
  management experience.
- PostgreSQL with JSONB — acceptable, but less natural for purely document-style
  threat records.

Open questions resolved in clarifications:
- API access: Public read-only.
- Retention: 90 days default (older data deleted or archived out-of-scope).

Next actions from research:
- Document feed parsing patterns and normalization examples.
- Create initial MongoDB collection design and sample documents in `data-model.md`.
