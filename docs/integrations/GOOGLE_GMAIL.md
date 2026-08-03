# Google Gmail Integration — SEMESTA ISLAM

**Status:** ADAPTER IMPLEMENTED (simulation + production stub) · live connection REQUIRES GOOGLE CLOUD / WORKSPACE CONFIGURATION.

## Architecture

```
EmailProvider (src/lib/email/service.ts)
├── SimulationEmailProvider — localhost, no network
└── GmailEmailProvider      — production, requires OAuth
```

Transactional email (booking confirmation, verification notification, staff notification, founder alert) uses the provider boundary. Bulk marketing mailing is kept SEPARATE and gated by consent + quotas.

## Provider Selection

`MAGIC_LINK_PROVIDER` env selects the adapter:
- `mock` → SimulationEmailProvider
- `supabase` / `resend` → GmailEmailProvider (production)

## Security

- OAuth user consent (authorized user) for Gmail API (`gmail.send`).
- Server-side credentials only.
- Application identity ≠ Google identity (explicit integration-account mapping when required).

## Configuration Required (live)

- Google Cloud project + Gmail API enabled
- OAuth client (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`)
- User consent for `gmail.send` scope
- `GOOGLE_INTEGRATION_MODE=live` in production

## Quota Notes

- Standard Gmail API quotas apply; mass newsletter through raw Gmail API requires explicit sending-policy verification.
- For bulk campaigns, prefer a dedicated ESP / mailing subsystem (see listmonk adapter boundary).

Official reference: https://developers.google.com/gmail/api
