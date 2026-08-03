---
description: Run end-to-end feature planning and architecture review across OmA personas.
---

# `/feature-plan` Workflow

## Goal
Map out requirements, system design, data modeling, and UX strategy for a new feature.

## Execution Steps

1. **Product Manager (PM)**:
   - Read `docs/00_BRD.md` and `docs/02_PRD.md`.
   - Define user stories, target outcomes, and scope boundaries.

2. **Systems Architect**:
   - Check `docs/01_BSD.md` and `docs/03_ERD.md`.
   - Verify data model impact and API surface requirements.

3. **UX Writer & UI Designer**:
   - Invoke `ux-copywriting-master` and `ui-ux-pro-max`.
   - Outline user flows, microcopy needs, and screen states.

4. **QA & Security Auditor**:
   - Audit plan against `docs/05_MASTER_CONTEXT.md` non-negotiable rules.
   - Output structured Implementation Plan artifact for user review.
