# Google Cloud / Workspace Integration — SEMESTA ISLAM

**Status:** INTERFACES + ADAPTERS + SIMULATION IMPLEMENTED IN CODE · **REQUIRES GOOGLE CLOUD / WORKSPACE CONFIGURATION** for live connections.

This document describes the provider-agnostic integration layer. Google is an external provider, never the core domain architecture. Credentials never reach the browser.

---

## 1. Architecture

```
IntegrationService
├── StorageProvider
│   ├── LocalBackupProvider      (implemented — simulation)
│   └── GoogleDriveBackupProvider (implemented — requires credentials)
├── EmailProvider
│   ├── SimulationEmailProvider  (implemented)
│   └── GmailEmailProvider       (implemented — requires OAuth)
├── CalendarProvider             (adapter interface planned)
├── MeetingProvider              (adapter interface planned)
├── SpreadsheetProvider          (adapter interface planned)
└── DocumentProvider             (adapter interface planned)
```

Domain services MUST NOT depend on Google SDK implementations directly.

## 2. Implementation Status

| Provider | Interface | Simulation | Production Adapter | Requires |
|---|---|---|---|---|
| Drive backup | `BackupProvider` (`src/lib/operations/backup.ts`) | LocalBackupProvider | GoogleDriveBackupProvider | `GOOGLE_DRIVE_FOLDER_ID` + service account/OAuth |
| Gmail | `EmailProvider` (`src/lib/email/service.ts`) | SimulationEmailProvider | GmailEmailProvider | OAuth user consent (Gmail API scope) |
| Calendar/Meet/Sheets/Docs/Admin | planned adapter boundaries | — | — | production config |

## 3. Authentication Strategies (per integration type)

| Integration | Recommended auth | Prerequisite |
|---|---|---|
| Drive backup (server-to-server) | Service account (domain-wide delegation) | Google Cloud project + service account key |
| Gmail transactional | OAuth user consent (authorized user) | OAuth client + redirect URI + `gmail.send` scope |
| Workspace Admin | Domain-wide delegation | Google Workspace plan + admin consent |

These are DEPLOYMENT PREREQUISITES. Localhost uses simulation providers only.

## 4. Environment Variables (server-side only)

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
GOOGLE_PROJECT_ID
GOOGLE_DRIVE_BACKUP_FOLDER_ID
GOOGLE_WORKSPACE_CUSTOMER_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
```

Do NOT add variables that are not required by the chosen auth strategy.

## 5. Backup Policy

- Backup is adapter-based; destination is swappable (Local → Google Drive → future S3/R2).
- Backup payload is **logical metadata only** — never `.env`, service-role keys, session cookies, or API secrets.
- Restore is **DRY-RUN / REVIEW ONLY** and requires `FOUNDER_ADMIN` + explicit confirmation + audit event.
- Every backup create/verify/restore-request produces an `audit_logs` entry.

## 6. Security Rules

- Server-side credentials only (service account / OAuth). Never in browser bundle or public env.
- Identity is resolved server-side (`getServerIdentity()`); Google identity is separate from application identity.
- `GOOGLE_INTEGRATION_MODE=simulation` (localhost) vs `live` (production). Demo never calls a production Google account.
- Sensitive actions (backup.restore, secret.manage, ownership.transfer) are founder-only.

## 7. Observability

`IntegrationHealth` model tracks per-provider: status, lastSuccessAt, lastFailureAt, errorCode, errorMessage, latency, quotaStatus. Founder sees this in `/management/system`.

`IntegrationJob` model provides retry-with-backoff bookkeeping (jobId, provider, operation, status, attempt, lastError).

## 8. Quota / Cost Notes

- Google Drive/Gmail APIs provide standard quotas without additional API charges, within limits.
- Exponential backoff is mandatory on all Google API calls.
- Billing requirements may change; quota assumptions are documented, not guaranteed.
- Google Workspace subscription requirements are distinct from API usage costs.
- Google Cloud Free Tier / Trial are NOT permanently free infrastructure.

## 9. Official References

- Google Workspace developer portal: https://developers.google.com/workspace
- Google Drive API: https://developers.google.com/workspace/drive
- Google Gmail API: https://developers.google.com/gmail/api
- Google Calendar API: https://developers.google.com/workspace/calendar
- Google Meet API: https://developers.google.com/workspace/meet/api
- Google Sheets API: https://developers.google.com/sheets/api
- Google Docs API: https://developers.google.com/docs/api
- Google Admin SDK: https://developers.google.com/workspace/admin
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
