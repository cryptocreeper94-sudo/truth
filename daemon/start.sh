#!/bin/bash
# TRUTH — Research Daemon Production Startup (Coolify/Docker)
# DarkWave Studios LLC — Copyright 2026
#
# Architecture: 42-Doctrine Deterministic Dissolution Ladder
# v0.4.0 — Lume-V Governed, 8 invariants, GitHub API for all repo operations

echo "== TRUTH Research Daemon — Production Startup =="
echo "== Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "== Architecture: DDA 42-Doctrine"
echo "== Governance: Lume-V Protocol (8 invariants, SHA-256 certificates)"
echo "== Version: v0.4.0 (Lume-V Governed)"

# Start daemon (foreground — keeps container alive)
echo "== [DAEMON] Starting Truth Research Daemon..."
cd /app
exec node daemon/daemon.mjs
