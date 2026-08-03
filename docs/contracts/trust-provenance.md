# SEMESTA ISLAM — TRUST & PROVENANCE SPECIFICATION
**Status:** `[CODE VERIFIED]` / `[DOCUMENT VERIFIED]`

This document specifies the cryptographic document fingerprinting and trust provenance mechanisms of SEMESTA ISLAM.

---

## 1. What SEMESTA Asserts vs Does NOT Assert

### What SEMESTA Asserts:
- **Record Existence:** An educator record exists with verifiable credentials.
- **Lajnah Standing:** The educator's document was reviewed and assigned a status (`VERIFIED`, `REJECTED`, `UNDER_REVIEW_LAJNAH`).
- **Document Integrity:** The submitted Ijazah matches the SHA-256 fingerprint registered at review time (`layer2Sha256Hash`).

### What SEMESTA Does NOT Assert:
- **No Theological Infallibility:** The system asserts administrative verification by human reviewers, NOT religious infallibility or theological absolute truth.
- **No Endorsement Beyond Lajnah Scope:** Verification applies strictly to documented Sanad credentials.

---

## 2. SHA-256 Fingerprint Validation (`isValidSha256`)

In `src/lib/security/documents.ts`:
- Regex: `^[a-fA-F0-9]{64}$`
- Validates 64-character hexadecimal SHA-256 strings.
- Rejects non-conforming or corrupted hashes with `HTTP 400 Bad Request`.

---

## 3. Cryptographic Verification API Endpoint (Proposed)

`GET /api/v1/verify-document?hash={sha256}`
- Query parameter: 64-character SHA-256 hash.
- Response:
  ```json
  {
    "matched": true,
    "verificationStatus": "VERIFIED",
    "verificationAuthority": "Lajnah Semesta Islam",
    "verifiedAt": "2026-08-01T00:00:00.000Z",
    "documentIntegrityHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```
- Allows external platforms to verify physical Ijazah certificates without transferring PII or image files.
