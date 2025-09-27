```markdown
# Tasks: Threat Intelligence Dashboard (Feature 002)

Feature directory: `/home/rafi/projects/Threat_intelligence_dashoard/specs/002-threat-intelligence-dashboard`

Goal: Implement a read-only API and ingestion pipeline for threat indicators with a React SPA dashboard. Follow TDD: create failing tests (contract + integration) before implementation. Use Node.js (Express) backend, MongoDB Atlas, and React frontend.

Ordering rules applied: setup → contract tests [P] → model tests [P] → model impl → service tests → service impl → endpoint tests → endpoint impl → frontend integration tests → polish.

Parallelization: tasks marked with [P] are safe to run in parallel when they touch different files. Tasks that modify the same file are sequential.

T001. Setup: repository bootstrap [X]
- Title: Initialize project parts and dev tooling
- Files/paths:
  - `/backend/package.json` (create)
  - `/backend/.eslintrc.json` (create)
  - `/backend/tsconfig.json` or `/backend/.babelrc` (choose JS/TS; research chose Node.js — use JS for minimal friction)
  - `/frontend/package.json` (create)
  - `/frontend/.eslintrc.json` (create)
  - `/tests/contract/` (create)
- Description: Add minimal package manifests, lint rules, and test runners (Jest or vitest for frontend). Ensure `npm install` commands documented in README.
- Dependencies: Node.js 18+, express, mongodb, jest, supertest, react, react-dom, vite (or create-react-app)
- Notes/Commands: Create `backend` and `frontend` folders; initialize `package.json` files and list dependencies. Document install/start commands in `README.md`.

T002. Contract Tests: API contract -> failing tests [P] [X]
- Title: Create contract test for `/indicators` endpoint using OpenAPI contract
- Files/paths:
  - `/tests/contract/test_indicators_contract.spec.js`
  - Reference contract: `/specs/002-threat-intelligence-dashboard/contracts/openapi.yaml`
- Description: Implement a test that validates the backend returns JSON matching the OpenAPI schema for `GET /indicators`. Use `supertest` against an Express app instance. The test must assert response shape (items array with id, type, value, last_seen).
- Parallel: [P]

T003. Model Tests: Indicator model validation tests [P] [X]
- Title: Indicator schema and normalization tests
- Files/paths:
  - `/backend/tests/models/indicator.model.spec.js`
  - `/backend/src/models/indicator.js`
- Description: Create tests that assert validation rules (value present, type one of ip/domain/hash/other), normalization (lowercase domains, canonical IPs), and index presence expectation (document-level TTL behavior can be asserted via metadata field presence).
- Parallel: [P]

T004. Model Impl: Create Indicator model and DB layer [X]
- Title: Implement MongoDB models and helpers
- Files/paths:
  - `/backend/src/models/indicator.js`
  - `/backend/src/db/mongo.js`
- Description: Implement the model according to `data-model.md`. Include index creation scripts (on type+value, TTL on last_seen via a background job config note). Export helper functions: findIndicators(query), upsertIndicator(payload).

T005. Service Tests: Fetcher normalization and ingestion tests [P] [X]
- Title: Tests for data fetcher/parsers and ingestion flow
- Files/paths:
  - `/backend/tests/services/fetcher.spec.js`
  - `/backend/src/services/fetcher.js` (test target)
- Description: Create tests that simulate raw feed payloads and assert parsed indicators are normalized and passed to model upsert functions. Use stubs/mocks for DB layer.
- Parallel: [P]

T006. Service Impl: Implement fetcher/parsers and ingestion pipeline [X]
- Title: Implement feed fetcher, parsers, normalization, and ingestion orchestration
- Files/paths:
  - `/backend/src/services/fetcher.js`
  - `/backend/src/services/ingest.js`
  - `/backend/src/parsers/` (example parsers per feed)
- Description: Implement scheduled fetcher functions, per-feed parser interface, normalization utilities, and ingestion that writes to `indicators` and `events`. Use environment-driven `DATA_FEEDS` config.

T007. Endpoint Tests: `/indicators` endpoint test (integration) [P] [X]
- Title: Endpoint behaviour and query parameters
- Files/paths:
  - `/tests/contract/test_indicators_endpoint.spec.js`
  - `/backend/src/api/indicators.js`
  - `/backend/src/app.js` (Express app)
- Description: Write tests (supertest) asserting query parameters (`q`, `source`, `limit`) shape and filtering. Tests should run against the app with a mocked DB (in-memory Mongo or test DB). Mark [P] if they don't touch the same files.
- Parallel: [P]

T008. Endpoint Impl: Implement Express routes for `/indicators` [X]
- Title: Implement API route and controller
- Files/paths:
  - `/backend/src/api/indicators.js`
  - `/backend/src/app.js`
  - `/backend/src/routes/index.js`
- Description: Implement handler using model functions (findIndicators). Ensure public read-only access (no auth). Add pagination and basic input validation (limit cap 200).

T009. Integration Tests: Quickstart scenarios [P] [X]
- Title: Integration smoke tests from `quickstart.md`
- Files/paths:
  - `/tests/integration/quickstart.spec.js`
- Description: Implement tests that perform the quickstart validation steps: simulate ingestion, then call `/api/indicators?query=<value>` and assert results; assert last-updated timestamps are present. Use a test DB instance.
- Parallel: [P]

T010. Frontend Tests: React integration tests for dashboard components [P] [X]
- Title: Component tests and e2e stub for dashboard
- Files/paths:
  - `/frontend/src/components/IndicatorList.jsx`
  - `/frontend/src/pages/Dashboard.jsx`
  - `/frontend/tests/IndicatorList.spec.jsx`
- Description: Create React component tests (vitest/react-testing-library) that mock API responses and assert rendering of indicators and last-updated timestamps.
- Parallel: [P]

T011. Frontend Impl: Basic SPA and data fetching [X]
- Title: Implement React SPA skeleton and pages
- Files/paths:
  - `/frontend/src/main.jsx`
  - `/frontend/src/services/api.js`
  - `/frontend/src/pages/Dashboard.jsx`
  - `/frontend/src/components/IndicatorList.jsx`
- Description: Implement API client (fetch to `/api/indicators`), Dashboard page showing basic charts (placeholder Chart.js) and list of indicators. Configure frontend to point to BACKEND_URL via env.

T012. CI: Add CI job to run tests and lint [X]
- Title: Configure GitHub Actions workflow
- Files/paths:
  - `/.github/workflows/ci.yml`
- Description: Add workflow that installs dependencies, runs backend and frontend tests, and lints code. Fail on test/lint errors. Include matrix for Node 18/20 if desired.

T013. Docs & Quickstart: finish README and deployment notes [P] [X]
- Title: Update quickstart and README with env and deploy steps
- Files/paths:
  - `/specs/002-threat-intelligence-dashboard/quickstart.md` (update)
  - `/README.md` (project-level notes)
- Description: Add exact commands to provision MongoDB Atlas, set `DATA_FEEDS`, run ingestion locally, start backend/frontend, and smoke-test endpoints.
- Parallel: [P]

T014. Polish: Performance & retention job [X]
- Title: Implement retention job and basic performance checks
- Files/paths:
  - `/backend/src/maintenance/retention.js`
  - `/backend/src/maintenance/stress_check.js`
- Description: Implement a scheduled job to delete/archive indicators older than 90 days (Mongo TTL or scheduled job). Add a simple script to exercise API for basic performance profiling.

T015. Release Prep: package and deployment scripts [X]
- Title: Prepare deploy scripts for backend and frontend
- Files/paths:
  - `/deploy/backend/Dockerfile` (optional)
  - `/deploy/frontend/` (netlify/vvercel config)
- Description: Add minimal Dockerfile or deploy notes to host backend on DigitalOcean Droplet and frontend on GitHub Pages/Vercel.

---

Parallel execution examples:
- Group A (can run in parallel): T002, T003, T005, T009, T010, T013
- Group B (sequential): T004 -> T006 -> T008 -> T011 -> T014

Example Task agent commands (one-liners an LLM agent could execute for each task):
- T002: create `/tests/contract/test_indicators_contract.spec.js` with a supertest-based test that asserts OpenAPI schema fields exist.
- T004: implement `/backend/src/models/indicator.js` exporting `findIndicators` and `upsertIndicator` that use `mongodb` driver.

Acceptance criteria (global):
- All tests pass in CI. Contract tests assert OpenAPI schema. Integration quickstart passes. Frontend displays latest indicators and feed last-updated timestamps.

---

Generated by tasks.prompt.md (feature 002) based on plan/data-model/contracts/research/quickstart
```# Tasks Outline: Threat Intelligence Dashboard

Phase 2 task generation approach (outline only):

1. Setup
   - T001: Create project structure (backend, frontend, scripts)
   - T002: Initialize repo dependencies (package.json, requirements.txt)
2. Tests First (TDD)
   - T010: Contract test for GET /indicators (tests/contracts/test_indicators_get.py)
   - T011: Integration test for initial ingestion pipeline (tests/integration/test_ingest.py)
3. Core Implementation
   - T020: Implement Indicator model and storage layer (src/models/indicator.js)
   - T021: Implement data fetcher/parsers for feed A/B/C
   - T022: Implement GET /indicators endpoint (src/api/indicators.js)
4. Frontend
   - T030: Create SPA shell and connect to /indicators
   - T031: Implement Map, Trend Chart, and Tag/Category components
5. Observability & Ops
   - T040: Add logging and basic metrics; alerting for fetch failures
   - T041: Retention job to delete or archive records older than 90 days

Notes: This file is an outline; the `/tasks` command will generate detailed
numbered tasks with file paths according to the Phase 1 artifacts.
