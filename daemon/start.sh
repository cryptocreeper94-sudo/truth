#!/bin/bash
# TRUTH — Research Daemon Production Startup (Coolify/Docker)
# DarkWave Studios LLC — Copyright 2026
#
# Architecture: 42-Doctrine Deterministic Dissolution Ladder
# v0.3.0 — Uses GitHub API for all repo operations (no git needed)

echo "== TRUTH Research Daemon — Production Startup =="
echo "== Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "== Architecture: DDA 42-Doctrine"
echo "== Version: v0.3.0 (GitHub API)"

# Start daemon (foreground — keeps container alive)
echo "== [DAEMON] Starting Truth Research Daemon..."
cd /app
exec node daemon/daemon.mjs
