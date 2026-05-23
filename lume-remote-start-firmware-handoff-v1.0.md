TITLE: LUME Mode 06 — Remote Start Firmware Extension
VERSION: 1.0
AUTHOR: DarkWave Studios LLC
DATE: May 2026
STATUS: Build-ready directive. All sections are implementation requirements, not proposals.
COMPANION DOCUMENTS:
  - lume-dual-dongle-handoff-v1.1.md       (read first — base architecture)
  - lume-key-management-firmware-handoff-v1.0.md  (Mode 05 — required prerequisite)

------------------------------------------------------------
CRITICAL PREREQUISITE — READ BEFORE ANY BUILD WORK
------------------------------------------------------------
Mode 06 (Remote Start) CANNOT function without Mode 05 (Key Management)
having been completed first for the target vehicle.

The dongle must be registered as a valid IMMO key credential
(via Mode 05C) before the vehicle's immobilizer will permit a
CAN-initiated remote start. This is not a software gate — it is
a vehicle security requirement. The IMMO module will reject the
start sequence from any device that is not a registered key.

Build order dependency:
  1. Mode 05 firmware built and tested (already complete)
  2. Dongle registered to target vehicle via Mode 05C
  3. Mode 06 firmware built on top of that registered credential

Do not attempt to build Mode 06 in parallel with or before Mode 05
is validated end-to-end on a real vehicle.

------------------------------------------------------------
SCOPE — TWO DEPLOYMENT CONTEXTS
------------------------------------------------------------
CONTEXT A — MANHEIM / ENTERPRISE
  User:        Manheim lot technicians, lot managers, supervisors.
  Ledger:      Cox Automotive Ledger (CAL)
  Use cases:   Vehicle warm-up before inspection, lot staging and
               positioning, battery maintenance starts, cold-weather
               pre-conditioning, supervisor-authorized lot movement.
  Value:       Every remote start event on the lot is cryptographically
               anchored to CAL. Full audit trail: who started which
               vehicle, when, for how long, and under whose authorization.
               First tamper-evident remote start governance in the
               Manheim ecosystem.

CONTEXT B — CONSUMER
  User:        Individual vehicle owners, independent mechanics.
  Ledger:      Trust Layer Ledger (TLL)
  Use cases:   Personal remote start without OEM app subscription,
               fleet management for small operators, pre-conditioning
               before driving.
  Value:       Replaces GM OnStar, FordPass, and Mopar remote start
               subscriptions. Works on any supported vehicle with the
               dongle plugged in. No telematics module required.
               TLL-verified remote start history for the vehicle.

------------------------------------------------------------
SECTION 1 — OVERVIEW AND CONTEXT
------------------------------------------------------------
1. What This Is:
   - A firmware extension to the LUME diagnostic dongle enabling
     CAN-bus-initiated remote start and remote stop.
   - Uses the dongle's registered IMMO key credential (from Mode 05)
     to satisfy the vehicle's immobilizer during the start sequence.
   - No additional hardware required beyond what Mode 05 needs.
   - Dongle remains plugged into OBD-II port — the vehicle-carried
     mode from the dual-dongle handoff is the enabling architecture.

2. How It Differs from Traditional Remote Start:
   - Traditional systems wire into the ignition harness and use a
     physical bypass module to place a cloned transponder near the
     ignition cylinder.
   - LUME Mode 06 uses the CAN bus. The dongle is the key. No wiring.
     No bypass module. Firmware and a registered credential.
   - OEM apps (myChevrolet, FordPass, Mopar) do the same thing via
     their telematics modules — which are also registered key
     credentials on the CAN bus. LUME replicates this architecture
     without requiring the OEM's cellular module or subscription.

3. Why the Dongle Must Stay Plugged In:
   - The vehicle's IMMO module expects the registered key credential
     to be present on the CAN bus when the start command arrives.
   - The dongle IS the registered key for remote start purposes.
   - If the dongle is unplugged, Mode 06 is unavailable.
   - The app must warn the user if Mode 06 is configured but the
     dongle is not detected on BLE.

4. Ledger Routing:
   - Enterprise (Context A): remote start events anchor to CAL.
   - Consumer (Context B): remote start events anchor to TLL.
   - Same ledger_target field in authorization payload as Mode 05.
   - Firmware does not select the ledger. App determines context
     from user's license tier.

------------------------------------------------------------
SECTION 2 — MODE 06 COMMAND SET
------------------------------------------------------------
Mode 06 is the remote start mode. It operates only when an active
BLE connection is present and the dongle has a registered IMMO
credential from a prior Mode 05C operation on this vehicle.

Sub-commands:

  0x06A — Pre-Start Readiness Check
    Purpose:    Query vehicle state before attempting remote start.
                Read-only. No write to vehicle.
    Direction:  Read-only.
    Returns:
      - immo_credential_present: boolean (is dongle registered?)
      - fuel_level_pct: float | null
      - battery_voltage_v: float
      - hood_status: "OPEN" | "CLOSED" | "UNKNOWN"
      - door_status: "OPEN" | "CLOSED" | "UNKNOWN" (any door)
      - active_blocking_dtcs: ["string"] (DTCs that block remote start)
      - engine_running: boolean
      - readiness_result: "READY" | "BLOCKED" | "WARNING"
      - block_reasons: ["string"] (plain language, shown to user)

    Blocking conditions (readiness_result = "BLOCKED"):
      - immo_credential_present = false → "Dongle not registered to
        this vehicle. Run Key Management first."
      - hood_status = "OPEN" → "Hood is open. Remote start blocked."
      - engine_running = true → "Engine already running."
      - battery_voltage_v < 11.5 → "Battery voltage too low for
        reliable remote start."
      - active_blocking_dtcs present → "Active fault codes block
        remote start. Clear faults first."

    Warning conditions (readiness_result = "WARNING", proceed allowed):
      - fuel_level_pct < 15 → "Fuel level low."
      - battery_voltage_v < 12.0 → "Battery voltage marginal."
      - door_status = "OPEN" → "A door is open."

  0x06B — Authenticate IMMO Credential
    Purpose:    Perform security access handshake using the dongle's
                registered key credential before issuing start command.
    Direction:  Write (gated — requires authorization, see Section 4).
    Steps:
      1. Receive signed authorization token from app via BLE.
         Token must include: user_id, vin_confirmed, ledger_target,
         timestamp_utc, signature, expiry (30 seconds from issue).
      2. Validate token: verify signature, check expiry.
         If token expired or invalid: reject immediately. Log attempt.
      3. Send DiagnosticSessionControl (0x10 03) — extended session.
      4. Send SecurityAccess seed request (0x27 01).
      5. Forward seed to app via BLE for computation.
      6. Receive computed key from app. Send (0x27 02).
      7. Confirm positive response (0x67 02).
      8. Hold session open for 0x06C (max 10 seconds).
    Timeout:    If 0x06C not received within 10 seconds: return to
                default session. Log timeout. Require fresh 0x06B.

  0x06C — Remote Start
    Purpose:    Issue CAN remote start sequence to the vehicle.
    Direction:  Write (only during active 0x06B session).
    Steps:
      1. Confirm 0x06B session is active and not expired.
      2. Send OEM-specific remote start CAN sequence:
         a. Ignition ON command (KOEO — key on engine off state)
         b. Wait for KOEO confirmation (fuel pump prime, systems init)
            Timeout: 3 seconds. Abort if no confirmation.
         c. Crank command
         d. Poll RPM (Mode 01 PID 0x0C) at 500ms intervals.
            Confirm RPM > 400 within 5 seconds (engine running).
            If RPM never exceeds 400: classify as crank failure.
            Abort, return to default session, log failure.
      3. On confirmed start (RPM > 400):
         - Return to default session (0x10 01).
         - Begin runtime monitoring (see Section 3, Item 5).
         - Generate remote start event record (Section 6).
         - Signal app to anchor record to ledger_target.
      4. Set runtime_start_timestamp. Start runtime timer.

  0x06D — Remote Stop
    Purpose:    Issue CAN remote stop command. Shutdown sequence.
    Direction:  Write (gated — same authorization level as 0x06C).
    Steps:
      1. Receive signed authorization token from app (same format,
         fresh 30-second window).
      2. Validate token. Open extended session. Security access.
      3. Send OEM-specific remote stop sequence.
      4. Poll RPM until < 100 (engine off), max 5 second wait.
      5. Return to default session.
      6. Generate remote stop event record. Anchor to ledger.
      7. Clear runtime monitoring state.

  0x06E — Poll Running Status
    Purpose:    Check whether the vehicle is currently in a
                LUME-initiated remote start session.
    Direction:  Read-only. No write to vehicle.
    Returns:
      - remote_start_active: boolean
      - runtime_seconds: int | null
      - runtime_limit_seconds: int (configured max, default 600)
      - rpm_current: float | null
      - coolant_temp_c: float | null
      - battery_voltage_v: float

------------------------------------------------------------
SECTION 3 — UDS PROTOCOL REQUIREMENTS
------------------------------------------------------------
1. Session Management:
   - Default session (0x10 01): Modes 01–04, 07, 09, and 0x06A/0x06E.
   - Extended session (0x10 03): required for 0x06B, 0x06C, 0x06D.
   - Programming session (0x10 02): NOT used. Must not be implemented.

2. TesterPresent Keep-Alive:
   - Send (0x3E 00) every 2 seconds while extended session is open.
   - If BLE drops: stop TesterPresent immediately. Do not hold session.
   - After engine confirmed running (RPM > 400): return to default
     session. TesterPresent no longer required during runtime.

3. Error Handling:
   - NRC 0x22 (conditionsNotCorrect): abort start, log, report to app.
     "Vehicle conditions not met for remote start. Check readiness."
   - NRC 0x35 (invalidKey): security access failed. Log. 3 failures
     in 10 minutes triggers 5-minute lockout. Log lockout.
   - Crank timeout (RPM never > 400 in 5 seconds): classify as
     START_FAILURE. Do not retry automatically. Report to app.
     Log event with RPM readings at each 500ms interval.
   - All errors reported to app as plain-language descriptions.

4. ISO Compliance:
   - ISO 14229-1 (UDS) — all diagnostic communication.
   - ISO 15765-2 (CAN transport) — all CAN framing.
   - CAN listen-before-talk (500ms) from dual-dongle handoff applies.

5. Runtime Monitoring (active during remote start session):
   - After confirmed engine start: return to default session.
   - Poll at 5-second intervals: RPM, coolant_temp_c, battery_voltage_v.
   - Auto-stop triggers (firmware-initiated 0x06D without app command):
     - Engine stalls (RPM drops below 100 for 5 consecutive readings)
     - Runtime exceeds configured limit (default: 600 seconds / 10 min)
     - Battery voltage drops below 11.5V during run
     - BLE connection lost for more than 60 seconds continuously
   - Each auto-stop trigger generates an event record with reason code
     and is anchored to the ledger.

------------------------------------------------------------
SECTION 4 — AUTHORIZATION GATES
------------------------------------------------------------
Remote start has a higher authorization bar than key programming.
The potential consequences of unauthorized remote start are greater
(vehicle theft vector) so additional friction is justified and required.

Authorization token (signed, timestamped — generated by app):
  {
    "command":         "06B" | "06D",
    "user_id":         "string",
    "vin_confirmed":   "string — 17-char VIN",
    "ledger_target":   "CAL" | "TLL",
    "timestamp_utc":   "ISO 8601 UTC — time token was issued",
    "expiry_seconds":  30,
    "signature":       "Ed25519 signature over all other fields"
  }

Firmware validates:
  - Signature is valid (Ed25519, using provisioned app public key).
  - timestamp_utc is within 30 seconds of current dongle time.
  - vin_confirmed matches VIN read by dongle via Mode 09.
  - All fields present.
  Reject and log any token that fails any check.

App-side authorization requirements before token is issued:

  Level S1 — Consumer Remote Start (Context B):
    - User authenticated to LUME account (Trust Layer SSO).
    - 2FA completed within the last 24 hours (not just session auth).
    - PIN or biometric confirmation in app at time of command.
    - In-app confirmation: "Start [YMM] remotely? [VIN last 6]"
    - Runtime limit selection: 5 / 10 / 15 / 20 minutes (max 20).

  Level S2 — Enterprise Remote Start (Context A):
    - Technician authenticated (Firebase, coxautoinc.com domain).
    - Supervisor authorization required for first remote start
      configuration per vehicle. Subsequent starts by authorized
      technician only.
    - In-app confirmation with vehicle ID and lot location displayed.
    - Runtime limit set by facility manager (default 10 min, max 30 min
      for cold-weather battery conditioning cycles).
    - Geofence enforcement (see Section 10, Item 3).

------------------------------------------------------------
SECTION 5 — IMMO CREDENTIAL PREREQUISITE
------------------------------------------------------------
1. Registration Requirement:
   The dongle must have been registered as a valid key credential
   via Mode 05C before Mode 06 will function on any vehicle.

2. How the Firmware Verifies This:
   - 0x06A (Pre-Start Check) reads IMMO module status via UDS 0x22
     to confirm a registered credential exists for this dongle.
   - immo_credential_present = false blocks all write commands
     in Mode 06. Hard block, not a soft warning.

3. Credential Slot Tracking:
   - The key slot index used during Mode 05C registration must be
     stored in the dongle's secure configuration for this VIN.
   - Format: { "vin": "string", "key_slot": int, "registered_at": "ISO 8601 UTC" }
   - Encrypted at rest (AES-256-GCM, same as all dongle flash storage).
   - Multiple VINs supported — one credential entry per vehicle.

4. Credential Revocation:
   - If Mode 05D (delete key) is run for the dongle's key slot on
     this vehicle: remote start for that VIN is automatically
     unavailable. Firmware detects via 0x06A IMMO check.
   - User is notified in app: "Remote start disabled. Dongle is no
     longer registered to this vehicle. Re-run Key Management."

5. Seed/Key Algorithm:
   - Same algorithm layer as Mode 05. See Mode 05 handoff Section 5.
   - No additional algorithm sourcing needed.

------------------------------------------------------------
SECTION 6 — DATA MODEL — REMOTE START RECORDS
------------------------------------------------------------
1. Remote Start Event Record:
   {
     "record_type":          "remote_start_event",
     "timestamp":            "ISO 8601 UTC",
     "event":                "start_initiated" | "start_confirmed" | "start_failed" | "stop_initiated" | "stop_confirmed" | "auto_stop" | "auth_rejected" | "security_lockout",
     "vin":                  "string — 17-char, verified via Mode 09",
     "dongle_id":            "string",
     "user_id":              "string",
     "context":              "ENTERPRISE" | "CONSUMER",
     "ledger_target":        "CAL" | "TLL",
     "runtime_seconds":      int | null,
     "runtime_limit_seconds":int,
     "auto_stop_reason":     "STALL" | "TIMEOUT" | "LOW_BATTERY" | "BLE_LOST" | null,
     "rpm_at_confirm":       float | null,
     "coolant_temp_at_start":float | null,
     "battery_voltage_start":float,
     "battery_voltage_end":  float | null,
     "result":               "SUCCESS" | "FAILURE" | "AUTH_REJECTED" | "LOCKOUT",
     "failure_reason":       "string | null",
     "firmware_version":     "string",
     "cal_anchor_hash":      "string | null",
     "tll_anchor_hash":      "string | null"
   }

2. Enterprise Anchoring (Context A — CAL):
   - POST /api/submit/arbitration (same endpoint as key programming)
   - cal_anchor_hash populated before success shown.
   - Record attached to Vehicle Asset Passport remote_start_history.

3. Consumer Anchoring (Context B — TLL):
   - POST to TLL at trust-layer.onrender.com
   - tll_anchor_hash populated before success shown.
   - Consumer receives TLL-verified remote start receipt.

4. TLL-Verified Remote Start Receipt (consumer-facing):
   ┌─────────────────────────────────────────────────────────┐
   │  REMOTE START RECEIPT                                   │
   │  Vehicle:  [YMM from VIN decode] · [last 6 VIN]         │
   │  Started:  [human-readable timestamp]                   │
   │  Runtime:  [X] minutes                                  │
   │  Status:   TLL-VERIFIED ✓                               │
   │  Receipt:  [first 12 chars of tll_anchor_hash]          │
   └─────────────────────────────────────────────────────────┘

5. Asset Passport Extension (Enterprise — Context A):
   - /api/passport/:vin must include remote_start_history array.
   - Each event (summarized) appended to remote_start_history.
   - Access tiers same as key_history: facility → corporate → employee.

------------------------------------------------------------
SECTION 7 — HARD CONSTRAINTS
------------------------------------------------------------
HC-R1: Signed Timestamped Token Required
  - Every Mode 06 write command (0x06B, 0x06C, 0x06D) requires a
    valid signed authorization token with a 30-second expiry.
  - Tokens are verified at the firmware level, not just the app level.
  - Expired, invalid, or unsigned tokens are rejected and logged.
  - This prevents relay attacks: a captured command cannot be replayed
    after its 30-second window.

HC-R2: VIN Verification Required
  - Same as Mode 05. vin_confirmed in token must match VIN read
    by dongle via Mode 09 PID 0x02.
  - Mismatch: command rejected. App error displayed.

HC-R3: No Auto-Retry on Start Failure
  - If crank fails (RPM never exceeds 400): firmware does not retry.
  - User must initiate a fresh authorization flow for any retry.
  - Maximum 3 start attempts per 10-minute window. After 3: 5-minute
    lockout. Prevents battery drain and starter damage.

HC-R4: No Programming Session
  - Same as Mode 05. UDS programming session (0x10 02) not implemented.

HC-R5: Session Isolation
  - Mode 06 write commands cannot be open with any other active mode.
  - Modes 01–04 suspended during Mode 06 write sessions.
  - Mode 06 read commands (0x06A, 0x06E) may run alongside Modes 01–04.

HC-R6: Runtime Limit Enforced at Firmware Level
  - The runtime limit (default 600 seconds) is enforced by the dongle.
  - App cannot override or extend runtime once a session is active.
  - Runtime limit is set during the authorization flow and locked into
    the signed token. Firmware reads it from the token.

HC-R7: BLE Drop Auto-Stop
  - If BLE connection to the app is lost for more than 60 continuous
    seconds while a remote start session is active: firmware issues
    0x06D automatically.
  - Logs auto_stop_reason = "BLE_LOST".
  - Prevents vehicle running indefinitely if user's phone disconnects,
    dies, or moves out of range.

HC-R8: Hood Open Block
  - If hood_status = "OPEN" at any point during an active remote
    start session: issue auto-stop immediately.
  - Reason: safety. Someone opening the hood during a remote start
    is working on a running engine — unacceptable.
  - Logs auto_stop_reason = "HOOD_OPEN" (add to auto_stop_reason enum).

------------------------------------------------------------
SECTION 8 — SECURITY ARCHITECTURE
------------------------------------------------------------
Remote start introduces a materially higher security surface than
diagnostics or key programming. The following are all required.

1. Anti-Relay Attack (HC-R1 implementation detail):
   - Authorization token is signed with Ed25519 by the app's private
     signing key (provisioned per user account at account creation).
   - Token includes timestamp_utc. Firmware validates that the token
     timestamp is within 30 seconds of the dongle's current time.
   - Dongle maintains time via last BLE sync. If dongle time is
     more than 5 minutes out of sync: reject all Mode 06 write tokens
     until time is resynchronized via BLE.
   - A captured and replayed token from a BLE sniffer is useless
     after its 30-second window expires.

2. App-Side Security Requirements:
   - 2FA required for Mode 06 access. Not the same session auth as
     login — a separate 2FA challenge before the remote start UI
     is accessible. Cadence: once per 24-hour period.
   - PIN or biometric required per-command (each start/stop requires
     phone unlock or PIN entry). Not once per session — per command.
   - App must display a persistent notification while a remote start
     session is active: "Your [VIN last 6] is running remotely."
   - App must provide a one-tap emergency stop from the notification.

3. Dongle Persistence Warning:
   - Any time the app detects the dongle is in a vehicle that has
     Mode 06 configured, it must display in the vehicle's status card:
     "Remote start enabled — dongle is registered to this vehicle."
   - This surfaces the security implication to users who may leave
     their dongle plugged in without thinking about it.

4. Account Compromise Mitigation:
   - If a "stop all remote start sessions" command is issued from
     account settings, the app must revoke the signing key and
     issue a new one. Any in-flight tokens signed by the old key
     are immediately invalid.
   - This is an app/account layer requirement, not firmware.

------------------------------------------------------------
SECTION 9 — VEHICLE COMPATIBILITY
------------------------------------------------------------
Remote start via CAN bus requires OEM-specific command sequences.
Not all vehicles expose this capability. Build in order of coverage.

Priority 1 — Highest Coverage:
  Ford (2017+, SYNC 3 / SYNC 4 telematics path)
  GM (2015+, OnStar telematics path — Chevy, Buick, GMC, Cadillac)
  Chrysler / Stellantis (2018+, Uconnect telematics path)
  — Covers the majority of Manheim lot inventory and consumer market.

Priority 2 — Growing Coverage:
  Toyota (2019+, select models with Safety Connect)
  Honda (2020+, select models with HondaLink)
  Nissan (2019+, select models with NissanConnect)

Priority 3 — Limited / Proprietary:
  BMW (proprietary gateway, high security level — defer)
  Mercedes (EIS/EZS gateway — defer)
  Volkswagen Group (ODIS security level — defer)

OEM identifier is a required field in all Mode 06 records.
Coverage expands without firmware changes.

Unsupported vehicle behavior:
  - 0x06A returns readiness_result = "BLOCKED" with block_reason:
    "Remote start not yet supported for this vehicle make/model.
    Supported: Ford, GM, Chrysler (2015+). More coming soon."
  - Do not attempt start sequences on unsupported OEMs.

------------------------------------------------------------
SECTION 10 — MANHEIM / ENTERPRISE INTEGRATION
------------------------------------------------------------
1. Lot Operations Use Cases:
   - Vehicle Warm-Up: technician initiates remote start from the
     check-in desk before walking to the vehicle. Vehicle is warm
     and ready for inspection on arrival. Reduces inspection time
     in cold weather by 3–5 minutes per vehicle.
   - Lot Staging: vehicle is started remotely and ready to be driven
     to a specific lane position. Reduces manual push/tow events.
   - Battery Conditioning: vehicles sitting on the lot for 7+ days
     can receive a scheduled maintenance start (supervisor-authorized)
     to keep the battery charged. Reduces jump-start incidents before
     auction.
   - Pre-Auction Line: vehicles started and warmed before lane entry.
     Buyers see a running vehicle — reduces "cold start" objections
     that suppress bid prices.

2. Supervisor Authorization Layer (Enterprise-Only):
   - Facility managers configure which technicians are authorized
     for Mode 06 per vehicle or vehicle class.
   - Remote start must not be available to every technician by default.
     Supervisor must explicitly enable it per technician per lot.
   - This configuration lives in the enterprise account settings,
     not in firmware.
   - Firmware only sees: is the user's authorization token valid?
     The app enforces the supervisor tier.

3. Geofencing (Enterprise-Only):
   - Remote start command may only be issued when the app's GPS
     position is within the configured lot boundary.
   - Geofence radius: set by facility manager (default 500m).
   - If app is outside the geofence: Mode 06 UI is disabled.
     "You must be on-lot to start vehicles remotely."
   - This prevents off-lot remote start (a vehicle theft vector).
   - Geofence enforcement is an app requirement. Firmware does not
     have GPS context. The app includes geofence status in the
     authorization token's metadata (informational, not enforced
     by firmware — app is the enforcement point for this control).

4. CAL Audit Trail:
   - Every remote start and stop event on every lot vehicle is
     anchored to CAL.
   - Remote start history is visible in the Vehicle Asset Passport.
   - Facility manager dashboard shows: starts per day, average runtime,
     auto-stop events, battery conditioning starts.
   - This data does not currently exist anywhere in the Manheim ecosystem.
     It becomes a new operational intelligence layer.

5. Manheim Pitch Language:
   - "Your lot vehicles sit idle for days. Batteries die. Cold
     inspections skew condition scores. Reconditioning teams walk
     to cold vehicles. LUME Remote Start solves all of this with
     the same dongle already in the OBD-II port — and every start
     is permanently recorded on CAL."
   - "This doesn't replace your staging process. It instruments it."
   - Tone rule applies: this wraps what already exists.

------------------------------------------------------------
SECTION 11 — CONSUMER TLL INTEGRATION
------------------------------------------------------------
1. The Consumer Value Proposition:
   - OEM remote start apps (myChevrolet, FordPass, Mopar) require:
     a cellular telematics module installed, a subscription fee
     ($25–$35/month), and ongoing OEM relationship.
   - LUME Mode 06 requires: the OBD-II dongle the customer already
     has, the LUME app, and a one-time firmware upgrade.
   - No subscription. No telematics module. No OEM relationship.

2. TLL Anchoring Flow (Consumer):
   - Same flow as Mode 05 consumer anchoring (see Mode 05 handoff
     Section 10).
   - Remote start event records anchor to TLL at trust-layer.onrender.com.
   - Consumer receives a TLL-verified receipt per session.
   - "My Remote Start History" in the LUME app — all TLL-anchored
     events: VIN last 6, date, runtime, receipt hash.

3. Consumer-Facing Feature Name:
   - Product name in the app: "Remote Start"
   - Not "CAN Remote Start," not "OBD Remote Start." Just "Remote Start."
   - The architecture is invisible to the consumer.

4. License Tier Update (extends Mode 05 handoff Section 11, Item 3):

   Tier 2 — Key Management (existing):
     Modes 01–04, 07, 09, Mode 05
     Ledger: TLL

   Tier 2R — Key Management + Remote Start:
     All of Tier 2 + Mode 06
     Ledger: TLL for both
     Price: higher one-time or monthly rate than Tier 2 alone
     Includes: TLL-verified receipts for both key and remote start events

   Tier 3 — Enterprise (existing, unchanged):
     All modes, CAL anchoring, supervisor tiers, geofencing

5. Consumer Onboarding for Mode 06 (extends Mode 05 onboarding):
   a. Customer upgrades to Tier 2R firmware (same OTA process as Mode 05).
   b. App prompt after firmware update: "Remote Start is now available.
      You must first register your dongle as a key to your vehicle
      using Key Management. This is a one-time setup."
   c. User completes Mode 05C registration if not already done.
   d. App unlocks Remote Start tab after Mode 05C confirmed.
   e. First launch of Remote Start tab: security onboarding screen.
      Explains PIN requirement, BLE range, runtime limits, and
      auto-stop behavior. One-time acknowledgment.
   f. 2FA setup required if not already configured.

------------------------------------------------------------
SECTION 12 — STATE DISCLAIMER EXTENSION
------------------------------------------------------------
The state-aware disclaimer system built for Mode 05 applies to
Mode 06 as well. No new states or enforcement changes — the same
15 regulated states apply, same API endpoint.

App behavior for Mode 06 in regulated states:
  - If the user has already acknowledged the Mode 05 disclaimer:
    no additional modal needed for Mode 06.
  - If Mode 06 is the user's first key/remote start feature:
    show the modal as specified in Mode 05 handoff Section 11, Item 6.

The Terms of Service sentence must be updated to cover both features:
  "Key Management (Mode 05) and Remote Start (Mode 06) are professional
   diagnostic features. Users are responsible for complying with
   applicable state and local licensing requirements for automotive
   key programming and related activities in their jurisdiction."

------------------------------------------------------------
SECTION 13 — COMPLIANCE AND LEGAL
------------------------------------------------------------
1. Remote Start and Vehicle Liability:
   - LUME initiates a remote start; the user is responsible for
     ensuring the vehicle is in a safe location before commanding it.
   - Terms of Service must include: "Do not use Remote Start in an
     enclosed space. Do not use Remote Start if the vehicle is in
     gear. Ensure the vehicle is parked in a safe, open area before
     initiating remote start."
   - These are standard remote start disclaimers used by every OEM
     and aftermarket remote start provider.

2. Theft Vector Acknowledgment:
   - The in-app security onboarding (Section 11, Item 5e) must
     explicitly state: "Leaving your LUME dongle plugged into your
     vehicle allows anyone with access to your LUME account to start
     it remotely. Use 2FA. Use a strong PIN. Remove the dongle when
     the vehicle is unattended for extended periods."
   - This is not scaremongering — it is accurate and appropriate.

3. OEM Warranty:
   - Standard disclaimer: "LUME is an OBD-II diagnostic tool.
     Use of remote start commands via the OBD-II port does not
     physically modify your vehicle. However, check your vehicle
     warranty terms regarding third-party telematics."
   - Same language used by Autel, Launch, and other scan tool vendors.

4. Tone:
   - Manheim: "instruments the staging process, not replaces it."
   - Consumer: "remote start without the subscription."
   - Never: "hacks," "bypasses," "overrides," "unlocks dealer features."

------------------------------------------------------------
SECTION 14 — IMPLEMENTATION REQUIREMENTS SUMMARY
------------------------------------------------------------
Firmware:
  - Add Mode 06 (0x06A, 0x06B, 0x06C, 0x06D, 0x06E) to command set
  - Ed25519 token validation at firmware level (HC-R1)
  - 30-second token expiry enforcement
  - VIN verification before all write commands (HC-R2)
  - No auto-retry on start failure, 3-attempt limit (HC-R3)
  - Session isolation (HC-R5)
  - Runtime limit enforcement from signed token (HC-R6)
  - BLE drop auto-stop with 60-second grace window (HC-R7)
  - Hood open auto-stop (HC-R8)
  - Runtime monitoring at 5-second intervals
  - Auto-stop triggers: stall / timeout / low battery / BLE lost
  - 5-minute lockout after 3 security access failures
  - IMMO credential slot stored per VIN in encrypted flash
  - All eight Hard Constraints (HC-R1 through HC-R8) at firmware level

App:
  - 2FA required for Mode 06 access (24-hour cadence)
  - PIN/biometric per-command confirmation
  - Ed25519 signed authorization token generation with 30-second expiry
  - ledger_target set from license tier
  - 0x06A pre-start check before any start UI unlocks
  - Block reasons displayed in plain language
  - Runtime limit selector (S1: 5/10/15/20 min, S2: configurable)
  - Persistent notification during active session with one-tap stop
  - Dongle persistence warning in vehicle card when Mode 06 configured
  - Emergency stop accessible from notification, not just app foreground
  - Consumer: "Remote Start" tab unlocked only after Mode 05C confirmed
  - Enterprise: supervisor authorization tier, geofence enforcement
  - Account-level "stop all sessions" with key revocation
  - TLL receipt display with runtime and share/export
  - "My Remote Start History" screen (consumer)
  - Security onboarding screen on first Mode 06 launch

API Server (new endpoints — add to key-management route):
  GET /api/key-management/remote-start-status?vin={VIN}&dongle_id={ID}
    Returns: active session status, runtime_seconds, last event.
    Used by enterprise dashboard and consumer app polling.

CAL / Asset Passport (Enterprise):
  - remote_start_history array added to Vehicle Asset Passport
  - Remote start event record submitted to POST /api/submit/arbitration
  - cal_anchor_hash stored before success shown
  - Lot manager dashboard: starts per day, avg runtime, auto-stops,
    battery conditioning events

TLL (Consumer):
  - Same anchoring flow as Mode 05 consumer
  - TLL-verified remote start receipt generated per session
  - Offline queue: retry TLL POST on connectivity restore

Terms of Service:
  - Safe use disclaimer (enclosed space, vehicle in gear)
  - Security disclaimer (dongle in vehicle = remote start enabled)
  - OEM warranty language
  - Updated state disclaimer sentence covering both Mode 05 and 06

------------------------------------------------------------
SECTION 15 — FOUNDER TIER ONBOARDING AND FEEDBACK FORM
------------------------------------------------------------
CONTEXT AND PURPOSE
-------------------
The first 100 users of LUME are designated Founders. Founders pay
$10 (one-time) instead of the standard $39.99 base price. This is
not a promotional discount — it is a deliberate acquisition strategy.
The goal is not $1,000 in revenue. The goal is 100 verified users
who have seen real results and can describe them in their own words.

Their responses become:
  - Social proof for the next wave of users
  - Word-of-mouth language the marketing team cannot write
  - Real-world validation of each Mode's value proposition

Founders who know they are among the first 100 take pride in that
status. The feedback form must make that identity explicit and give
them a structured, dignified way to contribute — not a vague
"leave a review" prompt.

------------------------------------------------------------
FOUNDER ONBOARDING FLOW
------------------------------------------------------------
1. After a founder completes registration and first activation:
   - App or web confirmation screen displays:
     ┌──────────────────────────────────────────────────────┐
     │  You are Founder #[N]                                │
     │  LUME · DarkWave Studios LLC                         │
     │                                                      │
     │  Thank you for being one of the first 100.           │
     │  Your feedback shapes what LUME becomes.             │
     └──────────────────────────────────────────────────────┘
   - Founder number [N] is assigned sequentially from 1 to 100.
   - Founder number is stored on the user's account and displayed
     permanently in their profile: "Founder #[N]"
   - Founders numbered 1–100 only. After 100 registrations, the
     founder tier closes and standard pricing applies automatically.

2. The feedback form is presented immediately after the founder
   confirmation screen — not as a separate email, not as a later
   prompt. It is part of the onboarding flow.

3. The form is not mandatory. There is a clear "Skip for now"
   option. However, the form should feel like a privilege, not a
   chore: "You have something to say that nobody else can say yet."

------------------------------------------------------------
FOUNDER FEEDBACK FORM — THREE QUESTIONS
------------------------------------------------------------
All three questions use open text response boxes. No star ratings.
No multiple choice. The value is in the language they use, not a
score.

QUESTION 1:
  Label:   "What were you trying to fix or do?"
  Sub-text: "A sentence or two is plenty."
  Purpose:  Captures the use case in their words. This becomes the
            top-of-funnel acquisition language: "mechanics who need
            to do X" — described by someone who actually did X.

QUESTION 2:
  Label:   "What happened when you used it?"
  Sub-text: "Tell us what the experience was actually like."
  Purpose:  This is the testimonial. No coaching, no suggested
            language. Whatever they write is more credible than
            anything written for them. Store verbatim.

QUESTION 3:
  Label:   "What would you tell another mechanic or car owner
            about LUME?"
  Sub-text: "Imagine you're recommending it to someone you know."
  Purpose:  This is the word-of-mouth sentence. Forces distillation.
            A mechanic answering this question writes the copy that
            converts the next mechanic. This is the highest-value
            response of the three.

------------------------------------------------------------
BUILD REQUIREMENTS — FOUNDER FEEDBACK FORM
------------------------------------------------------------
API Endpoints (add to key-management route or create founder route):

  POST /api/founder/register
    Body:    { user_id, email, activation_timestamp }
    Returns: { founder_number: int, is_founder: boolean }
    Logic:   If total founder registrations < 100: assign next
             sequential number, store, return. If >= 100: return
             is_founder = false. Standard pricing flow applies.

  POST /api/founder/feedback
    Body:    {
               founder_number:  int,
               user_id:         string,
               question_1:      string,  -- "What were you trying to fix or do?"
               question_2:      string,  -- "What happened when you used it?"
               question_3:      string,  -- "What would you tell another mechanic...?"
               submitted_at:    ISO 8601 UTC,
               firmware_modes:  ["05" | "06"] -- which modes they actually used
             }
    Returns: { received: true, founder_number: int }
    Storage: Persist to database. Do not discard. Every response
             is retained permanently.

  GET /api/founder/responses
    Auth:    Admin only (API key gated — not public).
    Returns: Array of all submitted feedback responses, ordered
             by founder_number ascending.
    Purpose: Build team / founder (Jason) can pull and read all
             responses at any time without a database query.

  GET /api/founder/count
    Returns: { registered: int, remaining: int, founder_tier_open: boolean }
    Purpose: App can display "47 of 100 Founder spots remaining"
             on the registration/pricing page to create urgency.
             This is public — no auth required.

Data model — founder record:
  {
    "founder_number":    int,       -- 1 to 100, sequential
    "user_id":           string,
    "email":             string,
    "registered_at":     ISO 8601 UTC,
    "firmware_modes":    ["05", "06"],
    "feedback": {
      "question_1":      string | null,
      "question_2":      string | null,
      "question_3":      string | null,
      "submitted_at":    ISO 8601 UTC | null
    }
  }

UI Requirements (app and/or web):

  Founder confirmation screen:
    - Display founder number prominently: "You are Founder #[N]"
    - DarkWave Studios LLC branding
    - Brief statement: "Thank you for being one of the first 100.
      Your feedback shapes what LUME becomes."
    - CTA: "Share your experience" (proceeds to feedback form)
    - Secondary: "Skip for now" (stores feedback_submitted = false,
      can return to form from profile settings)

  Feedback form screen:
    - Header: "Founder #[N] — Your Experience"
    - Three labeled text boxes, each with sub-text as specified above
    - No character limits enforced (but suggest "a sentence or two")
    - Submit button: "Submit Feedback"
    - Responses are submitted to POST /api/founder/feedback
    - On success: brief confirmation — "Your response is in.
      Thank you, Founder #[N]."

  Pricing/registration page:
    - If founder_tier_open = true: display founder pricing ($10) and
      "Founder #[registered + 1] of 100 spots remaining"
    - If founder_tier_open = false: display standard pricing ($39.99)
      with no mention of the founder tier (clean transition)

------------------------------------------------------------
TONE REQUIREMENTS FOR ALL FOUNDER-FACING COPY
------------------------------------------------------------
  - Treat the founder as a contributor, not a customer doing a favor.
  - Never say "leave a review." The form is a contribution, not a
    review request.
  - Founder number is a badge of identity, not a gimmick. Treat it
    that way in all UI copy.
  - No pressure language. No "only X spots left" countdown timers.
    The GET /api/founder/count endpoint supplies the number —
    display it factually, not as manufactured urgency.
  - Consistent with the project-wide tone rule:
    "This doesn't replace anything. It wraps what already exists."
    The founder tier wraps the standard registration flow. It does
    not replace it.

------------------------------------------------------------
END OF HANDOFF — LUME MODE 06 REMOTE START FIRMWARE v1.0
------------------------------------------------------------
