#!/bin/bash
# TRUTH Observatory — Production Startup (Coolify/Docker)
# DarkWave Studios LLC — Copyright 2026
#
# Architecture: 42-Doctrine Deterministic Dissolution Ladder
# v1.0.0
#
# Runs all collectors in the foreground via a simple supervisor loop.
# NO PM2. NO process managers. Each collector is a long-running Node process.
# If a collector exits (collapse detection, fatal error), it is restarted
# after a brief backoff — the container itself stays alive for Coolify to manage.
#
# DDA Doctrine nodes implemented here:
#   [35] Collapse Detection → restart on exit with backoff
#   [42] Devoid Limit       → fatal errors logged, state preserved, container stays alive

set -euo pipefail

echo "══════════════════════════════════════════════════════════════════"
echo " TRUTH Observatory — Production Startup"
echo " Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo " Architecture: DDA 42-Doctrine / Deterministic Dissolution Ladder"
echo " Version: v1.0.0"
echo "══════════════════════════════════════════════════════════════════"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${STATE_DIR:-/app/state/observatory}"
RAW_DIR="${RAW_DIR:-/app/state/observatory/raw}"

export STATE_DIR RAW_DIR

mkdir -p "$STATE_DIR" "$RAW_DIR"

echo "State dir: $STATE_DIR"
echo "Raw dir:   $RAW_DIR"
echo ""

# ── Supervisor: restart a collector on exit ──────────────────────────────────
run_collector() {
  local name="$1"
  local script="$2"
  local backoff=10

  while true; do
    echo "[SUPERVISOR] Starting $name..."
    node "$script" &
    local pid=$!
    wait "$pid" || true
    local exit_code=$?
    echo "[SUPERVISOR] $name exited with code $exit_code. Restarting in ${backoff}s..."
    sleep "$backoff"
    # Cap backoff at 5 minutes
    backoff=$(( backoff < 300 ? backoff * 2 : 300 ))
  done
}

# ── Launch collectors ────────────────────────────────────────────────────────
run_collector "NEXRAD"  "$SCRIPT_DIR/collectors/nexrad.mjs" &
run_collector "GOES"    "$SCRIPT_DIR/collectors/goes.mjs"   &

echo "[SUPERVISOR] All collectors launched. Waiting..."
wait
