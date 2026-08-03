# SEMESTA ISLAM — API DOCUMENTATION EVALUATION
**Phase:** P3
**Status:** [EXTERNAL RESEARCH VERIFIED]

This document evaluates the OSS tooling options for rendering the SEMESTA ISLAM OpenAPI contract into a Developer Documentation portal.

## 1. Tooling Comparison Matrix

| Capability / Tool | Redoc (OSS) | Stoplight Elements | Swagger UI | Scalar |
| :--- | :--- | :--- | :--- | :--- |
| **OpenAPI Support** | 3.0, 3.1 | 3.0, 3.1 | 3.0, 3.1 | 3.0, 3.1 |
| **JSON Schema Compat.** | Excellent | Excellent | Good | Excellent |
| **Interactive Try-It** | ❌ No (Paid only) | ✅ Yes | ✅ Yes | ✅ Yes (Advanced) |
| **Developer UX / UI** | Clean, static-focused | Modern, interactive | Dated, functional | Ultra-modern, premium |
| **Next.js Integration** | Heavy React component | Web Components (SSR tricky) | React wrapper available | Native React wrapper |
| **SSR Compatibility** | Yes (but heavy) | No (Client-only) | Poor | Excellent |
| **Bundle Impact** | Very High (~800kb+) | High | High | Medium/Low |
| **License** | MIT | MIT | Apache 2.0 | MIT |
| **Maintenance** | Active (Redocly) | Slowing (Acquired) | Active (SmartBear) | Highly Active |
| **Code Examples** | Yes (Auto-generated) | Yes | Basic | Yes (Multi-language) |
| **Custom Branding** | Complex | Moderate | Very Difficult | Extremely Easy (CSS Vars) |

## 2. Detailed Evaluation

### A. Redoc
- **Pros:** The industry standard for beautiful, readable, three-column API documentation. Extremely robust JSON Schema rendering.
- **Cons:** The open-source version lacks an interactive "Try-It" console. It is primarily a static reading experience.
- **Decision:** **REFERENCE ONLY**. We need interactive testing for the Sandbox.

### B. Stoplight Elements
- **Pros:** Excellent out-of-the-box experience with a built-in Try-It console and code generation.
- **Cons:** Built on Web Components, which causes hydration mismatches and SSR difficulties in Next.js 14/15 App Router. Maintenance has slowed since the SmartBear acquisition.
- **Decision:** **REJECT**. Poor Next.js App Router compatibility.

### C. Swagger UI
- **Pros:** Universal familiarity. Robust Try-It functionality.
- **Cons:** The UI feels antiquated and does not align with the premium positioning of the SEMESTA ISLAM platform. Hard to theme.
- **Decision:** **REJECT**. Does not meet design standards.

### D. Scalar
- **Pros:** A modern, lightweight alternative specifically designed to look premium. It supports OpenAPI 3.1 natively, has a fantastic integrated API client (Try-It), generates code snippets in 20+ languages, and offers a dedicated `@scalar/api-reference-react` package that works flawlessly in Next.js.
- **Cons:** Newer to the market than Redoc/Swagger.
- **Decision:** **ADOPT**. Scalar aligns perfectly with a premium Developer Platform aesthetic, Next.js architecture, and the need for interactive sandbox capabilities.

## 3. Recommended Architecture

```text
Generated OpenAPI 3.1 JSON
        ↓
Next.js App Router API Route (`/api/docs/openapi.json`)
        ↓
Scalar React Component (`@scalar/api-reference-react`)
        ↓
Rendered at `/developers/api`
```

**Next Step:** Proceed to Phase P4 (Developer Consumption & Sandbox) to evaluate what developers will actually do with these docs and the `LOCAL_DEMO_MODE`.
