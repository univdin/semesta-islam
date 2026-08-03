# SEMESTA ISLAM — PRODUCT REALITY MAP

## Current Product Surface Map
- **Public**: `src/app/directory` and `src/app/educator/[id]` exist for Discovery and Evaluation. Booking flow is stubbed at `src/app/booking`.
- **Learner**: `src/app/management` covers some aspects, but distinct `/learner/dashboard` is not cleanly separated yet.
- **Educator**: No dedicated `/educator/dashboard` separated from management.
- **Lajnah / Management**: `src/app/management/lajnah` exists for Verification processes.
- **Developer**: Not implemented.

## Current Developer Surface Map
- **Existing Routes**: `src/app/api/v1/bookings`, `src/app/api/v1/verification`
- **Existing APIs**: Verification and Booking endpoints.
- **Existing Contracts**: None formally exported in JSON Schema/OpenAPI.
- **Existing Documentation**: None specific to `/developer`.
- **Missing Capabilities**: Everything related to the Developer Surface (`/developer`).
- **Recommended MVP Scope**: `/developer`, `/developer/docs`, `/developer/api`, `/developer/schemas` covering existing Booking/Verification capabilities.
- **Deferred Capabilities**: API keys, OAuth, Webhooks, Billing, Rate Limit Dashboards, etc.
