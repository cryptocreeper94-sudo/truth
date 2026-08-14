# Infrastructure Backup Strategy
*Written after a full Coolify environment was lost to a `docker system prune --volumes` command.*

---

## The core rule

**No critical data should exist in only one place.**

Code → GitHub. Databases → scheduled off-server dumps. Secrets → encrypted external store. Coolify configuration → exported or version-controlled. Persistent files → object storage with redundancy.

If any one of those layers disappears, recovery should take hours, not months.

---

## What was lost and why

| Layer | What happened | Prevention |
|---|---|---|
| Running apps | Docker containers pruned | Containers are disposable — code in Git is the source |
| Databases | Coolify-provisioned Postgres/Redis volumes pruned | Off-server automated dumps (see below) |
| Environment variables | Stored only in Coolify UI | Encrypted backup outside Coolify (see below) |
| Persistent file storage | Docker volumes pruned | Object storage (S3-compatible) outside Docker |
| Coolify app config | Never exported | Version-controlled compose files or Coolify backup (see below) |

---

## Layer 1 — Code (already solved)

All source code lives in GitHub. No action needed beyond keeping commits current.

**Do not store code only in Coolify's Git mirror or as a running container.**

---

## Layer 2 — Database backups

### Recommended approach: automated pg_dump to Backblaze B2

Backblaze B2 costs approximately $0.006/GB/month and has a free 10 GB tier. S3-compatible API.

**Steps:**

1. Create a Backblaze B2 bucket. Note the bucket name, key ID, and application key.
2. On the VPS, install `b2` CLI or use `rclone` (preferred — works with any S3-compatible target).
3. Create a backup script at `/opt/backup/pg-backup.sh`:

```bash
#!/bin/bash
set -euo pipefail

DATE=$(date +%Y-%m-%dT%H-%M-%S)
APP_NAME="${1:-truth}"                     # pass app name as first argument
DB_URL="${DB_BACKUP_URL}"                  # set this env var to your Postgres connection string
BUCKET="s3:backblaze-b2/${YOUR_BUCKET}"   # configure rclone remote named backblaze-b2
DEST="${BUCKET}/${APP_NAME}/${DATE}.dump"

pg_dump --format=custom "${DB_URL}" | rclone rcat "${DEST}"
echo "Backup complete: ${DEST}"
```

4. Store `DB_BACKUP_URL` and rclone credentials in `/etc/environment` or a protected `.env` file owned by root with `chmod 600`.
5. Add a cron job as root:

```cron
# Daily at 02:00, keep last 30 days
0 2 * * * /opt/backup/pg-backup.sh truth >> /var/log/pg-backup.log 2>&1
```

6. Add a weekly retention cleanup:

```cron
# Delete backups older than 30 days
0 3 * * 0 rclone delete s3:backblaze-b2/YOUR_BUCKET/truth --min-age 720h
```

**Test restore before trusting the backup:**

```bash
pg_restore --format=custom --dbname=postgres://... /tmp/test.dump
```

Run a restore drill once per month. A backup you have never restored is an untested assumption.

---

## Layer 3 — Environment variables and secrets

### Recommended approach: encrypted file in a private GitHub repo or Bitwarden

**Option A — Bitwarden (recommended for individuals and small teams):**
- Free tier supports secure notes with no size limit.
- Store one secure note per app with all env var key=value pairs.
- Update the note whenever you rotate or add a variable.
- Bitwarden exports can be saved to an encrypted local file as a secondary backup.

**Option B — Private GitHub repo with encrypted file:**
```bash
# Encrypt with gpg before committing
gpg --symmetric --cipher-algo AES256 truth-production.env
git add truth-production.env.gpg
git commit -m "Update production env backup"
```
Never commit a plain `.env` file.

**What to capture per app:**
- Every variable currently in the Coolify UI
- Database connection strings
- API keys (OpenAI, Stripe, GitHub PAT, etc.)
- Session secrets
- OAuth client IDs and secrets
- Storage credentials

**Update this backup every time you add or rotate a secret.** Immediately after adding a new variable in Coolify, add it to the backup store.

---

## Layer 4 — Persistent file storage

### Recommended approach: move uploads out of Docker volumes entirely

Docker volumes are the wrong place for user uploads, media, or any file that must survive a container rebuild.

Use an S3-compatible object storage service instead:

| Provider | Free tier | Cost after |
|---|---|---|
| Backblaze B2 | 10 GB + 1 GB/day egress | $0.006/GB/month |
| Cloudflare R2 | 10 GB/month | $0.015/GB/month, zero egress fees |
| Wasabi | None | $0.0068/GB/month, no egress fees |

**For Truth specifically:** DVE downloaded media and verification reports should be stored in object storage, not on the VPS filesystem or in Docker volumes. Configure the app to write to and read from the bucket directly. This means a container rebuild or prune has no effect on stored media.

---

## Layer 5 — Coolify configuration

### Recommended approach: export Coolify's own database

Coolify stores all of its app definitions, environment variable metadata, deployment history, and service configuration in its own database (SQLite or Postgres depending on version).

**Backup Coolify itself:**

```bash
# For SQLite-backed Coolify (typical self-hosted)
cp /data/coolify/database.sqlite /opt/backup/coolify-$(date +%Y-%m-%d).sqlite
# Then upload to B2 or another off-server location
rclone copy /opt/backup/coolify-$(date +%Y-%m-%d).sqlite s3:backblaze-b2/YOUR_BUCKET/coolify/
```

Add this to the same cron schedule as the database backup.

**Also: version-control your docker-compose files.** If you maintain a `docker-compose.yml` or Coolify stack definition for each app, keep those in a private GitHub repo. A lost Coolify instance can then be rebuilt from scratch using those definitions plus the env var backup.

---

## Layer 6 — VPS snapshots

Most VPS providers (Hetzner, DigitalOcean, Linode, Vultr) offer snapshot pricing at roughly $0.01–0.02/GB/month.

**Recommended schedule:**
- Weekly VPS snapshot
- Keep last 4 snapshots (4 weeks of coverage)
- Take a manual snapshot before any maintenance, upgrade, or large prune operation

A snapshot is not a substitute for application-level backups because it captures the full disk state at one moment. But it provides a fast recovery path if the OS or Coolify installation itself is damaged.

**This is the one that would have saved you today.** A snapshot taken the day before the prune would have allowed a full restore in under an hour.

---

## The one rule that prevents most disasters

### Always take a VPS snapshot before running any Docker cleanup command.

```bash
# Before any of these, snapshot first:
docker system prune
docker system prune --volumes
docker volume rm
docker compose down -v
```

These commands cannot be undone. A snapshot can be.

Consider adding this alias to root's `.bashrc` on the production VPS:

```bash
alias docker-prune-safe='echo "ERROR: Take a VPS snapshot first. Then run docker system prune manually." && false'
```

This forces a pause before running any prune command by accident.

---

## Recovery order (if starting from zero)

When you have lost everything and are rebuilding:

1. **Provision a new VPS or restore a VPS snapshot** (fastest if snapshot exists).
2. **Install Coolify** on the fresh VPS.
3. **Restore Coolify's own database** from the Coolify backup if available; otherwise recreate apps manually using your docker-compose files.
4. **Restore environment variables** from Bitwarden or the encrypted backup file.
5. **Create new databases** (Postgres/Redis). Do not use old credentials — generate fresh passwords.
6. **Restore database data** from the latest pg_dump backup using `pg_restore`.
7. **Point apps to the new database credentials** via updated environment variables in Coolify.
8. **Trigger a fresh deployment** from GitHub. Code is already in the repo.
9. **Verify the app** is running and data is present before considering recovery complete.
10. **Rotate any secrets** that may have been exposed during the incident.

---

## Minimum viable backup setup (do this first)

If you implement nothing else, implement these three things:

1. **Weekly VPS snapshot** — $1–5/month, saves everything.
2. **Daily pg_dump to Backblaze B2** — free tier covers most databases, automated, off-server.
3. **Bitwarden secure note with all env vars** — free, updated every time you change a secret.

These three together mean that the worst case after any infrastructure loss is one week of data plus an afternoon of rebuild time.

---

## For the Truth / DVE project specifically

| Asset | Backup method | Location |
|---|---|---|
| Source code (Replit workspace) | GitHub `master` branch | `cryptocreeper94-sudo/truth` |
| Source code (production) | GitHub `main` branch | `cryptocreeper94-sudo/truth` |
| DVE branch handoff doc | `ROADMAP.md` on `master` | explains both branches and porting decisions |
| DVE product spec | `DVE_PRODUCT_SPEC.md` on `master` | pricing, trust rules, visibility model |
| Verification job data | Coolify Postgres volume | **currently unprotected — add pg_dump backup now** |
| OpenAI credentials | Coolify env UI | **add to Bitwarden now** |
| Session secret | Coolify env UI | **add to Bitwarden now** |
| GitHub PAT | Coolify env UI | **add to Bitwarden now** |

The DVE pipeline downloads video to a temporary directory during analysis. Downloaded media is discarded after transcription. There is no persistent media to back up yet. If media retention is added later, it must go to object storage, not a Docker volume.

---

*Last updated: August 2026. Update this document whenever infrastructure changes.*
