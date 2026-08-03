# SEMESTA ISLAM — JSON SCHEMA STRATEGY
**Phase:** P2
**Status:** [EXTERNAL RESEARCH VERIFIED] [REPOSITORY VERIFIED]

This document evaluates JSON Schema as the canonical machine-readable contract for the SEMESTA ISLAM Developer Platform, determining its relationship to the existing runtime validation (Zod).

## 1. JSON Schema Specification Evaluation

**Reference Repository:** `https://github.com/json-schema-org/json-schema-spec`
**Target Draft:** JSON Schema Draft 2020-12 (or Draft 2019-09)

**Rationale:**
OpenAPI 3.1.0 fully supports JSON Schema Draft 2020-12. Using this draft ensures 100% compatibility between the standalone JSON Schema definitions and the OpenAPI specification.

## 2. Relationship to Existing Zod Schemas

**Current State (`src/lib/validations/index.ts`):**
SEMESTA ISLAM currently uses Zod (v3.24.1) for runtime validation (e.g., `VerificationSubmitSchema`, `BookingInquirySchema`).

**Architectural Hypothesis Evaluated:**
```text
Domain Contract → JSON Schema → OpenAPI → Runtime Validation → Documentation → SDK
```

**Finding [REPOSITORY VERIFIED]:**
Reversing the flow (authoring JSON Schema first, then generating Zod schemas) would require rewriting the existing verified `validations/index.ts` file, introducing significant risk and violating the directive to not rewrite verified architecture.

**Revised Architecture [CODE VERIFIED]:**
```text
Domain Contract
      ↓
Zod (Runtime Validation - Single Source of Truth)
      ↓ (via `zod-to-json-schema`)
JSON Schema Draft 2020-12
      ↓
OpenAPI 3.1
      ↓
Developer Documentation & SDKs
```

## 3. Zod → JSON Schema Viability

**Evaluation of `zod-to-json-schema`:**
- It is highly reliable for generating Draft 2020-12 / Draft 7 schemas directly from Zod definitions.
- It preserves `z.describe()` as JSON Schema `description` fields.
- It handles complex regex (e.g., `PhoneRegex`, `Sha256Regex`) accurately.

**Decision:** We will **generate** JSON schemas from the existing Zod validators for the API Request payloads. We will author new Zod schemas to represent the API Response payloads (e.g., the `Educator` API Resource defined in P1) and generate JSON Schemas from those as well.

## 4. Contract Versioning and IDs

- **Schema IDs (`$id`):** Each generated schema will have a unique `$id` (e.g., `https://api.semestaislam.com/schemas/v1/Educator.json`).
- **Versioning:** URI versioning (`/v1/`) will be applied to the schema `$id`.
- **Backward Compatibility:** Because Zod is the source of truth, CI/CD can use tools like `openapi-diff` to compare the generated OpenAPI/JSON Schema against the previous version to detect breaking changes before deployment.

## 5. Examples

Examples must be added directly into the Zod schemas using `.describe()` or a custom `.openapi({ example: ... })` extension (e.g., via `@asteasolutions/zod-to-openapi`) so that they cascade down into the generated JSON Schema and OpenAPI documentation.

## Conclusion & Next Steps
JSON Schema (Draft 2020-12) will be the canonical *exported* contract, but Zod remains the canonical *authored* contract. 
**Next Step:** Proceed to Phase P3 (OpenAPI Tooling Evaluation) to determine how to render these generated schemas into Developer Documentation.
