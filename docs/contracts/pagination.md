# SEMESTA ISLAM — API PAGINATION CONVENTIONS
**Status:** `[REPOSITORY VERIFIED]` / `[DOCUMENT VERIFIED]` — response `meta` envelope is `[FUTURE / ASPIRATIONAL]` per Decision #3 (2026-08-01)

This document defines the pagination conventions for collection endpoints in SEMESTA ISLAM.

> **MVP note (Decision #3):** No runtime collection (list) endpoint exists yet in the B2C MVP, so `meta`/`PaginationMeta` is NOT required by any current endpoint. These conventions apply to the post-MVP list APIs (e.g., `GET /api/v1/educators` `[CONTRACT ONLY]`).

---

## 1. Query Parameters

| Parameter | Type | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | Integer | `1` | `min: 1` | 1-indexed page number |
| `limit` | Integer | `10` | `min: 1, max: 100` | Number of items per page |

---

## 2. Response Metadata Envelope

Paginated list responses include a `meta` payload alongside `data`:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 3. Future Cursor-Based Pagination
For high-frequency real-time SDK connections, cursor pagination (`after_id`, `before_id`) will be supported in `v1.1`.
