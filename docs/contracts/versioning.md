# SEMESTA ISLAM — API VERSIONING & COMPATIBILITY POLICY
**Status:** `[DOCUMENT VERIFIED]`

This document defines the versioning strategy and backward compatibility rules for the SEMESTA ISLAM API.

---

## 1. URI Versioning Scheme

All API endpoints follow explicit URI prefix versioning:
```text
/api/v1/...
```

- **Current Stable Version:** `v1`
- **Deprecation Target:** Version `v2` will not be introduced until breaking domain model changes necessitate it.

---

## 2. Breaking vs Non-Breaking Changes

### Non-Breaking Changes (Allowed within `v1`):
- Adding new optional request query parameters.
- Adding new properties to existing response JSON objects.
- Adding new endpoints.
- Adding new enum values to response objects (consumers must handle unknown enums gracefully).

### Breaking Changes (Requires `v2` or deprecation window):
- Removing or renaming an existing JSON response field.
- Changing a field's data type (e.g. string to array).
- Making a previously optional request parameter required.
- Altering the semantic behavior or status code of an existing route.

---

## 3. Deprecation Window & Sunset Policy
- Deprecated fields will be flagged in OpenAPI with `deprecated: true` and returned with an `X-API-Deprecated: true` response header.
- A minimum 6-month notice will be given before any endpoint or version is sunsetted.
