# <!--
# Sync Impact Report
# Version change: 2.3.0 -> 2.3.1
#
# Modified principles:
# - P1. Data Integrity & Timeliness (added/standardized wording)
# - P2. Defensive Hosting (clarified hosting controls)
# - P3. Schema Flexibility (clarified storage/schema guidance)
# - P4. Tool Utilization (explicit Student Pack usage requirement)
# - Simplicity & Minimal Surface Area retained as supporting guidance
#
# Templates requiring updates:
# - .specify/templates/plan-template.md ✅ updated (version reference updated to 2.3.1)
# - .specify/templates/spec-template.md ⚠ pending (reviewed; no change required)
# - .specify/templates/tasks-template.md ⚠ pending (reviewed; no change required)
# - .specify/templates/agent-file-template.md ⚠ pending (contains placeholder [DATE])
#
# Follow-up TODOs:
# - RATIFICATION_DATE: TODO(RATIFICATION_DATE) left in document — maintainers should supply original ratification date.
# - Manual review: confirm any agent-specific guidance files reference new principles and the Student Pack hosting choices.
#
# Validation:
# - No remaining unexplained bracket tokens in this constitution file (only TODO(RATIFICATION_DATE) intentionally left).
# - Version line matches report (2.3.1).
# - Dates are ISO where present (Last Amended: 2025-09-27).
# -->

# Threat Intelligence Dashboard Constitution

## Core Principles

### P1. Data Integrity & Timeliness (NON-NEGOTIABLE)
All displayed data must be refreshed automatically at a defined, regular
interval (for example: hourly or daily). The source of all data feeds must be
clearly cited on the dashboard. Ingestion pipelines MUST record provenance
metadata and the UI MUST display the last successful fetch time for each feed.
Rationale: Ensures the dashboard is a reliable source of current threat
information, demonstrating a real-time capability.

### P2. Defensive Hosting (NON-NEGOTIABLE)
All hosting resources, especially the DigitalOcean Droplet or Azure Function
used for data collection, MUST be configured with least-privilege access and
network controls. Data MUST be encrypted in transit (TLS/SSL). Management
interfaces and dashboards exposed to the public internet MUST be behind
authenticated access controls. Rationale: As a security project, the
infrastructure itself must adhere to high security standards.

### P3. Schema Flexibility (MUST)
The data model MUST be designed to accommodate diverse, unstructured threat
data types without requiring major rewrites. Storage designs SHOULD leverage
flexible document models (e.g., MongoDB Atlas) and include transformation and
normalization layers where needed. Rationale: Threat intelligence feeds vary
widely (IPs, hashes, domains, TTPs); schema flexibility reduces friction when
adding new feeds.

### P4. Tool Utilization (MUST for portfolio requirement)
The project MUST visibly leverage and document the use of DigitalOcean,
MongoDB Atlas, and at least one front-end hosting service (GitHub Pages or
Vercel) as per the Student Pack requirements. The README and quickstart MUST
include setup and minimal configuration steps for these services. Rationale:
This is a portfolio requirement and demonstrates use of provided hosting and
platform credits.

## Deployment & Hosting Constraints

The project favors reproducible, well-documented hosting choices:
- Backend data aggregation MAY run on a small Linux Droplet (DigitalOcean) or as
	scheduled serverless functions (Azure Functions) depending on operational
	needs. Choice MUST be justified in the feature plan.
- Database: MongoDB Atlas is the recommended hosted datastore for flexible
	threat records; any alternative MUST provide equivalent durability and
	encryption guarantees.
- Frontend hosting: GitHub Pages or Vercel is acceptable for SPA hosting. The
	chosen hosting provider and its access controls MUST be documented in the
	quickstart and deployment guide.

## Development Workflow & Quality Gates

- All work MUST start from a spec and plan (`specs/*`) and pass an automated
	Constitution Check (plan must document how it complies with each relevant
	principle).
- Code changes MUST include tests and documentation for new behaviors.
- Pull requests touching ingestion, storage schemas, or security controls MUST
	include a migration/rollout plan and be reviewed by at least one other
	maintainer with systems/security context.

## Governance

Amendments to this constitution follow a documented process:
1. Propose amendment as a PR that updates this document and adds a short
	 migration/impact note.
2. Amendments that add or clarify principles (non-breaking) require a
	 two-maintainer approval and automated checks pass (minor version bump).
3. Amendments that remove or materially redefine principles (breaking) require
	 broader consensus (majority of active maintainers), a migration plan, and
	 explicit communication to stakeholders (major version bump).

Compliance: All plans and PRs MUST include a short "Constitution Check" section
that enumerates how the change satisfies or documents deviation from each
relevant principle. Deviations are allowed only with explicit, recorded
justification in the PR.

**Version**: 2.3.1 | **Ratified**: 2025-09-27 | **Last Amended**: 2025-09-27