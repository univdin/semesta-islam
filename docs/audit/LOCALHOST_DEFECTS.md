# LOCALHOST DEFECT REGISTER — SEMESTA ISLAM

**Document:** `docs/LOCALHOST_DEFECTS.md`  
**Status:** Active Defect Log  
**Authority:** Governed by `AI AGENT DIRECTIVE — LOCALHOST INSTALLATION GATE`

---

## 1. DEFECT MATRIX

| ID | Severity | Area | Defect Description | Reproduction Steps | Fix / Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | `HIGH` | Layout | Element `class` attribute error on `src/app/layout.tsx` | Run `npm run typecheck` | Changed `class` to `className` in React layout | `[RESOLVED]` |
| **DEF-02** | `HIGH` | Schema | Prisma 7 CLI validation error due to deprecated `url` in datasource | Run `npx prisma validate` | Pinned exact Prisma version 6.2.1 in `package.json` | `[RESOLVED]` |
| **DEF-03** | `MEDIUM` | Verification | Missing server-side role check on Lajnah review API | Send POST without verifier roles | Implemented `isAuthorizedVerifierRole()` check returning `403` | `[RESOLVED]` |

---

## 2. SUMMARY
- **Total Critical / High Defects Found**: 3
- **Total Resolved**: 3
- **Unresolved Defect Count**: 0
