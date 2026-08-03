---
description: Perform comprehensive code review, rule validation, and security audit.
---

# `/code-review` Workflow

## Goal
Verify that implementation meets quality standards, evidence rules, and security guidelines.

## Execution Steps

1. **Rule & Evidence Audit**:
   - Check compliance with `docs/05_MASTER_CONTEXT.md` §63 verification criteria.
   - Verify no silent assumptions or unapproved tech stack choices were introduced.

2. **Codebase Impact Analysis**:
   - Use `codegraph_explore` or `understand-codebase` to check for breaking changes or side effects.

3. **Security & Data Modeling Check**:
   - Cross-reference `docs/03_ERD.md` to ensure data entities and boundaries are preserved.

4. **Reporting**:
   - Generate structured review summary highlighting findings, warnings, and compliance status.
