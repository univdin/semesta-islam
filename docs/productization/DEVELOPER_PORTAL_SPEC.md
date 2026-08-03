# SEMESTA ISLAM — DEVELOPER PORTAL SPECIFICATION
**Phase:** CONTRACT GENERATION GATE
**Status:** `[PROPOSED]` / `[DOCUMENT VERIFIED]`

This document specifies the Information Architecture (IA), routing, components, and rendering configuration for the SEMESTA ISLAM Developer Portal (`/developers`).

---

## 1. Information Architecture & Route Hierarchy

```text
/developers/
├── page.tsx                           # Developer Portal Landing & Overview
├── docs/
│   └── page.tsx                       # Getting Started & Integration Guides
├── api/
│   └── page.tsx                       # Scalar Interactive API Reference
├── keys/
│   └── page.tsx                       # API Key Management Dashboard (Local Demo)
├── sandbox/
│   └── page.tsx                       # Sandbox Interactive Console & Fixtures
└── changelog/
    └── page.tsx                       # API Changelog & Versioning Notices
```

---

## 2. API Reference Renderer Configuration (Scalar)

As decided in P3 (`docs/API_DOCUMENTATION_EVALUATION.md`), `@scalar/api-reference-react` is selected as the canonical rendering engine.

### Route Implementation Strategy (`src/app/developers/api/page.tsx`):
```tsx
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';

export default function ApiDocsPage() {
  return (
    <ApiReferenceReact
      configuration={{
        spec: {
          url: '/api/v1/openapi.json',
        },
        theme: 'purple',
        showSidebar: true,
      }}
    />
  );
}
```

---

## 3. OpenAPI Endpoint (`/api/v1/openapi.json`)
A dynamic Next.js App Router GET endpoint will serve `openapi.yaml` parsed into JSON format at runtime:
- Path: `src/app/api/v1/openapi.json/route.ts`
- Access: Public
- Cache Control: `public, max-age=3600`
