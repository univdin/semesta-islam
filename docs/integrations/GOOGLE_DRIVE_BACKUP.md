# Google Drive Backup — SEMESTA ISLAM

**Status:** ADAPTER IMPLEMENTED (simulation + production stub) · live connection REQUIRES GOOGLE CLOUD CONFIGURATION.

## Architecture

```
BackupService (src/lib/operations/backup.ts)
├── LocalBackupProvider      — localhost simulation, no secrets
└── GoogleDriveBackupProvider — production destination (requires credentials)
```

Provider selection mirrors `PAYMENT_PROVIDER` / `STORAGE_MODE`: when `STORAGE_MODE !== 'local'`, Google Drive provider is used.

## Backup Structure (target)

```
SEMESTA ISLAM/
├── BACKUPS/
├── EXPORTS/
├── REPORTS/
├── DOCUMENTS/
└── INTERNAL/
```

Each backup contains a manifest:
- backupId · createdAt · applicationVersion · schemaVersion · environment
- provider · status · fileCount · checksum (SHA-256)

## Security

- Credentials are server-side (service account / domain-wide delegation).
- Never store `.env`, service-role keys, cookies, or API secrets in backup.
- Restore is DRY-RUN / REVIEW ONLY; requires FOUNDER_ADMIN + audit event.

## Configuration Required (live)

- Google Cloud project + Drive API enabled
- Service account (or OAuth) with Drive write scope
- `GOOGLE_DRIVE_BACKUP_FOLDER_ID` env var
- `GOOGLE_INTEGRATION_MODE=live` in production

Official reference: https://developers.google.com/workspace/drive
