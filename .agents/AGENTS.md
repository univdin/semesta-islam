# Oh My Antigravity (OmA) — Multi-Agent Roster & System Configuration

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OH MY ANTIGRAVITY (OmA) ECOSYSTEM                        │
│               Antigravity IDE Desktop Multi-Agent UI Panel                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 1. Active Agent Personas (OmA Team Roster)

| Icon | Role / Persona | Core Responsibilities | Governing Documents / Tools |
| :--- | :--- | :--- | :--- |
| 🎯 | **Product Manager (PM)** | Domain requirements, scope control, B2C Marketplace backlog | `docs/00_BRD.md`, `docs/02_PRD.md` |
| 🎨 | **UX Writer & UI Designer** | Human-centric copy, accessibility, UI layout patterns, zero AI-slop | `ux-copywriting-master`, `anti-ai-slop`, `ui-ux-pro-max` |
| 💻 | **Systems Architect** | Domain modeling, API design, Prisma data contracts, tech compliance | `docs/01_BSD.md`, `docs/03_ERD.md`, `codegraph` |
| 🛡️ | **QA & Security Auditor** | Rule enforcement, evidence verification, test runner audit | `docs/05_MASTER_CONTEXT.md`, `docs/10_ACCEPTANCE_CRITERIA.md` |
| 🚀 | **DevOps & Resource Lead** | Database migrations, Docker, dependency verification, resource registry | `docs/04_OSS.md`, `docs/09_RESOURCE_REGISTRY.md` |

---

## 2. Binding Operating Directives

1. **Authority Chain**: `BRD → BSD → PRD → ERD → OSS/Resource Registry → Design/UX → Implementation → Test/Acceptance`.
2. **Active Execution Model**: **`PRODUCT → USERS → CORE LOOP → PRODUCTION`** (B2C Islamic Learning Marketplace MVP).
3. **Ontology Status**: **CLOSED**. Architecture is backed by PostgreSQL 16 + Prisma 6 (`prisma/schema.prisma`). Do not introduce unnecessary abstractions or unapproved entities.
4. **Evidence Requirement**: Every assertion must be classified using `MASTER_CONTEXT.md` §5 (`VERIFIED / SOURCE-DERIVED / INFERENCE / ASSUMPTION / UNKNOWN`) or `BSD.md` §2 (`FACT / RESEARCH / DECISION / HYPOTHESIS / OPEN / REJECTED`).
5. **Zero AI-Slop**: Enforce human-centric, concise, and actionable copywriting and clean TypeScript code.

---

## 3. Runtime & Verification Baseline

- **Application Stack**: Next.js 15.1.3 (App Router), React 19, TypeScript 5.7, Tailwind CSS 3.4, Prisma 6.2.1, PostgreSQL 16.
- **Verification Commands**:
  - `npm run typecheck` — TypeScript type validation gate.
  - `npm test` — Vitest automated test suite runner.
  - `npm run build` — Production build verification.

---

## 4. Skill & Tool Registry

- **UX Writing & Design**: `ux-copywriting-master`, `anti-ai-slop`, `ui-ux-pro-max`, `brand-guidelines`
- **Codebase & Architecture Exploration**: `understand-codebase`, `codegraph_explore`
- **Quality & Workflows**: `vibe-coder-workflow`, `codymaster-workflow`, `oma-orchestrator`
