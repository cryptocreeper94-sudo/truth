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
# Stage 1 — Foundation (existing)
run_collector "NEXRAD"      "$SCRIPT_DIR/collectors/nexrad.mjs"               &
sleep 2
run_collector "GOES"        "$SCRIPT_DIR/collectors/goes.mjs"                 &
sleep 2

# Stage 2 — Multi-stream expansion
run_collector "SEISMIC"     "$SCRIPT_DIR/collectors/usgs-earthquake.mjs"      &
sleep 2
run_collector "SOLAR"       "$SCRIPT_DIR/collectors/solar-swpc.mjs"           &
sleep 2
run_collector "LIGHTNING"   "$SCRIPT_DIR/collectors/lightning-glm.mjs"        &
sleep 2
run_collector "GRID"        "$SCRIPT_DIR/collectors/grid-eia930.mjs"          &
sleep 2
run_collector "GEOMAG"      "$SCRIPT_DIR/collectors/geomagnetic-intermagnet.mjs" &
sleep 2
run_collector "IONOSONDE"   "$SCRIPT_DIR/collectors/ionosonde-giro.mjs"       &
sleep 2
run_collector "SCHUMANN"    "$SCRIPT_DIR/collectors/schumann-aggregator.mjs"  &

echo "[SUPERVISOR] All Stage 1+2 collectors launched (9 total). Starting Stage 3..."

# Stage 3 — Full spectrum expansion
sleep 2
run_collector "SURFACE"     "$SCRIPT_DIR/collectors/surface-asos.mjs"          &
sleep 2
run_collector "BLITZ"       "$SCRIPT_DIR/collectors/blitzortung.mjs"           &
sleep 2
run_collector "ADSB"        "$SCRIPT_DIR/collectors/adsb-exchange.mjs"         &
sleep 2
run_collector "NOTAM"       "$SCRIPT_DIR/collectors/notam-cloudseeding.mjs"    &
sleep 2
run_collector "CELLTOWER"   "$SCRIPT_DIR/collectors/celltower-registry.mjs"    &
sleep 2
run_collector "HEATER"      "$SCRIPT_DIR/collectors/ionospheric-heaters.mjs"   &
sleep 2
run_collector "METALS"      "$SCRIPT_DIR/collectors/trace-metals.mjs"          &
sleep 2
run_collector "ECOLOGY"     "$SCRIPT_DIR/collectors/pollinator-ecology.mjs"    &
sleep 2
run_collector "DEPOSITION"  "$SCRIPT_DIR/collectors/atmospheric-deposition.mjs" &

echo "[SUPERVISOR] All collectors launched (18 total — 9 Stage 1+2 + 9 Stage 3)."

# ── API Server (serves dashboard + REST API) ────────────────────────────────
echo "[SUPERVISOR] Starting API server on port ${PORT:-3000}..."
node "$SCRIPT_DIR/server.mjs" &

wait
