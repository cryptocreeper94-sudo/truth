TITLE: LUME Mode 05 — Key Management Firmware Extension
VERSION: 2.0
AUTHOR: DarkWave Studios LLC
DATE: May 2026
STATUS: Build-ready directive. All sections are implementation requirements, not proposals.
COMPANION DOCUMENT: lume-dual-dongle-handoff-v1.1.md (read first — this document extends it)

------------------------------------------------------------
SCOPE — THREE DEPLOYMENT CONTEXTS
------------------------------------------------------------
This firmware extension serves three distinct deployment contexts.
All three share the same firmware, the same Mode 05 command set,
and the same hard constraints. They differ in:
  - Who the user is
  - Which ledger receives the anchor
  - How the firmware is delivered and licensed

CONTEXT A — MANHEIM / ENTERPRISE
  User:        Manheim technician, facility manager, or recon staff.
  Ledger:      Cox Automotive Ledger (CAL) — cox-automotive-ledger.onrender.com
  Delivery:    Firmware deployed to enterprise dongle fleet.
  Value:       Cryptographic key lifecycle governance on the lot.
               Key history lives in the Vehicle Asset Passport on CAL.
               First tamper-evident key audit trail in the Manheim ecosystem.

CONTEXT B — TRUST LAYER LEDGER (TLL) CONSUMER
  User:        Independent mechanic, small shop, or auto enthusiast.
  Ledger:      Trust Layer Ledger (TLL) — trust-layer.onrender.com
               TLL is the verification/ledger service within the
               Trust Layer ecosystem. Consumer records anchor here.
  Delivery:    Firmware sold as a digital product (see Section 12).
  Value:       TLL-verified key programming receipt tied to VIN.
               Portable, permanent proof of key history for the vehicle.
               Insurance, resale, and dispute documentation.

CONTEXT C — PRIVATE CONSUMER FIRMWARE SALES
  User:        Any customer who purchases the LUME firmware product.
               Includes mechanics, independent shops, and vehicle owners.
  Ledger:      TLL by default (consumer). CAL if enterprise license active.
  Delivery:    Firmware upload via WiFi or BLE OTA (see Section 12).
  Value:       Professional key management capability on existing
               OBD-II dongle hardware. No new hardware purchase required.

------------------------------------------------------------
SECTION 1 — OVERVIEW AND CONTEXT
------------------------------------------------------------
1. What This Is:
   - A firmware-only extension to the existing LUME diagnostic dongle
     (WiFi + BLE hardware already in customer's hands).
   - Adds immobilizer (IMMO) key management capability via the OBD-II
     CAN bus connection that the dongle already has.
   - No additional hardware is required on the dongle for this version.
   - The customer's phone handles transponder chip reading via NFC.
     The dongle handles vehicle-side IMMO programming via UDS over CAN.

2. What This Is Not:
   - NOT a 315 MHz / 433 MHz RF key cloner. Remote button functions
     (lock/unlock/panic) require RF hardware not present in the current
     dongle. Scoped to future hardware revision (see Section 8).
   - Does NOT conflict with the read-only hard constraint from the
     dual-dongle handoff. Key programming is a gated, authorized mode —
     not a background operation. The hard constraint on standard
     diagnostic modes is unchanged.

3. Why This Works Without New Hardware:
   - Modern vehicles (approx. 2005+) register new transponder keys
     through the Body Control Module (BCM) or dedicated IMMO module
     via the OBD-II diagnostic port.
   - The same CAN bus connection used for Modes 01–04 is the channel
     for IMMO programming sessions.
   - This is the same channel used by dealer-level scan tools
     (Autel, Launch, XTOOL). The dongle already has hardware access.

4. Architecture Split:
   - Phone (customer-owned): NFC reader → reads transponder chip type
     embedded in the physical key blank.
   - Dongle (firmware upload): UDS session over CAN/OBD-II → programs
     the vehicle's BCM/IMMO module to accept the new key credential.
   - App: orchestrates the handshake between phone NFC read and
     dongle OBD-II programming session.

5. Ledger Routing — Context-Aware Anchoring:
   - Enterprise (Context A): key programming events anchor to CAL.
   - Consumer (Contexts B and C): key programming events anchor to TLL.
   - The dongle firmware does not select the ledger. The app determines
     context based on the user's license tier and sends the ledger
     target in the authorization payload.
   - Firmware requires ledger_target field in every authorization
     payload before a Mode 05 write session opens.
   - Valid values: "CAL" | "TLL"
   - If ledger_target is missing: Mode 05 write blocked. App error.

------------------------------------------------------------
SECTION 2 — MODE 05 COMMAND SET
------------------------------------------------------------
Mode 05 is the key management mode. It is added alongside Modes
01, 02, 03, 04, 07, 09 already implemented in the LUME firmware.

Sub-commands:

  0x05A — Read IMMO Status
    Purpose:    Query current immobilizer state and registered key count.
    Direction:  Read-only. No write to vehicle. Available in all contexts.
    Returns:
      - immo_status: "ARMED" | "DISARMED" | "FAULT" | "UNKNOWN"
      - registered_key_count: int
      - max_key_slots: int
      - immo_module_id: string (if available via UDS 0x22)
      - security_level_required: "L1" | "L2" | "L3" (OEM-dependent)

  0x05B — Initiate Key Learning Session
    Purpose:    Open a UDS extended diagnostic session and perform
                security access handshake with the vehicle's IMMO module.
    Direction:  Write (gated — requires authorization, see Section 4).
    Steps:
      1. Receive and validate authorization payload from app via BLE.
         Payload must include: technician_id, vin_confirmed, ledger_target.
      2. Send DiagnosticSessionControl (0x10 03) — extended session.
      3. Send SecurityAccess seed request (0x27 01).
      4. Receive seed from vehicle.
      5. Forward seed to app via BLE for algorithm computation
         (algorithm lives in app/cloud layer — not in firmware).
      6. Receive computed key from app via BLE.
      7. Send SecurityAccess key response (0x27 02 [computed_key]).
      8. Confirm positive response (0x67 02) before proceeding.
      9. Hold session open. Signal app: vehicle ready for 0x05C.
    Timeout:    Session expires if 0x05C not received within 30 seconds.
                On timeout: send SessionControl (0x10 01) to return to
                default session. Log timeout event.

  0x05C — Register New Key Credential
    Purpose:    Write new transponder key credential to vehicle IMMO module.
    Direction:  Write (only permitted during an active 0x05B session).
    Requires:
      - Active security access session from 0x05B (not expired).
      - Transponder chip data from phone NFC read (passed via BLE).
    Steps:
      1. Receive transponder chip data payload from app via BLE.
      2. Hash chip payload immediately (SHA-256). Discard raw payload.
      3. Send WriteDataByIdentifier (0x2E) or OEM-equivalent IMMO
         write command with new key credential.
      4. Confirm positive response.
      5. Send RoutineControl (0x31) to finalize key learning if
         required by OEM procedure.
      6. Return to default diagnostic session (0x10 01).
      7. Generate key programming event record (see Section 6).
      8. Signal app to anchor record to ledger_target (CAL or TLL).

  0x05D — Delete Key Credential
    Purpose:    Remove a key credential from the vehicle IMMO module.
                Used for lost-key scenarios or decommissioning.
    Direction:  Write (gated — highest authorization level, see Section 4).
    Steps:
      1. Open extended session (0x10 03).
      2. Security access (0x27 01 / 0x27 02) — same as 0x05B.
      3. Send IMMO delete command (OEM-specific UDS PID).
      4. Confirm positive response.
      5. Generate delete event record (see Section 6).
      6. Signal app to anchor record to ledger_target.
    Note:       All-keys-lost (AKL) recovery procedure uses 0x05D
                to clear all credentials before 0x05C re-registers.
                AKL requires highest authorization level (Level C).

------------------------------------------------------------
SECTION 3 — UDS PROTOCOL REQUIREMENTS
------------------------------------------------------------
1. Diagnostic Session Levels:
   - Default session (0x10 01): standard OBD queries — Modes 01–04,
     07, 09. No IMMO access.
   - Extended diagnostic session (0x10 03): required for IMMO
     read/write operations (Mode 05).
   - Programming session (0x10 02): NOT used. Must not be implemented.

2. Security Access (0x27):
   - Level 0x01/0x02: standard extended session security.
     Used for 0x05A, 0x05B, 0x05C.
   - Level 0x03/0x04 or higher: elevated security for AKL procedures.
     Used for 0x05D only.
   - Seed/key algorithm is OEM-specific. See Section 5.
   - Algorithm computation happens in the app/cloud layer — NOT in
     the dongle firmware. Dongle sends seed to app, receives computed
     key back via BLE.

3. Session Keep-Alive:
   - While Mode 05 session is open: send TesterPresent (0x3E 00)
     every 2 seconds.
   - If BLE connection drops during active session: stop TesterPresent
     immediately. Allow vehicle session to timeout naturally.
     Do not hold session open without app connection.

4. Error Handling:
   - NRC 0x22 (conditionsNotCorrect): Log and report. Most common cause:
     ignition position wrong. App prompt: "Check ignition position per
     your vehicle's key programming procedure."
   - NRC 0x35 (invalidKey): Security access failed. After 3 consecutive
     failures: 60-second lockout. Log lockout event with context.
   - NRC 0x37 (requiredTimeDelayNotExpired): Enforce OEM delay. No retry.
   - All NRCs reported to app as plain-language descriptions.
     Raw hex codes must not surface to the user.

5. ISO Compliance:
   - ISO 14229-1 (UDS) — all diagnostic communication.
   - ISO 15765-2 (CAN transport) — all CAN framing.
   - CAN listen-before-talk (500ms window) from dual-dongle handoff
     Section 3 applies in Mode 05 sessions.

------------------------------------------------------------
SECTION 4 — AUTHORIZATION GATES
------------------------------------------------------------
Mode 05 is gated. Firmware must not accept Mode 05 write commands
without a verified authorization payload from the app.

Authorization payload (sent via BLE before 0x05B initiates):
  {
    "mode":           "05B" | "05D",
    "technician_id":  "string — required, non-null",
    "vin_confirmed":  "string — 17-char VIN confirmed by user in app",
    "ledger_target":  "CAL" | "TLL",
    "level":          "B" | "C",
    "reason_code":    "string | null — required for Level C"
  }

  Level A — Read (0x05A):
    - Requires active BLE session with authenticated LUME app.
    - No authorization payload required. Read-only.

  Level B — Standard Key Programming (0x05B + 0x05C):
    - Authorization payload required before session opens.
    - technician_id required and non-null.
    - vin_confirmed must match VIN read by dongle via Mode 09 PID 0x02.
      If VIN mismatch: session blocked. App error: "VIN mismatch.
      Confirm you are connected to the correct vehicle."
    - In-app confirmation required: "Program new key for VIN [last 6]?
      This action will be permanently recorded on [CAL / TLL]."
    - Consumer context (TLL): confirmation reads "This event will be
      recorded to your vehicle's permanent key history."

  Level C — Delete / AKL (0x05D):
    - All Level B requirements, plus:
    - User must type last six characters of VIN in app to confirm.
    - reason_code required: "LOST_KEY" | "STOLEN_KEY" |
      "DECOMMISSION" | "OTHER"
    - Destructive operation. Extra friction is intentional.
    - In-app warning: "This will remove a key from this vehicle's
      immobilizer. This action is permanent and will be recorded."

------------------------------------------------------------
SECTION 5 — SEED/KEY ALGORITHM SOURCING
------------------------------------------------------------
1. The Requirement:
   UDS security access (0x27 02) requires a key derived from the
   vehicle's seed using an OEM-specific algorithm. Not standardized.
   Must be sourced legitimately before Mode 05 can serve any OEM.

2. Approved Path — NASTF SDRM:
   - National Automotive Service Task Force — Security Information
     Access portal (nastf.org).
   - Registration: business verification, background check,
     annual fee (~$150/year as of 2026).
   - Provides documented access to OEM security procedures including
     IMMO programming sequences and seed/key algorithms.
   - This is the clean compliance path for all three deployment contexts.

3. Recommended Architecture — Licensed Algorithm API (B2B):
   - Advanced Diagnostics, Ilco, KeyDIY B2B division.
   - Integration model:
     dongle reads seed → sends to app via BLE →
     app POSTs seed + OEM identifier to licensed API →
     API returns computed key →
     app sends key to dongle via BLE →
     dongle sends to vehicle (0x27 02)
   - Algorithm never touches dongle firmware. Updates are seamless.
     Compliance lives in the software/API layer.
   - This is the correct architecture for a firmware product that is
     continuously sold and updated.

4. OEM Coverage Priority:
   - Priority 1: Ford, GM, Chrysler/Stellantis
     (highest Manheim lot volume + highest consumer aftermarket volume)
   - Priority 2: Toyota, Honda, Nissan
   - Priority 3: BMW, Mercedes, Volkswagen Group
   - OEM identifier is a required field. Coverage expands without
     firmware changes.

5. Unsupported OEM:
   - Return clear error to app: "Key programming not yet supported
     for this vehicle. Supported makes: [list]."
   - Do not attempt generic IMMO commands on unsupported OEMs.

------------------------------------------------------------
SECTION 6 — DATA MODEL — KEY MANAGEMENT RECORDS
------------------------------------------------------------
The same record schema is used across all three contexts.
The ledger_target field routes the anchor to CAL or TLL.

1. Key Programming Event Record:
   {
     "record_type":         "key_programming_event",
     "timestamp":           "ISO 8601 UTC",
     "event":               "key_registered" | "key_deleted" | "session_opened" | "session_timeout" | "security_lockout",
     "vin":                 "string — 17-character VIN, verified via Mode 09",
     "dongle_id":           "string — unique hardware identifier",
     "user_id":             "string — technician_id (enterprise) or consumer account ID (consumer)",
     "context":             "ENTERPRISE" | "CONSUMER",
     "ledger_target":       "CAL" | "TLL",
     "oem_identifier":      "string (e.g., FORD, GM, TOYOTA)",
     "key_slot_index":      int | null,
     "transponder_type":    "string | null (e.g., Hitag2, DST80, Megamos48)",
     "chip_data_hash":      "string — SHA-256 of transponder chip payload",
     "security_level":      "A" | "B" | "C",
     "reason_code":         "string | null (required for Level C)",
     "session_duration_ms": int,
     "result":              "SUCCESS" | "FAILURE" | "TIMEOUT" | "LOCKOUT",
     "failure_nrc":         "string | null",
     "cal_anchor_hash":     "string | null (populated if ledger_target = CAL)",
     "tll_anchor_hash":     "string | null (populated if ledger_target = TLL)"
   }

2. Enterprise Anchoring (Context A — CAL):
   - Endpoint: POST /api/submit/arbitration
     (reuse existing endpoint — key events are provenance records)
   - cal_anchor_hash populated from response before success shown to user.
   - Record appended to Vehicle Asset Passport key_history array.

3. Consumer Anchoring (Contexts B and C — TLL):
   - Endpoint: POST to TLL service at trust-layer.onrender.com
   - tll_anchor_hash populated from TLL response before success shown.
   - Consumer receives a TLL-verified key programming receipt (see below).
   - Receipt is accessible via the LUME app under "My Key History."

4. TLL-Verified Key Programming Receipt (consumer-facing):
   This receipt is the consumer value prop for Contexts B and C.
   It must be generated after every successful key registration and
   displayed prominently in the app.

   Display format:
   ┌─────────────────────────────────────────────────┐
   │  KEY PROGRAMMING RECEIPT                        │
   │  Vehicle:  [YMM from VIN decode] · [last 6 VIN] │
   │  Event:    New key registered                   │
   │  Date:     [human-readable timestamp]           │
   │  Status:   TLL-VERIFIED ✓                       │
   │  Receipt:  [first 12 chars of tll_anchor_hash]  │
   └─────────────────────────────────────────────────┘

   - The receipt is permanently stored on TLL.
   - The consumer can share this receipt as proof during insurance
     claims, vehicle sales, or dealer disputes.
   - "TLL-VERIFIED" is the Trust Layer Ledger verification stamp —
     part of the Trust Layer ecosystem — confirming the event record
     is tamper-evident and publicly verifiable.

5. Asset Passport Extension (Enterprise — Context A):
   - /api/passport/:vin on CAL must include key_history array.
   - Access follows "Verified but Private" tiers:
     Facility managers → their facility only
     Corporate → aggregate view
     Employees → only records that affect them
     External → zero exposure

6. Consumer Key History (Contexts B and C):
   - LUME app "My Key History" screen shows all TLL-anchored key
     events for vehicles the consumer has worked on.
   - Each event shows: VIN (last 6), date, result, TLL receipt hash.
   - Consumer can export receipt as PDF or share via link.

------------------------------------------------------------
SECTION 7 — HARD CONSTRAINTS
------------------------------------------------------------
These constraints are absolute. Firmware requirements.
Application layer cannot override them.

HC-K1: VIN Verification Before Any Write
  - Mode 05 write commands blocked until dongle reads VIN via Mode 09
    PID 0x02 and receives vin_confirmed in authorization payload.
  - vin_confirmed must match the VIN the dongle reads from the vehicle.
  - If VIN unreadable: Mode 05 writes unavailable.
    App: "VIN unreadable. Key programming unavailable."
  - Applies in all three contexts.

HC-K2: No Programming Session
  - UDS programming session (0x10 02) not implemented.
  - Not a conditional block — must not exist in the firmware.

HC-K3: Session Isolation
  - Mode 05 session cannot be open simultaneously with any other mode.
  - Modes 01–04 active → Mode 05 blocked.
  - Mode 05 active → Modes 01–04 suspended.

HC-K4: BLE Connection Required
  - Mode 05 cannot operate unattended. Live BLE connection to
    authenticated app required for all Mode 05 operations.
  - BLE drops during active session: stop TesterPresent immediately,
    allow vehicle session to expire, log interruption.

HC-K5: Chip Data Never Stored in Raw Form
  - Transponder chip payload hashed (SHA-256) immediately on receipt.
  - Raw payload never written to dongle flash.
  - Only the hash is stored in the event record.

HC-K6: Ledger Target Required
  - ledger_target ("CAL" | "TLL") must be present in the authorization
    payload before any Mode 05 write session opens.
  - Missing ledger_target: session blocked.
  - Firmware does not select the ledger. App selects based on context.

------------------------------------------------------------
SECTION 8 — FUTURE HARDWARE EXPANSION PATH
------------------------------------------------------------
Informational. No build action required now. Firmware architecture
must be forward-compatible with these additions.

  Module A: Sub-1 GHz RF (CC1101 or Si4463)
    Frequency:  315 MHz (North America), 433.92 MHz (Europe)
    Purpose:    Remote button programming (lock/unlock/panic sync)
    Mode:       0x05E — Remote Sync
    Note:       Does not change the UDS/IMMO architecture above.
                Adds a parallel RF channel for remote buttons only.

  Module B: LF RFID (125 kHz)
    Component:  EM4305 writer or equivalent
    Purpose:    Legacy transponder chip writing for key blanks that
                require hardware LF write (older Hitag2, Megamos 48,
                Texas DST40 without OBD-II IMMO)
    Mode:       0x05F — LF Transponder Write

  Module C: NFC 13.56 MHz (PN532 or equivalent)
    Purpose:    Smart key / proximity fob (BMW, Mercedes UHF formats)
    Note:       Currently handled by phone NFC. Onboard module
                eliminates phone NFC dependency for consumer users.

Firmware namespace requirement:
  - Sub-command namespace 0x05A–0x05D reserved for current firmware.
  - 0x05E and 0x05F reserved for hardware-assisted modes.
  - Data model fields (OEM identifier, chip type, transponder data,
    ledger_target) already structured for hardware-assisted expansion.
  - When RF hardware is present: both CAL and TLL anchoring continue
    unchanged. Only the Mode 05 sub-command expands.

------------------------------------------------------------
SECTION 9 — COMPLIANCE AND LEGAL
------------------------------------------------------------
1. Locksmith Licensing:
   - LUME is a professional diagnostic tool. The operator (mechanic,
     shop, or owner) bears state licensing obligations where applicable.
   - DarkWave Studios LLC does not hold a locksmith license.
     Not required to manufacture or sell professional diagnostic tooling.
   - Consistent with industry precedent: Snap-on, Autel, Launch, XTOOL.

2. Consumer Context Framing:
   - In consumer-facing materials, Mode 05 is a "key management" feature,
     not a "locksmith tool" and not a "key hacker."
   - Lead with the receipt and audit trail. "Your key programming is
     permanently recorded on the Trust Layer Ledger. You have proof."
   - For enterprise: "Every key event on your lot is cryptographically
     anchored. Disputes have answers."

3. FCC:
   - Current firmware-only dongle: no new FCC requirements.
   - RF hardware additions (Section 8): FCC Part 15 certification
     required for 315/433 MHz transmitter. Budget 8–12 weeks, $5–15k.

4. NASTF:
   - Algorithm sourcing must use NASTF SDRM or a licensed B2B provider.
   - Build agent must not use algorithms from reverse-engineered or
     unlicensed sources.

------------------------------------------------------------
SECTION 10 — TRUST LAYER LEDGER (TLL) INTEGRATION
------------------------------------------------------------
TLL is the verification/ledger service within the Trust Layer
ecosystem. It handles hashing, sealing, hallmark stamping, and
public verification of consumer records.

1. TLL Endpoint:
   - Base URL: trust-layer.onrender.com
   - POST /api/submit — submit key programming event for anchoring
   - GET /api/verify/:hash — public verification of any anchored record
   - Response includes: tll_anchor_hash, timestamp, seal_status

2. TLL Anchoring Flow:
   a. App receives key programming event record from dongle via BLE.
   b. App serializes record deterministically (sorted keys, no whitespace).
   c. App computes SHA-256 of serialized record.
   d. App POSTs record + hash to TLL.
   e. TLL seals the record, returns tll_anchor_hash.
   f. App stores tll_anchor_hash in local record.
   g. App displays TLL-verified receipt to consumer.
   h. App shows success screen only after tll_anchor_hash is received.

3. TLL Offline Handling:
   - If TLL is unreachable: compute and display hash locally.
   - Display: "HASH COMPUTED · PENDING TLL SEAL"
   - Retry TLL POST when connectivity restores (background queue).
   - Consumer still gets their hash immediately — verification
     stamp follows when TLL is reachable.
   - This mirrors the CAL offline handling in the main arbitration flow.

4. Consumer Identity on TLL:
   - Consumer records are associated with the consumer's account ID
     (Trust Layer SSO — the identity layer of the Trust Layer ecosystem).
   - Trust Layer SSO handles authentication. TLL handles verification.
     These are separate services within the Trust Layer platform.
   - The consumer's identity is never written to the TLL record in
     plaintext. Only a hashed user identifier is included.

5. Public Verification:
   - Any tll_anchor_hash is publicly verifiable at:
     trust-layer.onrender.com/verify/[hash]
   - The verification page shows: timestamp, event type, VIN last 6,
     seal status. Does not expose PII or raw chip data.
   - This is the URL the consumer shares as proof.

------------------------------------------------------------
SECTION 11 — CONSUMER FIRMWARE DISTRIBUTION MODEL
------------------------------------------------------------
Jason is currently selling firmware uploads, not hardware.
Customers have the dongle hardware. They purchase the firmware
as a digital product and upload it to their existing dongle.

1. What Is Being Sold:
   - Firmware upgrade file(s) enabling Mode 05 on the existing
     LUME dongle (WiFi + BLE hardware).
   - Sold as: one-time purchase, per-feature tier unlock, or
     subscription (see Item 3 for tier options).
   - The consumer already owns the dongle hardware.
   - The firmware extends what that hardware can do.

2. Firmware Delivery — Two Methods:

   Method A: OTA via WiFi
     - Consumer purchases firmware upgrade through the LUME app or
       DarkWave Studios storefront.
     - App triggers dongle to enter update mode via BLE command.
     - Dongle connects to DarkWave firmware CDN via its WiFi radio.
     - Firmware file downloaded and flashed directly to dongle.
     - App monitors flash progress via BLE status messages.
     - On success: dongle reboots, app confirms new firmware version.

   Method B: OTA via BLE (fallback — no WiFi available)
     - App downloads firmware file to phone via cellular/WiFi.
     - App pushes firmware to dongle via BLE in chunked packets.
     - Slower than Method A but viable for customers without WiFi.
     - Progress indicator required. Estimated time displayed.
     - Chunk size: 512 bytes recommended for BLE 5.0 reliability.

3. License Tiers (recommended structure):

   Tier 1 — Diagnostics (base, existing)
     Modes: 01, 02, 03, 04, 07, 09
     Ledger: none (or TLL for basic condition hashing)
     Price: existing product price

   Tier 2 — Key Management (Mode 05 unlock)
     Modes: all Tier 1 + Mode 05 (0x05A, 0x05B, 0x05C, 0x05D)
     Ledger: TLL anchoring included
     Price: one-time firmware upgrade fee OR monthly subscription
     Includes: TLL-verified receipts, My Key History in app

   Tier 3 — Enterprise (Manheim / fleet)
     Modes: all Tier 2
     Ledger: CAL anchoring
     Includes: Vehicle Asset Passport, employee audit trail, CAL
     Price: enterprise contract

4. License Enforcement:
   - License is tied to dongle hardware ID (unique hardware identifier
     already required by dual-dongle handoff data model).
   - On firmware boot: dongle sends hardware ID to license validation
     endpoint. Response confirms active tier.
   - If license is not active for Mode 05: 0x05B and 0x05D return
     error to app. 0x05A (read-only status check) remains available
     at all tiers — it is diagnostic utility, not a gated feature.
   - License validation happens over WiFi at boot. If offline:
     cached license state valid for 72 hours before re-validation
     required. This prevents failures in low-connectivity environments.

5. Firmware Versioning:
   - Version format: MAJOR.MINOR.PATCH (e.g., 2.1.0)
   - MAJOR: breaking changes to Mode command set or data schema.
   - MINOR: new OEM coverage, new Mode 05 sub-commands, TLL/CAL
     endpoint updates.
   - PATCH: bug fixes, error message improvements, stability.
   - App checks firmware version on BLE connect. If outdated:
     in-app prompt to update. Never forced — customer initiates.
   - Firmware version included in every key programming event record
     for auditability.

6. Consumer Onboarding Flow:
   a. Customer purchases firmware upgrade (app or web store).
   b. LUME app prompts: "Update your dongle to unlock Key Management."
   c. Customer plugs dongle into OBD-II port (or powers it via USB
      for update — must not require vehicle connection for OTA).
   d. App connects to dongle via BLE.
   e. App triggers OTA update (Method A preferred, Method B fallback).
   f. Dongle flashes and reboots (estimated 60–90 seconds).
   g. App confirms: "Key Management unlocked. Mode 05 active."
   h. App explains the NFC flow briefly: "To program a key, plug in
      your dongle, hold your key blank near your phone, and tap
      'Program Key' in the app."

------------------------------------------------------------
SECTION 12 — IMPLEMENTATION REQUIREMENTS SUMMARY
------------------------------------------------------------
Firmware:
  - Add Mode 05 (0x05A, 0x05B, 0x05C, 0x05D) to LUME command set
  - UDS extended session (0x10 03) implementation
  - Security access handler (0x27 01) — seed read and forward to app
  - Security access sender (0x27 02) — computed key received from app
  - TesterPresent keep-alive (0x3E 00) at 2-second interval
  - Session timeout handler (30s for pending 0x05C)
  - All six Hard Constraints (HC-K1 through HC-K6) at firmware level
  - Security lockout after 3 NRC 0x35 failures (60s)
  - OTA update mode: WiFi flash (Method A) + BLE chunked (Method B)
  - License validation at boot via WiFi endpoint
  - Firmware version field in every Mode 05 event record

App:
  - Phone NFC read flow for transponder chip identification
  - VIN confirmation screen before Mode 05 write sessions
  - Authorization payload construction and BLE send (all required fields)
  - ledger_target set from user's license tier (CAL or TLL)
  - Seed/key algorithm computation: forward seed to licensed API,
    receive computed key, send to dongle
  - Level C (delete) confirmation: last-six-VIN re-entry + reason code
  - Session progress UI: open → secured → programming → confirmed
  - Plain-language NRC error display (no raw hex)
  - TLL anchor confirmation before success screen (consumer)
  - CAL anchor confirmation before success screen (enterprise)
  - TLL-verified receipt display with share/export (consumer)
  - "My Key History" screen: all TLL-anchored events, VIN, date, hash
  - OTA firmware update flow (Methods A and B) with progress indicator
  - License tier display and upgrade prompt

CAL (Enterprise — Context A):
  - key_history array added to Vehicle Asset Passport schema
  - Key programming event record posted to POST /api/submit/arbitration
  - cal_anchor_hash stored before success shown
  - Access tier: facility managers / corporate / employee / external

TLL (Consumer — Contexts B and C):
  - POST to TLL service at trust-layer.onrender.com
  - tll_anchor_hash stored before success shown
  - TLL-verified receipt generated with public verification URL
  - Offline queue: retry TLL POST on connectivity restore
  - Consumer identity as hashed ID — no plaintext PII in TLL record

Algorithm Layer:
  - Seed/key computation via licensed B2B API (not in firmware)
  - OEM identifier required — no generic fallback
  - Unsupported OEM: clear error returned to app

------------------------------------------------------------
END OF HANDOFF — LUME MODE 05 KEY MANAGEMENT FIRMWARE v2.0
------------------------------------------------------------
