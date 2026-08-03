# Google Integration Setup — SEMESTA ISLAM

## Local Development (Simulation)

No Google configuration required. The app uses simulation providers automatically.

```
# .env.local
GOOGLE_INTEGRATION_MODE=simulation   # default; never call live Google in demo
STORAGE_MODE=local                    # LocalBackupProvider
MAGIC_LINK_PROVIDER=mock              # SimulationEmailProvider
```

Verify:
- `/management/system` shows providers with status `CONNECTED` (local) / `DISCONNECTED` (google-*) with "CLOUD CONFIGURATION REQUIRED".

## Production (Live)

### Prerequisites

1. Google Cloud project with billing (or Free Tier where applicable).
2. Enable required APIs: Drive, Gmail, (optional) Calendar, Meet, Sheets, Docs, Admin SDK.
3. Create credentials:
   - **Drive backup:** service account + JSON key (or OAuth).
   - **Gmail:** OAuth client ID/secret + redirect URI; user consent for `gmail.send`.
   - **Workspace Admin:** domain-wide delegation requires Google Workspace subscription + admin consent.
4. Set server-side env vars (never client-side / never committed):
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_PROJECT_ID`, `GOOGLE_DRIVE_BACKUP_FOLDER_ID`, `GOOGLE_WORKSPACE_CUSTOMER_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.
5. Set `GOOGLE_INTEGRATION_MODE=live`.

### Deployment notes

- Credentials belong in the platform's secrets manager (e.g. Google Cloud Secret Manager), not `.env` in the repo.
- Test connection via the founder control plane (`/management/system`) before enabling live operations.
- Respect quota + exponential backoff in all provider implementations.

## State classification

- **IMPLEMENTED IN CODE:** adapter interfaces, simulation providers, Google provider stubs, health model, job model, RBAC capabilities, tests.
- **REQUIRES GOOGLE CLOUD / WORKSPACE CONFIGURATION:** any live provider call (Drive/Gmail/etc.).
- **REQUIRES PAID/ADMIN-LEVEL GOOGLE WORKSPACE:** Workspace Admin SDK / domain-wide delegation.
