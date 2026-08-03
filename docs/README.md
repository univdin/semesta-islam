# SEMESTA ISLAM — DOCUMENTATION INDEX & CLASSIFICATION

This directory serves as the canonical documentation repository for SEMESTA ISLAM. All files are categorized into structured subdirectories according to their domain, operational role, and lifecycle status.

---

## 1. CANONICAL SPECIFICATIONS (Root `docs/`) `[CANONICAL / ACTIVE]`

The core authority chain governing the project model, architecture, and behavior:

| File | Title & Description | Status |
| :--- | :--- | :--- |
| [`00_BRD.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/00_BRD.md) | **Business Requirements Document** — WHY the business exists, vision, target actors, and core outcomes. | `[CANONICAL]` |
| [`01_BSD.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/01_BSD.md) | **Business & System Definition** — System boundaries, capabilities, and actor interaction models. | `[CANONICAL]` |
| [`02_PRD.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/02_PRD.md) | **Product Requirements Document** — Functional requirements, UX standards, and MVP scope. | `[CANONICAL]` |
| [`03_ERD.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/03_ERD.md) | **Entity Relationship & Domain Model** — Canonical reference for all data structures and database models. | `[CANONICAL]` |
| [`04_OSS.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/04_OSS.md) | **OSS & Resource Strategy** — Reuse discipline, third-party library rules, and license compliance. | `[CANONICAL]` |
| [`05_MASTER_CONTEXT.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/05_MASTER_CONTEXT.md) | **Master Operating Context** — Canonical system prompt and AI agent operating rules. | `[CANONICAL]` |
| [`06_DESIGN.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/06_DESIGN.md) | **Design System & UI Guidelines** — Visual identity, color palette, and layout principles. | `[CANONICAL]` |
| [`07_API_ENDPOINTS.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/07_API_ENDPOINTS.md) | **API Architecture Specifications** — Route design, request/response contracts, and status codes. | `[CANONICAL]` |
| [`08_SECURITY_COMPLIANCE.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/08_SECURITY_COMPLIANCE.md) | **Security & Compliance Directives** — Privacy, identity protection, hashing, and access controls. | `[CANONICAL]` |
| [`09_RESOURCE_REGISTRY.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/09_RESOURCE_REGISTRY.md) | **Resource Registry** — Inventory of approved packages, APIs, and external assets. | `[CANONICAL]` |
| [`10_ACCEPTANCE_CRITERIA.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/10_ACCEPTANCE_CRITERIA.md) | **Quality & Acceptance Criteria** — Gate definition, quality criteria, and testing standards. | `[CANONICAL]` |

---

## 2. SUBDIRECTORY CLASSIFICATION

### A. Audit & Reality Reconciliation (`docs/audit/`) `[AUDIT & REALITY]`
Contains empirical audit reports, defect logs, domain neutrality assessments, and fundamental alignment reports:
- [`FUNDAMENTAL_DOCS_AUDIT.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/FUNDAMENTAL_DOCS_AUDIT.md) — Comprehensive audit comparing canonical specifications vs post-iteration DB runtime.
- [`CONTRACT_DRIFT_REPORT.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/CONTRACT_DRIFT_REPORT.md) — Reconciliation between runtime code and OpenAPI specs.
- [`DECISION_LOG.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/DECISION_LOG.md) — Log of architectural and business decisions.
- [`DEFECT_BACKLOG.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/DEFECT_BACKLOG.md) — P0/P1 defect tracking and fixes.
- [`DOMAIN_NEUTRALITY_AUDIT.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/DOMAIN_NEUTRALITY_AUDIT.md) — Domain ontology audit and Sanad generalization analysis.
- [`IMPLEMENTATION_CONTRACT.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/IMPLEMENTATION_CONTRACT.md) — Localhost implementation agreement.
- [`IMPLEMENTATION_EVIDENCE.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/IMPLEMENTATION_EVIDENCE.md) — Empirical evidence of passing execution gates.
- [`IMPLEMENTATION_READINESS.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/IMPLEMENTATION_READINESS.md) — System readiness audit.
- [`LIVE_INTEGRATION_CHECKLIST.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/LIVE_INTEGRATION_CHECKLIST.md) — Cloud gate prerequisites.
- [`LOCALHOST_DEFECTS.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/LOCALHOST_DEFECTS.md) — Log of identified localhost runtime defects.
- [`LOCALHOST_PRODUCT_REVIEW.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/LOCALHOST_PRODUCT_REVIEW.md) — Visual and functional review of localhost UI.
- [`LOCAL_DEMO_CREDENTIALS.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/LOCAL_DEMO_CREDENTIALS.md) — Local dev credentials for testing roles.
- [`PRODUCT_CAPABILITY_MAP.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/PRODUCT_CAPABILITY_MAP.md) — Capability and gap mapping across surfaces.
- [`PRODUCT_REALITY_MAP.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/PRODUCT_REALITY_MAP.md) — Mapping of 5 product surfaces and developer surface MVP.
- [`PRODUCT_SCOPE_REASSESSMENT.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/PRODUCT_SCOPE_REASSESSMENT.md) — Product scope mapping (marketplace vs platform).
- [`REPOSITORY_REALITY_MATRIX.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/REPOSITORY_REALITY_MATRIX.md) — Codebase inspection matrix.
- [`UI_INVENTORY.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/audit/UI_INVENTORY.md) — Inventory of implemented UI routes and states.

### B. Execution & Implementation Reports (`docs/implementation/`) `[ACTIVE RUNTIME REALITY]`
Implementation reports detailing the DB-backed migration and execution phases:
- [`POST_AUDIT_EXECUTION_REPORT.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/implementation/POST_AUDIT_EXECUTION_REPORT.md) — Detailed execution report of PostgreSQL + Prisma DB migration.
- [`PRODUCT_IMPLEMENTATION_PLAN.md`](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/implementation/PRODUCT_IMPLEMENTATION_PLAN.md) — 4-phase execution plan (`PRODUCT → USERS → CORE LOOP → PRODUCTION`).

### C. Public Contracts & Schemas (`docs/contracts/`) `[CONTRACTS & SCHEMAS]`
Machine-readable contracts, JSON Schemas, and integration specifications:
- `openapi.yaml` — OpenAPI 3.1.0 specification for public API.
- `API_CONTRACT_GENERATION_REPORT.md` — Generation log for JSON schemas.
- `schemas/` — JSON Schema draft 2020-12 schemas (`educator`, `course`, `sanad`, `verification`, `trust-metadata`).
- Sub-specs: `authentication.md`, `authorization.md`, `errors.md`, `filtering.md`, `pagination.md`, `sandbox.md`, `trust-provenance.md`, `versioning.md`, `webhooks.md`.

### D. Productization & Strategy (`docs/productization/`) `[BUSINESS HYPOTHESIS / DEFERRED]`
> [!NOTE]
> All specifications in `docs/productization/` represent future platform evolution hypotheses (B2B SaaS / Verification API). The immediate execution focus remains 100% on the **B2C Islamic Learning Marketplace MVP**.

- `API_DOCUMENTATION_EVALUATION.md` — Scalar API documentation setup hypothesis.
- `API_RESOURCE_MODEL.md` — Conceptual REST API resource mapping hypothesis.
- `API_ROADMAP.md` — Developer API release roadmap hypothesis.
- `BUSINESS_MODEL.md` — B2B/B2C revenue and monetization hypotheses.
- `DEVELOPER_PLATFORM.md` — Developer platform vision & capabilities hypothesis.
- `DEVELOPER_PORTAL_SPEC.md` — Developer portal requirements hypothesis.
- `JSON_SCHEMA_STRATEGY.md` — JSON Schema architecture strategy.
- `POST_LOCALHOST_PRODUCTIZATION_PLAN.md` — Productization phase master plan hypothesis.
- `PRODUCT_API_BOUNDARY.md` — Public API vs internal data security boundaries.
- `TRUST_METADATA_CONTRACT.md` — Specification for trust provenance headers/payloads.
- `WEBHOOK_CONTRACT.md` — Outbound event notification specifications hypothesis.

---

## 3. ARCHIVE (`docs/archive/`) `[HISTORICAL ARCHIVE]`
Historical artifacts and previous iteration plans:
- `implementation_plan.md` — Archived implementation plan from prior phases.
