# AGENTS.md — SEMESTA ISLAM (AI Agent Operating Directive)

## What this is
This repository is the full-stack implementation and canonical documentation hub for **SEMESTA ISLAM** — a trusted digital platform connecting learners, families, educators, and institutions.

**Stack & Architecture:**
- **Frontend & App Router**: Next.js 15.1.3 (App Router), React 19, TypeScript 5.7, Tailwind CSS 3.4
- **Persistence Layer**: PostgreSQL 16 (via Docker Compose) + Prisma 6.2.1 ORM (`prisma/schema.prisma`)
- **Validation & Business Logic**: Zod 3.24.1 + domain service abstractions (`src/lib/*/service.ts`)
- **Testing & Verification**: Vitest test runner (`npm test`), `npm run typecheck`, `npm run build`
- **Governance**: Governed strictly by canonical specifications in `docs/` (`00_BRD.md` through `10_ACCEPTANCE_CRITERIA.md`).

---

## Active Execution Focus & Constraints
- **Current Operational Scope**: **B2C Islamic Learning Marketplace MVP** (Discovery, Sanad/Credential Evaluation, Booking Requests, and Lajnah Verification).
- **Execution Order Directive**: `PRODUCT → USERS → CORE LOOP → PRODUCTION`.
- **Ontology Gate**: **CLOSED**. Do not invent new entities, schemas, or complex abstractions.
- **B2B / Developer Platform Specs**: Specifications in `docs/productization/` are classified as `[BUSINESS HYPOTHESIS / DEFERRED]` for post-MVP.

---

## Canonical Documentation Chain
Read in this authority order:
| File | Role |
| --- | --- |
| `docs/00_BRD.md` | Business Requirements — Vision, outcomes, target actors |
| `docs/01_BSD.md` | Business & System Definition — System boundaries and status classification |
| `docs/02_PRD.md` | Product Requirements — Functional capabilities and user journeys |
| `docs/03_ERD.md` | Domain / Data Model — Canonical reference for all database schemas |
| `docs/04_OSS.md` | OSS & Resource Strategy — Reuse discipline and license verification |
| `docs/05_MASTER_CONTEXT.md` | Master Operating Context — Canonical system prompt governing all AI work |
| `docs/audit/FUNDAMENTAL_DOCS_AUDIT.md` | Fundamental Audit — Empirical reconciliation of docs vs code |

Authority chain: **BRD → BSD → PRD → ERD → OSS/Registry → Design/UX → Implementation → Test/Acceptance.**

---

## Binding Operating Rules for AI Agents

1. **Read Governing Docs First**: Inspect `05_MASTER_CONTEXT.md` (§64 execution loop) and `03_ERD.md` before making architectural or database changes.
2. **Never Fabricate**: Do not invent business policies, API endpoints, npm packages, credentials, traction metrics, or legal claims.
3. **Evidence Status Taxonomy**: Classify assertions strictly per `05_MASTER_CONTEXT.md` §5 (`VERIFIED / SOURCE-DERIVED / INFERENCE / ASSUMPTION / UNKNOWN`) or `01_BSD.md` §2 (`FACT / RESEARCH / DECISION / HYPOTHESIS / OPEN / REJECTED`).
4. **Reuse Before Build**: Check existing utilities and services (`src/lib/*/service.ts`) before writing custom helpers.
5. **Database Change Discipline**: `03_ERD.md` governs all data modeling. Do not create entities merely for UI convenience.
6. **Flag Business Decisions**: Business model, pricing, verification policy, or new actor changes = `BUSINESS DECISION REQUIRED`. Flag explicitly; never resolve silently.
7. **Empirical Verification**: Never claim a task is complete without running verification (`npm run typecheck`, `npm test`, or `npm run build`).

---

## Execution Loop
Follow the canonical loop (`MASTER_CONTEXT.md` §64):
`Request → Read Context → Research → Map Gap → Reuse → Plan → Execute → Verify → Report`.
