#!/bin/bash
# TRUTH — Research Daemon Production Startup (Coolify/Docker)
# DarkWave Studios LLC — Copyright 2026
#
# Architecture: 42-Doctrine Deterministic Dissolution Ladder
# This script boots the Truth Research Daemon as the foreground process.

echo "== TRUTH Research Daemon — Production Startup =="
echo "== Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "== Architecture: DDA 42-Doctrine"

# Ensure directories exist
mkdir -p claims sources/tier-1 digs daemon

# Configure git for daemon commits
git config --global user.email "daemon@truth.tlid.io"
git config --global user.name "Truth Research Daemon"

# Pull latest before starting
echo "== [GIT] Pulling latest from origin..."
git pull origin main --ff-only 2>/dev/null || echo "== [GIT] Pull skipped (not a git repo or no remote)"

# Start daemon (foreground — keeps container alive)
echo "== [DAEMON] Starting Truth Research Daemon..."
cd /app
exec node daemon/daemon.mjs
