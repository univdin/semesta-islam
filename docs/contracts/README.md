# SEMESTA ISLAM — API CONTRACT SYSTEM
**Gate:** CONTRACT GENERATION GATE
**Status:** `[CONTRACT ONLY]` / `[EVIDENCE VERIFIED]`

Welcome to the canonical API Contract System for SEMESTA ISLAM. This directory contains the machine-readable JSON Schemas, OpenAPI 3.1.0 specification, security & governance policies, and contract definitions for the SEMESTA ISLAM Developer Platform.

---

## Directory Structure

```text
docs/contracts/
├── README.md                         # Index & governance rules
├── openapi.yaml                      # Canonical OpenAPI 3.1.0 specification
├── schemas/                          # Machine-readable JSON Schemas (Draft 2020-12)
│   ├── educator.schema.json         # Educator Profile & Metadata
│   ├── course.schema.json           # Course Catalog & Schedules
│   ├── sanad.schema.json            # Sanad Chain & Transmission Records
│   ├── verification.schema.json     # Verification Request & Status
│   ├── trust-metadata.schema.json   # Cryptographic Provenance & Trust Metadata
│   ├── error.schema.json            # Standardized Error Envelope
│   ├── pagination.schema.json       # Cursor & Offset Pagination Metadata
│   └── webhook-event.schema.json    # Event Delivery Payload & Signatures
│
├── authentication.md                 # Anonymous, API Key, and Webhook Signing rules
├── authorization.md                  # RBAC and API Scope mappings
├── versioning.md                     # URI versioning & compatibility guarantees
├── errors.md                         # Error status code mappings & payload definitions
├── pagination.md                     # Pagination conventions
├── filtering.md                      # Query parameters, sorting, and search rules
├── trust-provenance.md               # Cryptographic SHA-256 document fingerprinting rules
├── webhooks.md                       # HMAC SHA-256 event subscription specifications
└── sandbox.md                        # Local Demo Mode & SEMESTA SANDBOX contract
```

---

## Authority & Governance

1. **Source of Truth:** Zod validators (`src/lib/validations/index.ts`) and Prisma schema (`prisma/schema.prisma`) remain the runtime source of truth.
2. **Contract Standard:** JSON Schemas follow **JSON Schema Draft 2020-12**. OpenAPI follows **OpenAPI 3.1.0**.
3. **No Premature Cloud Operations:** All contracts in this directory are designed for localhost verification and local demo mode until explicit Founder cloud authorization is granted.

---

## Status Classification Legend

- `[IMPLEMENTED + RUNTIME VERIFIED]`: Route and logic executed and verified on localhost.
- `[IMPLEMENTED + CODE VERIFIED]`: Implemented in TypeScript source code and Prisma models.
- `[CONTRACT ONLY]`: Machine-readable specification created for future API implementation.
- `[PROPOSED]`: Proposed enhancement or feature under architectural review.
