# SEMESTA ISLAM — API FILTERING, SORTING & SEARCH CONTRACT
**Status:** `[REPOSITORY VERIFIED]` (Matches `DirectoryFilterSchema` in `src/lib/validations/index.ts`)

This document defines the query filtering, sorting, and search parameter conventions across the public API endpoints.

---

## 1. Directory Filtering Schema (`DirectoryFilterSchema`)

Endpoint: `GET /api/v1/educators`

| Parameter | Type | Allowed Values | Description |
| :--- | :--- | :--- | :--- |
| `category` | String | e.g. `TAHSIN_QURAN`, `FIQH` | Filter by course category |
| `method` | Enum | `all`, `ONLINE_ZOOM`, `PRIVATE_HOME`, `GROUP_MAJELIS` | Filter by learning delivery method |
| `query` | String | Text string | Search in educator name, institution, or bio |
| `sort` | Enum | `rating`, `reviews` | Sort order (`rating` descending, `reviews` descending) |

---

## 2. Parameter Sanitization Rules
1. All string parameters are trimmed and sanitized against SQL injection / XSS vectors.
2. Invalid enum values default to `all` or throw a `400 Bad Request` validation error.
