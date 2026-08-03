# SEMESTA ISLAM — TRUST & PROVENANCE METADATA CONTRACT
**Phase:** P6
**Status:** [REPOSITORY VERIFIED] [BUSINESS HYPOTHESIS]

This document defines the structured trust metadata that forms the core defensible asset of the SEMESTA ISLAM platform. It defines exactly what provenance data can be safely exposed via public APIs without leaking sensitive documents.

## 1. The Core Asset
SEMESTA ISLAM's primary value proposition for third-party developers is **not** its directory of names, but the cryptographic and institutional **trust** associated with those names. This trust must be represented as a machine-readable data contract.

## 2. Public Trust Metadata Fields

The following fields will be injected into the `Educator` API resource payload. These are derived from the `VerificationRequest`, `EducatorProfile`, and `SanadRecord` Prisma models, but scrubbed of sensitive PII.

| Field Name | Type | Source / Derivation | Justification |
| :--- | :--- | :--- | :--- |
| `verificationStatus` | Enum | `EducatorProfile.verifiedStatus` | The high-level indicator (`VERIFIED`, `UNDER_REVIEW_LAJNAH`, etc.). |
| `trustScore` | Float | Derived from `layer4EthicsScore` | A normalized score indicating Lajnah confidence. |
| `verificationAuthority` | String | Hardcoded: "Lajnah Semesta Islam" | Provenance of the verification. |
| `lastVerifiedAt` | DateTime | `VerificationRequest.updatedAt` | Ensures consumers know how fresh the verification is. |
| `sanadAvailable` | Boolean | Computed: `sanadRecords.length > 0` | A flag for apps to know if deeper provenance exists. |
| `documentIntegrityHash` | String | `layer2Sha256Hash` | The SHA-256 hash of the Ijazah. This allows external parties to cryptographically verify a physical document without the API exposing the actual document image. |

## 3. Strictly Private Fields [SENSITIVE]

The following fields MUST NEVER be included in the Trust Metadata API response:

- `layer1KtpUrl`: Contains government ID imagery.
- `layer2IjazahUrl`: Contains physical certificate imagery.
- `layer3RecommenderEmail`: Exposes private contact info.

## 4. Cryptographic Provenance (The SHA-256 Hash)

The decision to expose the `layer2Sha256Hash` (Document Integrity Hash) is the cornerstone of this API. 
**Use Case:** An event organizer receives a physical Ijazah certificate from an educator. The organizer can run the certificate through a standard SHA-256 hashing tool and query the SEMESTA API: `GET /api/v1/verify-document?hash=...`. If it matches, they know the document is mathematically identical to the one verified by the Lajnah, *without* SEMESTA ever needing to host or transmit the image publicly.

**Next Step:** Proceed to Phase P7 (Cloud-Independent Integration Readiness) to evaluate the infrastructure needed to secure and deliver this API.
