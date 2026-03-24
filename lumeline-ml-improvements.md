# Lumeline ML Consensus Engine — Comprehensive Improvement Plan

**Prepared for:** Lumeline development agent  
**Repo:** Cryptocreeper94-sudo/lumeline  
**Date:** March 24, 2026  
**Scope:** `server/consensus.js`, `server/scoring.js`, `db/schema.sql`, and integration with the betting wallet (`server/bets.js`)

---

## Table of Contents

1. [Current System Overview](#1-current-system-overview)
2. [What Works Well](#2-what-works-well)
3. [Critical Gaps and Weaknesses](#3-critical-gaps-and-weaknesses)
4. [Improvement Plan](#4-improvement-plan)
   - 4.1 [Line Movement Delta Scoring](#41-line-movement-delta-scoring)
   - 4.2 [Temporal Decay Weighting](#42-temporal-decay-weighting)
   - 4.3 [CLV as a Primary Weight](#43-clv-as-a-primary-weight)
   - 4.4 [Anomaly Type Modulation](#44-anomaly-type-modulation)
   - 4.5 [Multi-Market Fusion](#45-multi-market-fusion)
   - 4.6 [Personal Calibration Loop](#46-personal-calibration-loop)
   - 4.7 [Confidence Bands](#47-confidence-bands)
   - 4.8 [Sport-Specific Calibration](#48-sport-specific-calibration)
   - 4.9 [Consensus History and Trend Tracking](#49-consensus-history-and-trend-tracking)
   - 4.10 [GPT Reasoning Integration](#410-gpt-reasoning-integration)
5. [Revised Consensus Algorithm (Full Logic)](#5-revised-consensus-algorithm-full-logic)
6. [Database Schema Changes](#6-database-schema-changes)
7. [API Changes](#7-api-changes)
8. [Frontend / UX Improvements](#8-frontend--ux-improvements)
9. [Implementation Priority Order](#9-implementation-priority-order)
10. [Notes for the Implementing Agent](#10-notes-for-the-implementing-agent)

---

## 1. Current System Overview

### Files Involved

| File | Role |
|---|---|
| `server/consensus.js` | Core weighted ensemble — aggregates source votes into a game prediction |
| `server/scoring.js` | Source scoring — calculates hit rate, CLV, consistency, timing, assigns tiers |
| `db/schema.sql` | Data layer — sources, games, odds_snapshots, anomalies, consensus, picks |
| `server/bets.js` | Betting wallet — completely separate from the ML system currently |

### How the Current Consensus Works

1. For each game, filter `odds_snapshots` to the spread market only
2. For each source, grab the **latest** snapshot
3. Weight that source's vote: `weight = getTierWeight(source.tier) × (source.accuracy_30d / 100)`
4. If the line is negative → add weight to home; if positive → add weight to away
5. Calculate alignment: `max(homeWeight, awayWeight) / totalWeight × 100`
6. Calculate confidence: `alignment × (integrity / 100) × min(voterCount / 10, 1.0)`
7. If confidence < 60 OR integrity < 50 → set `house_lean = true`, pull likelihoods toward 50/50
8. Return a consensus object with `home_likelihood`, `away_likelihood`, `confidence`, `reasoning`

### Current Tier Weights (scoring.js)

| Tier | Hit Rate Threshold | Weight Multiplier |
|---|---|---|
| sharp | ≥ 65% | 2.5× |
| reliable | ≥ 55% | 1.5× |
| neutral | ≥ 48% | 1.0× |
| fade | < 48% | 0.3× |

### Anomaly Types Tracked (schema.sql)

- `sync_move` — all books moving the same direction simultaneously
- `reverse_steam` — line moving opposite to public betting percentage
- `house_divergence` — a book's line is an outlier vs the consensus
- `late_flip` — line flips direction within 2 hours of game time
- `outlier_consensus` — one source is sharply against all others

---

## 2. What Works Well

These pieces are solid and should be preserved:

- **Tiered source weighting** — the sharp/reliable/neutral/fade system is a legitimate and proven framework
- **Accuracy decay over time** — tracking `accuracy_7d`, `accuracy_30d`, `accuracy_90d` separately is correct; recency matters
- **CLV calculation in scoring.js** — the implementation is mathematically correct and the concept is the right one
- **Consistency scoring** — penalizing sources that flip sides on the same game is smart
- **Timing scoring** — identifying early movers vs followers is a meaningful signal
- **Anomaly detection schema** — the five anomaly types are exactly the right ones to track
- **MIN_SOURCES = 3 gate** — refusing to generate consensus with fewer than 3 sources is responsible
- **Integrity score on games** — the concept of a per-game trust score is the right abstraction
- **Dual-path email parsing** — regex-first then GPT fallback is cost-efficient and correct

---

## 3. Critical Gaps and Weaknesses

### Gap 1: CLV Is Calculated But Never Used in Consensus

`scoring.js` correctly calculates CLV for each source. However, `consensus.js` only uses `source.tier` and `source.accuracy_30d` when building the weighted vote. CLV is arguably more predictive than raw hit rate — a source that consistently moves the market before the close is demonstrating real edge. It is calculated, stored, and then completely ignored.

**Impact:** High. CLV is the gold standard signal in sharp sports betting analytics.

---

### Gap 2: Line Direction Is Used Instead of Line Movement

The current vote logic:
```js
if (latest.line < 0) homeWeight += w;
if (latest.line > 0) awayWeight += w;
```

This only checks whether the spread favors home or away. It says nothing about *how the line got there*. A line at -6.5 that opened at -3 (sharp money on home) is completely different from a line at -6.5 that opened at -8 (public fading the away team). Both produce the same vote in the current system.

**What should happen:** The vote weight should be modulated by the **magnitude and direction of movement** from the opening line. A large move in one direction = strong signal. A line sitting exactly where it opened = weak or no signal.

**Impact:** High. This is the most fundamental flaw in the core algorithm.

---

### Gap 3: Anomalies Are Counted But Not Acted On

The consensus function does this:
```js
const gameAnomalies = anomalies.filter(a => a.game_id === game.id);
// ...later:
reasoning: `...${gameAnomalies.length} anomaly flags.`
```

The count is put into a text string and nothing else happens. The anomaly *type* is completely ignored. A `reverse_steam` event — where the line is moving against the public betting direction, indicating sharp money on the other side — should materially increase confidence in that direction. A `late_flip` 20 minutes before game time is one of the strongest signals in all of sports betting. A `sync_move` across all major books simultaneously is a near-certainty signal for sharp action. None of this is being used.

**Impact:** High. The schema already has exactly the right signal types. They just need to be wired in.

---

### Gap 4: No Temporal Weighting

All snapshots are treated equally regardless of when they were taken. A snapshot from 72 hours before game time carries the same weight as one from 45 minutes before game time. In reality:

- **72+ hours out:** Lines are primarily house opinion and opener positioning. Public-facing.
- **24–72 hours out:** Early sharp action starts to appear. Moderate signal.
- **2–24 hours out:** Significant line movement in this window almost always indicates sharp money.
- **0–2 hours out:** Maximum signal. Late sharp steam, syndicate action, injury news reactions. The most predictive window.

The current system grabs only the latest snapshot per source, which is correct in concept but doesn't weight that snapshot differently based on how close to game time it is.

**Impact:** High. Temporal proximity to game time is one of the strongest predictors of signal quality.

---

### Gap 5: Only Spread Market Is Used

The consensus function filters to `market === 'spread'` only. The schema stores moneyline, total, and prop data too. This is a significant missed opportunity because:

- **Moneyline implied probability** can be compared directly against spread implied probability. Divergences between them are meaningful signals.
- **Total (over/under)** movements indicate where sharp money thinks scoring will land, which has bearing on game script and can reinforce or contradict spread predictions.
- **Market disagreement** — when the spread says one thing and the moneyline implies a different probability, that conflict itself is information.

**Impact:** Medium-High. Spread-only analysis leaves real signal on the table.

---

### Gap 6: The Betting Wallet and the ML Engine Are Completely Disconnected

The user's own historical bet data — including which bet types they win, which sportsbooks they do better on, which sports, which markets — is fully tracked in `user_bets`. None of this is used to personalize or calibrate what the ML engine surfaces to them.

A user who has a 62% win rate on NBA moneylines but a 38% win rate on NFL parlays should receive different emphasis from the system than a user with the opposite profile. The data is there. It's not being used.

**Impact:** Medium-High. This is the largest untapped personalization opportunity in the entire system.

---

### Gap 7: Single Confidence Number Instead of a Range

`confidence: 68` tells the user very little. Is it 68% confident because there are 15 sources all in strong agreement? Or because there are 3 sources with marginal agreement? The inputs are very different but the output looks the same. A confidence band (e.g., `55–76%`) communicates uncertainty far more accurately.

**Impact:** Medium. Primarily a UX/trust issue but affects how users make decisions.

---

### Gap 8: Integrity Score Is Static and Opaque

`integrity_score` lives on the `games` table and defaults to 100. It is used in the confidence calculation but there is no visible logic for how it gets set or updated. If everything defaults to 100, the integrity factor in the confidence formula (`alignment × integrityFactor × voterFactor`) becomes just `alignment × 1.0` — the integrity term disappears. The integrity concept is good but it needs a real update mechanism.

**Impact:** Medium. Currently the integrity factor is likely a no-op for most games.

---

### Gap 9: House Lean Pull Is Too Blunt

When `house_lean` is triggered:
```js
homeLikelihood = Math.round((homeLikelihood + 50) / 2);
awayLikelihood = 100 - homeLikelihood;
```

This mechanically averages the prediction with 50/50 regardless of how much signal exists. A game with `confidence = 59` (just under the 60 threshold) gets treated identically to a game with `confidence = 5`. They should behave very differently. Low confidence should express uncertainty on a gradient, not a binary switch.

**Impact:** Medium. Affects prediction accuracy at the margins, which is where decisions get made.

---

### Gap 10: GPT Reasoning Mentioned But Not Wired In

The comment in `consensus.js` says "optional GPT-4 reasoning" but there is no GPT call in the function. The function already has `gpt-4o` wired up in `bets.js` for bet slip parsing. The infrastructure exists. Using it to generate a natural-language explanation of *why* the consensus landed where it did — citing specific anomalies, line movements, and source agreements — would be a significant UX improvement.

**Impact:** Low-Medium. Not a core accuracy issue but high value for user trust and education.

---

## 4. Improvement Plan

### 4.1 Line Movement Delta Scoring

**Replace** the current line-direction vote with a movement-delta vote.

**Concept:** For each source, compare the earliest snapshot (opening line) to the latest snapshot (current line) for a given game and market. The magnitude and direction of that delta is the vote weight multiplier.

**New logic (replaces the current vote block in `consensus.js`):**

```js
export function calculateWeightedVotes(gameId, snapshots, sources) {
  let homeWeight = 0, awayWeight = 0, totalWeight = 0, voterCount = 0;

  for (const source of sources) {
    const snaps = snapshots
      .filter(s => s.game_id === gameId && s.source_id === source.id && s.market === 'spread')
      .sort((a, b) => new Date(a.captured_at) - new Date(b.captured_at));

    if (snaps.length < 2) {
      // Only one snapshot — use direction as before but with reduced weight
      if (snaps.length === 1) {
        const baseWeight = getTierWeight(source.tier) * ((source.accuracy_30d || 50) / 100) * 0.4;
        const latest = snaps[0];
        if (latest.line < 0) homeWeight += baseWeight;
        if (latest.line > 0) awayWeight += baseWeight;
        totalWeight += baseWeight;
        voterCount++;
      }
      continue;
    }

    const opening = snaps[0];
    const latest = snaps[snaps.length - 1];
    const delta = latest.line - opening.line; // positive = line moved toward away; negative = toward home

    // No movement = weak signal
    if (Math.abs(delta) < 0.5) {
      const baseWeight = getTierWeight(source.tier) * ((source.accuracy_30d || 50) / 100) * 0.5;
      if (latest.line < 0) homeWeight += baseWeight;
      else awayWeight += baseWeight;
      totalWeight += baseWeight;
      voterCount++;
      continue;
    }

    // Movement detected — weight by delta magnitude (capped at 3.5 points for outlier control)
    const deltaMultiplier = Math.min(Math.abs(delta) / 3.5, 1.0); // 0.0 to 1.0
    const clvBonus = Math.min((source.clv_score || 0) / 10, 0.5); // up to 0.5 bonus for high-CLV sources
    const baseWeight = getTierWeight(source.tier) * ((source.accuracy_30d || 50) / 100);
    const finalWeight = baseWeight * (1 + deltaMultiplier + clvBonus);

    // Direction of movement determines the vote
    if (delta < 0) homeWeight += finalWeight; // line moved toward home = sharp on home
    else awayWeight += finalWeight;            // line moved toward away = sharp on away

    totalWeight += finalWeight;
    voterCount++;
  }

  return { homeWeight, awayWeight, totalWeight, voterCount };
}
```

**Key changes:**
- Single-snapshot sources get 40% weight (less reliable)
- No-movement lines get 50% weight (still contributes, but weakly)
- Moving lines get a delta multiplier (0–100% bonus) based on movement magnitude
- CLV score adds up to a 50% bonus on top for sources that consistently beat the close
- Direction of movement — not final position — determines the vote

---

### 4.2 Temporal Decay Weighting

**Add a time-based weight multiplier that amplifies signals close to game time.**

Add this function to `scoring.js`:

```js
// Returns a multiplier from 0.4 (far out) to 2.0 (right before game)
export function getTemporalWeight(timeToGame) {
  if (timeToGame === null || timeToGame === undefined) return 1.0;
  if (timeToGame > 2880) return 0.4;   // More than 48 hours out
  if (timeToGame > 1440) return 0.6;   // 24–48 hours
  if (timeToGame > 360)  return 0.8;   // 6–24 hours
  if (timeToGame > 120)  return 1.0;   // 2–6 hours (baseline)
  if (timeToGame > 30)   return 1.5;   // 30 min – 2 hours (sharp window)
  return 2.0;                           // Final 30 minutes (maximum signal)
}
```

Then in the vote calculation, multiply each snapshot's contribution by `getTemporalWeight(snap.time_to_game)` before aggregating. This means late-game line moves are worth up to 5× what an early-week move is worth.

---

### 4.3 CLV as a Primary Weight

Currently `source.clv_score` is calculated and stored but never used in `consensus.js`.

**Change the weight formula in consensus.js from:**
```js
const w = getTierWeight(source.tier) * ((source.accuracy_30d || 50) / 100);
```

**To:**
```js
const accuracyFactor = (source.accuracy_30d || 50) / 100;
const clvFactor = 1 + Math.min((source.clv_score || 0) / 20, 0.75); // up to 75% bonus
const consistencyFactor = (source.consistency || 50) / 100;
const w = getTierWeight(source.tier) * accuracyFactor * clvFactor * consistencyFactor;
```

**Rationale:**
- A source with CLV of 0 gets no bonus
- A source with CLV of 10 (moves the line 1 full point on average before close) gets a 50% bonus
- A source with CLV of 15+ gets the maximum 75% bonus
- Consistency factor ensures sources that flip sides on the same game are penalized
- This creates a meaningful distinction between "technically sharp tier" and "actually generating alpha"

---

### 4.4 Anomaly Type Modulation

Replace the current anomaly count (which only appears in a text string) with a system that uses anomaly type and severity to directly modulate confidence.

Add this function to `consensus.js`:

```js
export function getAnomalyModifier(anomalies) {
  let confidenceBoost = 0;
  let directionSignal = null; // 'home' | 'away' | null

  for (const anomaly of anomalies) {
    const severityMultiplier = {
      critical: 1.5,
      high: 1.0,
      medium: 0.6,
      low: 0.3
    }[anomaly.severity] || 0.5;

    switch (anomaly.signal_type) {
      case 'sync_move':
        // All books moving together = very strong sharp signal
        confidenceBoost += 12 * severityMultiplier;
        break;

      case 'reverse_steam':
        // Line moving against public = sharp money on minority side
        // This is the strongest fade-the-public signal
        confidenceBoost += 18 * severityMultiplier;
        // If metadata contains direction, capture it
        if (anomaly.metadata?.sharp_side) {
          directionSignal = anomaly.metadata.sharp_side;
        }
        break;

      case 'house_divergence':
        // One book is an outlier — could mean they have info or are limiting sharps
        confidenceBoost += 6 * severityMultiplier;
        break;

      case 'late_flip':
        // Line flips direction within 2 hours — most predictive single event
        confidenceBoost += 22 * severityMultiplier;
        if (anomaly.metadata?.flip_direction) {
          directionSignal = anomaly.metadata.flip_direction;
        }
        break;

      case 'outlier_consensus':
        // One source sharply against the field — usually wrong but adds uncertainty
        confidenceBoost -= 5 * severityMultiplier; // actually reduces confidence (more disagreement)
        break;
    }
  }

  return {
    confidenceBoost: Math.min(confidenceBoost, 30), // cap at +30 so anomalies can't dominate entirely
    directionSignal
  };
}
```

Then in `generateConsensus`, use this modifier:

```js
const anomalyResult = getAnomalyModifier(gameAnomalies);
const baseConfidence = calculateConfidence(alignment, integrity, votes.voterCount);
const confidence = Math.min(baseConfidence + anomalyResult.confidenceBoost, 99);

// If anomalies give a strong direction signal, weight it in
if (anomalyResult.directionSignal === 'home') {
  homeLikelihood = Math.min(homeLikelihood + 5, 95);
  awayLikelihood = 100 - homeLikelihood;
} else if (anomalyResult.directionSignal === 'away') {
  awayLikelihood = Math.min(awayLikelihood + 5, 95);
  homeLikelihood = 100 - awayLikelihood;
}
```

---

### 4.5 Multi-Market Fusion

Add a second pass that incorporates moneyline and total data.

**New function in `consensus.js`:**

```js
export function getMarketFusionSignal(gameId, snapshots) {
  // Get latest spread and moneyline snapshots
  const spreadSnaps = snapshots.filter(s => s.game_id === gameId && s.market === 'spread');
  const mlSnaps = snapshots.filter(s => s.game_id === gameId && s.market === 'moneyline');

  if (!spreadSnaps.length || !mlSnaps.length) return { divergence: 0, direction: null };

  // Average the latest lines across sources
  const avgSpreadLine = spreadSnaps.reduce((sum, s) => sum + (s.line || 0), 0) / spreadSnaps.length;
  const avgHomeOdds = mlSnaps.reduce((sum, s) => sum + (s.odds_home || -110), 0) / mlSnaps.length;
  const avgAwayOdds = mlSnaps.reduce((sum, s) => sum + (s.odds_away || -110), 0) / mlSnaps.length;

  // Convert American odds to implied probability
  const homeImplied = avgHomeOdds < 0
    ? Math.abs(avgHomeOdds) / (Math.abs(avgHomeOdds) + 100) * 100
    : 100 / (avgHomeOdds + 100) * 100;
  const awayImplied = 100 - homeImplied;

  // Spread-implied probability (using standard normal distribution approximation)
  // A -6.5 spread implies roughly 70% home win probability in NFL
  const spreadImplied = 50 + (Math.abs(avgSpreadLine) * 3); // rough linear approximation
  const spreadFavorHome = avgSpreadLine < 0;

  // Divergence: if moneyline says home is 65% but spread implies 72%, something is off
  const divergence = Math.abs(homeImplied - (spreadFavorHome ? spreadImplied : 100 - spreadImplied));

  return {
    divergence,
    direction: divergence > 10
      ? (homeImplied > spreadImplied ? 'moneyline_favors_home' : 'moneyline_favors_away')
      : null,
    homeImplied,
    awayImplied,
    spreadImplied
  };
}
```

Use the divergence signal to adjust confidence:
- Divergence < 5%: no adjustment
- Divergence 5–10%: reduce confidence by 5 (markets disagree slightly)
- Divergence > 10%: reduce confidence by 10 AND flag as a market conflict in the reasoning

---

### 4.6 Personal Calibration Loop

This is the biggest new feature. The goal is to feed each user's historical bet outcomes back into what the system emphasizes for them.

**New DB table:**

```sql
CREATE TABLE user_ml_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  -- Win rates by bet type
  wr_spread NUMERIC(5,2) DEFAULT 0,
  wr_moneyline NUMERIC(5,2) DEFAULT 0,
  wr_total NUMERIC(5,2) DEFAULT 0,
  wr_parlay NUMERIC(5,2) DEFAULT 0,
  wr_prop NUMERIC(5,2) DEFAULT 0,
  -- Win rates by sport
  wr_nfl NUMERIC(5,2) DEFAULT 0,
  wr_nba NUMERIC(5,2) DEFAULT 0,
  wr_mlb NUMERIC(5,2) DEFAULT 0,
  wr_nhl NUMERIC(5,2) DEFAULT 0,
  -- ROI by confidence band (from consensus)
  roi_high_confidence NUMERIC(6,2) DEFAULT 0,   -- consensus > 70
  roi_medium_confidence NUMERIC(6,2) DEFAULT 0, -- consensus 50-70
  roi_low_confidence NUMERIC(6,2) DEFAULT 0,    -- consensus < 50
  -- Preferred sportsbook (by win rate)
  best_book_slug VARCHAR(64),
  -- Recalculation metadata
  total_settled_bets INTEGER DEFAULT 0,
  last_calculated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**New endpoint in `server/bets.js` (or new file `server/profile.js`):**

```js
// POST /api/bets/recalculate-profile
// Runs after any bet is settled to keep the profile current
router.post('/recalculate-profile', async (req, res) => {
  const { rows: bets } = await db.query(
    `SELECT ub.*, c.confidence AS consensus_confidence
     FROM user_bets ub
     LEFT JOIN games g ON ub.game_id = g.id
     LEFT JOIN LATERAL (SELECT confidence FROM consensus WHERE game_id = g.id ORDER BY generated_at DESC LIMIT 1) c ON TRUE
     WHERE ub.user_id = $1 AND ub.status IN ('won', 'lost', 'push')`,
    [req.user.id]
  );

  const winRate = (type, filter) => {
    const filtered = bets.filter(filter);
    if (!filtered.length) return 0;
    const wins = filtered.filter(b => b.status === 'won').length;
    return Math.round((wins / filtered.length) * 100 * 10) / 10;
  };

  const profile = {
    wr_spread: winRate('spread', b => b.bet_type === 'spread'),
    wr_moneyline: winRate('moneyline', b => b.bet_type === 'moneyline'),
    wr_total: winRate('total', b => b.bet_type === 'total'),
    wr_parlay: winRate('parlay', b => b.parlay_type != null),
    wr_prop: winRate('prop', b => b.bet_type === 'prop'),
    wr_nfl: winRate('nfl', b => b.sport === 'nfl'),
    wr_nba: winRate('nba', b => b.sport === 'nba'),
    wr_mlb: winRate('mlb', b => b.sport === 'mlb'),
    wr_nhl: winRate('nhl', b => b.sport === 'nhl'),
    roi_high_confidence: calcROI(bets.filter(b => (b.consensus_confidence || 0) > 70)),
    roi_medium_confidence: calcROI(bets.filter(b => (b.consensus_confidence || 0) >= 50 && (b.consensus_confidence || 0) <= 70)),
    roi_low_confidence: calcROI(bets.filter(b => (b.consensus_confidence || 0) < 50)),
    total_settled_bets: bets.length,
    last_calculated: new Date(),
  };

  await db.query(
    `INSERT INTO user_ml_profile (user_id, ${Object.keys(profile).join(', ')})
     VALUES ($1, ${Object.keys(profile).map((_, i) => '$' + (i + 2)).join(', ')})
     ON CONFLICT (user_id) DO UPDATE SET ${Object.keys(profile).map(k => `${k} = EXCLUDED.${k}`).join(', ')}`,
    [req.user.id, ...Object.values(profile)]
  );

  res.json({ profile });
});

function calcROI(bets) {
  const totalStake = bets.reduce((s, b) => s + parseFloat(b.stake || 0), 0);
  if (!totalStake) return 0;
  const totalReturn = bets
    .filter(b => b.status === 'won')
    .reduce((s, b) => s + parseFloat(b.result_amount || b.potential_win || 0), 0);
  return Math.round(((totalReturn - totalStake) / totalStake) * 100 * 10) / 10;
}
```

**How the profile feeds back into consensus presentation (not prediction — prediction stays objective):**

When returning consensus data to the frontend, include a `personalized_note` field:
- If the user's `wr_parlay` < 40%: surface a note like "Your parlay win rate is 38% — this game's consensus favors a straight bet approach"
- If the user's `roi_high_confidence` > 10%: "You have a strong track record on high-confidence picks (+10.2% ROI)"
- If the user's `wr_nfl` < 45% but `wr_nba` > 58%: weight the presentation accordingly

The key principle: **the consensus prediction stays objective and shared across all users**. Only the *presentation* and *emphasis* personalizes. Do not alter the actual prediction based on user history — that would corrupt the signal.

---

### 4.7 Confidence Bands

Replace the single `confidence` integer with a band that communicates uncertainty.

**New function in `consensus.js`:**

```js
export function calculateConfidenceBand(confidence, voterCount, anomalyCount) {
  // Width of the band is inversely proportional to voter count and anomaly clarity
  const baseWidth = Math.max(20 - voterCount, 4); // more sources = tighter band
  const anomalyNoise = anomalyCount > 0 ? 3 : 0;
  const halfWidth = Math.round((baseWidth / 2) + anomalyNoise);

  return {
    confidence,
    confidence_low: Math.max(confidence - halfWidth, 0),
    confidence_high: Math.min(confidence + halfWidth, 99),
    confidence_label: confidence >= 75 ? 'high' : confidence >= 55 ? 'medium' : 'low'
  };
}
```

**Example outputs:**
- 15 sources, 72% confidence → `{ confidence: 72, low: 68, high: 76, label: 'high' }`
- 3 sources, 68% confidence → `{ confidence: 68, low: 58, high: 78, label: 'medium' }`
- 4 sources with anomalies, 65% → `{ confidence: 65, low: 54, high: 76, label: 'medium' }`

This should be surfaced in the UI as a range bar rather than a single number.

---

### 4.8 Sport-Specific Calibration

Different sports have very different line efficiency and movement patterns. Add a sport calibration layer.

**New file: `server/sport-config.js`:**

```js
export const SPORT_CONFIG = {
  nfl: {
    // NFL lines are the most efficient — sharp action is more meaningful
    sharpThreshold: 62,     // Higher bar to call something sharp
    minSources: 4,          // Need more sources for NFL confidence
    keyNumbers: [3, 7, 10], // Spread landing near these is more significant
    lateWeightMultiplier: 2.5, // Late NFL steam is very predictive
  },
  nba: {
    sharpThreshold: 58,
    minSources: 3,
    keyNumbers: [],         // NBA doesn't have traditional key numbers
    lateWeightMultiplier: 1.8,
  },
  mlb: {
    sharpThreshold: 55,
    minSources: 3,
    keyNumbers: [],
    lateWeightMultiplier: 2.0, // Pitching changes make late MLB lines very sharp
  },
  nhl: {
    sharpThreshold: 55,
    minSources: 3,
    keyNumbers: [],
    lateWeightMultiplier: 1.5,
  },
  default: {
    sharpThreshold: 58,
    minSources: 3,
    keyNumbers: [],
    lateWeightMultiplier: 1.5,
  }
};

export function getSportConfig(sport) {
  return SPORT_CONFIG[sport?.toLowerCase()] || SPORT_CONFIG.default;
}
```

**NFL key number handling:** In NFL, spreads landing within 0.5 of 3 or 7 should trigger a flag because those are the most common margins of victory. A line at -3 vs -3.5 is a massive difference in NFL. Add this check to the anomaly detection layer.

---

### 4.9 Consensus History and Trend Tracking

Currently the `consensus` table stores each generated consensus, and the query in `bets.js` pulls the latest one (`ORDER BY generated_at DESC LIMIT 1`). This means the *history* of how consensus evolved is in the database but is never surfaced.

**New endpoint:**

```js
// GET /api/consensus/:gameId/history
router.get('/:gameId/history', async (req, res) => {
  const { rows } = await db.query(
    `SELECT confidence, home_likelihood, away_likelihood, house_lean, reasoning, generated_at
     FROM consensus
     WHERE game_id = $1
     ORDER BY generated_at ASC`,
    [req.params.gameId]
  );

  // Calculate momentum: is confidence trending up or down?
  const momentum = rows.length >= 2
    ? rows[rows.length - 1].confidence - rows[0].confidence
    : 0;

  const directionFlips = rows.slice(1).filter((r, i) => {
    const prev = rows[i];
    return (r.home_likelihood > 50) !== (prev.home_likelihood > 50);
  }).length;

  res.json({
    history: rows,
    momentum,              // positive = confidence growing, negative = shrinking
    direction_flips: directionFlips, // how many times consensus changed sides
    is_stable: directionFlips === 0 && Math.abs(momentum) < 15
  });
});
```

**Frontend use:** Show a mini sparkline of how the consensus has moved over the past 24–48 hours. A consensus that has been consistently above 70% for 24 hours and never flipped is much more trustworthy than one that just hit 70% an hour ago.

---

### 4.10 GPT Reasoning Integration

The existing infrastructure (GPT-4o in `bets.js`) can be reused. Add an optional GPT reasoning call to `generateConsensus` that fires when confidence is high enough to warrant an explanation.

**Add to `consensus.js`:**

```js
export async function generateGPTReasoning(consensusResult, game, anomalies, sportConfig) {
  if (!process.env.OPENAI_API_KEY) return null;
  if (consensusResult.confidence < 55) return null; // Don't explain low-confidence picks

  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are a sharp sports betting analyst. Explain this consensus prediction concisely in 2-3 sentences. Write for a casual bettor, not an expert. Do not use jargon.

Game: ${game.away_team} @ ${game.home_team} (${game.sport?.toUpperCase()}, ${new Date(game.start_time).toLocaleDateString()})
Consensus: ${consensusResult.home_likelihood}% home / ${consensusResult.away_likelihood}% away
Confidence: ${consensusResult.confidence}%
Source alignment: ${consensusResult.alignment}% of sources agree
Active anomalies: ${anomalies.map(a => a.signal_type).join(', ') || 'none'}
House lean active: ${consensusResult.house_lean}

Write a plain-English explanation of what the data is saying and why.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use mini — this doesn't need full GPT-4o
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.3
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}
```

**Cost control:** Use `gpt-4o-mini`, limit to 150 tokens, only fire when `confidence >= 55`. Cache the result in the `consensus.reasoning` field so it only runs once per consensus generation cycle, not on every API call.

---

## 5. Revised Consensus Algorithm (Full Logic)

This is the complete updated `generateConsensus` function incorporating all of the above improvements:

```js
export async function generateConsensus(game, snapshots, sources, anomalies) {
  const sportConfig = getSportConfig(game.sport);
  const gameAnomalies = anomalies.filter(a => a.game_id === game.id);

  const votes = calculateWeightedVotes(game.id, snapshots, sources); // updated version with delta scoring

  if (votes.voterCount < sportConfig.minSources) {
    return {
      game_id: game.id,
      home_likelihood: 50, away_likelihood: 50,
      confidence: 0, confidence_low: 0, confidence_high: 0, confidence_label: 'low',
      alignment: 0, integrity: game.integrity_score || 100,
      house_lean: true,
      reasoning: `Insufficient data — fewer than ${sportConfig.minSources} sources available for ${game.sport?.toUpperCase() || 'this sport'}`,
      sources_agree: 0, sources_disagree: 0,
      anomaly_flags: gameAnomalies.map(a => ({ type: a.signal_type, severity: a.severity })),
      generated_at: new Date().toISOString()
    };
  }

  const alignment = calculateAlignment(votes);
  const integrity = game.integrity_score || 100;
  const baseConfidence = calculateConfidence(alignment, integrity, votes.voterCount);

  // Apply anomaly modulation
  const anomalyResult = getAnomalyModifier(gameAnomalies);
  const confidence = Math.min(baseConfidence + anomalyResult.confidenceBoost, 99);
  const confidenceBand = calculateConfidenceBand(confidence, votes.voterCount, gameAnomalies.length);

  // House lean is now on a gradient, not a binary switch
  const houseLean = confidence < 50 || integrity < 40;
  const houseLeanStrength = houseLean ? Math.max(0, (50 - confidence) / 50) : 0; // 0.0 to 1.0

  let homeLikelihood = votes.totalWeight
    ? Math.round((votes.homeWeight / votes.totalWeight) * 100) : 50;
  let awayLikelihood = 100 - homeLikelihood;

  // Gradient house lean pull (replaces the blunt 50/50 average)
  if (houseLean && houseLeanStrength > 0) {
    homeLikelihood = Math.round(homeLikelihood * (1 - houseLeanStrength) + 50 * houseLeanStrength);
    awayLikelihood = 100 - homeLikelihood;
  }

  // Apply anomaly direction signal if present
  if (anomalyResult.directionSignal === 'home') {
    homeLikelihood = Math.min(homeLikelihood + 5, 95);
    awayLikelihood = 100 - homeLikelihood;
  } else if (anomalyResult.directionSignal === 'away') {
    awayLikelihood = Math.min(awayLikelihood + 5, 95);
    homeLikelihood = 100 - awayLikelihood;
  }

  // Market fusion signal
  const marketFusion = getMarketFusionSignal(game.id, snapshots);
  const adjustedConfidence = marketFusion.divergence > 10
    ? Math.max(confidence - 10, 0)
    : confidence;

  const direction = awayLikelihood > homeLikelihood ? 'away' : 'home';
  const agreeCount = Math.round(votes.voterCount * alignment / 100);

  // Build detailed reasoning
  const anomalyText = gameAnomalies.length
    ? `${gameAnomalies.length} signal(s) detected: ${gameAnomalies.map(a => a.signal_type.replace(/_/g, ' ')).join(', ')}.`
    : '';
  const fusionText = marketFusion.divergence > 10
    ? `Market conflict: moneyline implies ${marketFusion.homeImplied.toFixed(0)}% home but spread suggests ${marketFusion.spreadImplied.toFixed(0)}%.`
    : '';

  const baseReasoning = houseLean
    ? `Low confidence (${adjustedConfidence}%) — partial house lean applied. ${anomalyText} ${fusionText}`
    : `${alignment}% source alignment favoring ${direction} (${votes.voterCount} sources, ${agreeCount} in agreement). ${anomalyText} ${fusionText}`;

  // Optional GPT reasoning for high-confidence picks
  const gptReasoning = await generateGPTReasoning(
    { ...confidenceBand, home_likelihood: homeLikelihood, away_likelihood: awayLikelihood, house_lean: houseLean, alignment },
    game, gameAnomalies, sportConfig
  );

  return {
    game_id: game.id,
    home_likelihood: homeLikelihood,
    away_likelihood: awayLikelihood,
    confidence: adjustedConfidence,
    confidence_low: confidenceBand.confidence_low,
    confidence_high: confidenceBand.confidence_high,
    confidence_label: confidenceBand.confidence_label,
    alignment,
    integrity,
    house_lean: houseLean,
    house_lean_strength: Math.round(houseLeanStrength * 100),
    market_divergence: marketFusion.divergence > 5 ? Math.round(marketFusion.divergence) : 0,
    reasoning: gptReasoning || baseReasoning,
    technical_reasoning: baseReasoning,
    sources_agree: agreeCount,
    sources_disagree: votes.voterCount - agreeCount,
    anomaly_flags: gameAnomalies.map(a => ({
      type: a.signal_type,
      severity: a.severity,
      confidence_impact: getAnomalyImpact(a)
    })),
    model_version: 'v0.2.0',
    generated_at: new Date().toISOString()
  };
}
```

---

## 6. Database Schema Changes

### New Table: `user_ml_profile`

```sql
CREATE TABLE user_ml_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  wr_spread NUMERIC(5,2) DEFAULT 0,
  wr_moneyline NUMERIC(5,2) DEFAULT 0,
  wr_total NUMERIC(5,2) DEFAULT 0,
  wr_parlay NUMERIC(5,2) DEFAULT 0,
  wr_prop NUMERIC(5,2) DEFAULT 0,
  wr_nfl NUMERIC(5,2) DEFAULT 0,
  wr_nba NUMERIC(5,2) DEFAULT 0,
  wr_mlb NUMERIC(5,2) DEFAULT 0,
  wr_nhl NUMERIC(5,2) DEFAULT 0,
  roi_high_confidence NUMERIC(6,2) DEFAULT 0,
  roi_medium_confidence NUMERIC(6,2) DEFAULT 0,
  roi_low_confidence NUMERIC(6,2) DEFAULT 0,
  best_book_slug VARCHAR(64),
  total_settled_bets INTEGER DEFAULT 0,
  last_calculated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_ml_profile_user ON user_ml_profile(user_id);
```

### Modify `consensus` Table

```sql
ALTER TABLE consensus ADD COLUMN IF NOT EXISTS confidence_low INTEGER DEFAULT 0;
ALTER TABLE consensus ADD COLUMN IF NOT EXISTS confidence_high INTEGER DEFAULT 0;
ALTER TABLE consensus ADD COLUMN IF NOT EXISTS confidence_label VARCHAR(16) DEFAULT 'low';
ALTER TABLE consensus ADD COLUMN IF NOT EXISTS house_lean_strength INTEGER DEFAULT 0;
ALTER TABLE consensus ADD COLUMN IF NOT EXISTS market_divergence INTEGER DEFAULT 0;
ALTER TABLE consensus ADD COLUMN IF NOT EXISTS technical_reasoning TEXT;
ALTER TABLE consensus ADD COLUMN IF NOT EXISTS anomaly_flags JSONB DEFAULT '[]';
```

### Modify `anomalies` Table

```sql
-- Add metadata field if not present (already in schema as JSONB, but ensure flip_direction and sharp_side are documented)
-- sharp_side: 'home' | 'away' (for reverse_steam and late_flip signals)
-- flip_direction: 'home' | 'away' (which way the line flipped)
-- line_before: numeric
-- line_after: numeric
COMMENT ON COLUMN anomalies.metadata IS 'For reverse_steam/late_flip: { sharp_side, flip_direction, line_before, line_after }';
```

### New Index for Consensus History

```sql
CREATE INDEX IF NOT EXISTS idx_consensus_game_time ON consensus(game_id, generated_at DESC);
```

---

## 7. API Changes

### Updated Response Shape for `GET /api/consensus/:gameId`

```json
{
  "game_id": "uuid",
  "home_likelihood": 62,
  "away_likelihood": 38,
  "confidence": 71,
  "confidence_low": 63,
  "confidence_high": 79,
  "confidence_label": "high",
  "alignment": 74,
  "integrity": 95,
  "house_lean": false,
  "house_lean_strength": 0,
  "market_divergence": 4,
  "reasoning": "Sharp money has been moving this line toward the home team since yesterday afternoon. Three steam moves detected in the last 6 hours, and the line hasn't shown any public pushback.",
  "technical_reasoning": "74% source alignment favoring home (8 sources, 6 in agreement). 1 signal detected: sync move.",
  "sources_agree": 6,
  "sources_disagree": 2,
  "anomaly_flags": [
    { "type": "sync_move", "severity": "high", "confidence_impact": "+12" }
  ],
  "model_version": "v0.2.0",
  "generated_at": "2026-03-24T14:30:00.000Z"
}
```

### New Endpoints to Add

| Method | Path | Description |
|---|---|---|
| GET | `/api/consensus/:gameId/history` | Consensus trend over time for one game |
| POST | `/api/bets/recalculate-profile` | Rebuild user's ML profile from bet history |
| GET | `/api/users/me/ml-profile` | Get user's current ML profile and personalized notes |

---

## 8. Frontend / UX Improvements

These are recommendations for `bets.html` and any game/consensus display pages:

### Confidence Band Visualization
- Replace the single `%` number with a range bar (e.g., a progress bar showing the low-to-high range with the midpoint marked)
- Color code: green = high label, yellow = medium, red/gray = low

### Consensus Trend Sparkline
- For each game card, show a tiny 24h sparkline of how confidence has moved
- Include a tag like "Trending Up" or "Stable" or "Flipping" based on the history endpoint data

### Anomaly Badges
- Surface anomaly types as labeled badges on the game card (not just a count)
- `reverse_steam` → "Sharp Action" badge (high priority, prominent)
- `late_flip` → "Line Flip" badge with a clock icon (urgent)
- `sync_move` → "Market Sync" badge
- `outlier_consensus` → "Outlier Source" badge (softer warning)

### Personalized Insight Panel
- After a user has 10+ settled bets, show a small panel on the consensus view with their personal stats:
  - "You're 6-2 on NBA moneylines (75%)"
  - "Your ROI on high-confidence picks: +8.3%"
  - "Your parlay record: 4-11 — consider straight bets here"
- Do not show this until there's enough data to be meaningful (< 10 settled bets = hide panel)

### Reasoning Toggle
- Show the GPT reasoning by default
- Add a "show technical details" toggle that reveals the `technical_reasoning` field for users who want to see the raw signal breakdown

---

## 9. Implementation Priority Order

Work through these in order. Each builds on the previous.

| Priority | Change | File(s) | Effort |
|---|---|---|---|
| 1 | Wire CLV and consistency into consensus weight formula | `consensus.js` | Low |
| 2 | Anomaly type modulation (replace count with impact) | `consensus.js` | Low-Medium |
| 3 | Confidence bands | `consensus.js`, `schema` | Low |
| 4 | Gradient house lean (replace binary average) | `consensus.js` | Low |
| 5 | Line movement delta scoring | `consensus.js` | Medium |
| 6 | Temporal decay weighting | `scoring.js`, `consensus.js` | Medium |
| 7 | Sport-specific calibration config | `sport-config.js` (new), `consensus.js` | Medium |
| 8 | Multi-market fusion | `consensus.js` | Medium |
| 9 | Consensus history endpoint | `server/routes` (new endpoint) | Low |
| 10 | User ML profile table + recalculation endpoint | `db`, `server/bets.js` or `server/profile.js` | Medium-High |
| 11 | GPT reasoning integration | `consensus.js` | Low-Medium |
| 12 | Frontend anomaly badges + confidence band UI | `bets.html` / front-end | Medium |
| 13 | Personalized insight panel | Front-end | Medium |
| 14 | Consensus trend sparkline | Front-end | Medium |

---

## 10. Notes for the Implementing Agent

- **Do not alter the consensus prediction based on user history.** The prediction must stay objective and shared. Only presentation and emphasis should personalize. Changing the actual prediction per user would corrupt the signal and mislead users.

- **`generateConsensus` is now async** because of the optional GPT call. Any callers of `generateConsensus` or `generateAllConsensus` need to be updated to `await` the result. Check everywhere these functions are called.

- **The CLV calculation in `scoring.js` requires `time_to_game` to be populated on snapshots.** If this field is null or missing in the database for existing snapshots, CLV will return 0. Verify that the odds ingestion pipeline is setting `time_to_game` correctly when saving snapshots. If not, that pipeline fix is a prerequisite for CLV to be meaningful.

- **Anomaly `metadata` field needs to be populated by the anomaly detection layer.** For `reverse_steam` and `late_flip` to have direction signals, the code that *creates* anomaly records must write `{ sharp_side, flip_direction }` into the metadata JSONB. Audit the anomaly creation code (wherever that lives) and ensure it is populating metadata correctly.

- **The `user_ml_profile` recalculation should be triggered automatically** any time a bet is settled (status changes to won/lost/push/cashed_out). The cleanest place to hook this is in the `PUT /api/bets/:id` endpoint in `bets.js`, after a successful status update. Fire it as a non-blocking background call so it doesn't delay the response.

- **Cache consensus responses.** Consensus should not be recalculated on every API request. Calculate on a schedule (every 15–30 minutes, or triggered by new odds snapshots), store the result in the `consensus` table, and serve from the database. The GPT reasoning call especially should only run once per consensus cycle, not on every GET.

- **Model versioning.** The updated algorithm is `model_version: 'v0.2.0'`. Keep this in sync in the DB records. Future algorithm changes should increment the version so historical consensus records can be attributed to the correct model for accuracy tracking.

- **Accuracy tracking over time.** After implementing all of the above, add a background job that runs after games go to `status = 'final'` and compares the consensus prediction to the actual result. Store this in a `consensus_outcomes` table. This is the foundation for eventually having real ground-truth accuracy numbers to back up the tier assignments.
