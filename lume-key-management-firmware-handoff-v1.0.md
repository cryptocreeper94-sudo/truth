TITLE: LUME Mode 05 — Key Management Firmware Extension
VERSION: 1.0
AUTHOR: DarkWave Studios LLC
DATE: May 2026
STATUS: Build-ready directive. All sections are implementation requirements, not proposals.
COMPANION DOCUMENT: lume-dual-dongle-handoff-v1.1.md (read first — this document extends it)

------------------------------------------------------------
SECTION 1 — OVERVIEW AND CONTEXT
------------------------------------------------------------
1. What This Is:
   - A firmware-only extension to the existing LUME diagnostic dongle.
   - Adds immobilizer (IMMO) key management capability via the OBD-II
     CAN bus connection that the dongle already has.
   - No additional hardware is required on the dongle for this version.
   - The customer's phone handles transponder chip reading via NFC.
     The dongle handles vehicle-side IMMO programming via UDS over CAN.

2. What This Is Not:
   - This is NOT a 315 MHz / 433 MHz RF key cloner. Remote button
     functions (lock/unlock/panic) require RF hardware not present
     in the current dongle. That capability is scoped to a future
     hardware revision (see Section 8).
   - This does NOT conflict with the read-only hard constraint defined
     in the dual-dongle handoff. Key programming is a gated,
     authorized mode — not a background operation. The hard constraint
     on standard diagnostic modes is unchanged.

3. Why This Works Without New Hardware:
   - Modern vehicles (approx. 2005+) register new transponder keys
     through the Body Control Module (BCM) or dedicated IMMO module
     via the OBD-II diagnostic port.
   - The same CAN bus connection used for Modes 01–04 is the channel
     for IMMO programming sessions.
   - This is the same channel used by dealer-level scan tools
     (Autel, Launch, XTOOL). The dongle already has hardware access
     to it.

4. Architecture Split:
   - Phone (customer-owned): NFC reader → reads transponder chip type
     embedded in the physical key blank.
   - Dongle (firmware upload): UDS session over CAN/OBD-II → programs
     the vehicle's BCM/IMMO module to accept the new key credential.
   - App: orchestrates the handshake between phone NFC read and
     dongle OBD-II programming session.

5. CAL Integration:
   - Every key programming event is cryptographically anchored to the
     Cox Automotive Ledger (CAL).
   - Key programming receipts are signed, hashed, and attached to
     the vehicle's Asset Passport on CAL.
   - This creates an auditable, tamper-evident key lifecycle history
     that does not currently exist anywhere in the Manheim ecosystem.

------------------------------------------------------------
SECTION 2 — MODE 05 COMMAND SET
------------------------------------------------------------
Mode 05 is the key management mode. It is added alongside Modes
01, 02, 03, 04, 07, 09 already implemented in the LUME firmware.

Sub-commands:

  0x05A — Read IMMO Status
    Purpose:    Query current immobilizer state and registered key count.
    Direction:  Read-only. No write to vehicle.
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
      1. Send DiagnosticSessionControl (0x10 03) — extended session.
      2. Send SecurityAccess seed request (0x27 01).
      3. Receive seed from vehicle.
      4. Compute key from seed using OEM algorithm (see Section 5).
      5. Send SecurityAccess key response (0x27 02 [computed_key]).
      6. Confirm positive response (0x67 02) before proceeding.
      7. Hold session open. Signal app that vehicle is ready for
         key registration (0x05C).
    Timeout:    Session expires if 0x05C not received within 30 seconds.
                On timeout: send SessionControl (0x10 01) to return to
                default session. Log timeout event.

  0x05C — Register New Key Credential
    Purpose:    Write new transponder key credential to vehicle IMMO module.
    Direction:  Write (only permitted during an active 0x05B session).
    Requires:
      - Active security access session from 0x05B (not expired).
      - Transponder chip data from phone NFC read (passed via BLE
        from app to dongle).
    Steps:
      1. Receive transponder chip data payload from app via BLE.
      2. Send WriteDataByIdentifier (0x2E) or OEM-equivalent IMMO
         write command with new key credential.
      3. Confirm positive response.
      4. Send RoutineControl (0x31) to finalize key learning if
         required by OEM procedure.
      5. Return to default diagnostic session (0x10 01).
      6. Generate key programming event record (see Section 6).
      7. Anchor record to CAL.

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
      6. Anchor record to CAL.
    Note:       All-keys-lost (AKL) recovery procedure uses 0x05D
                to clear all credentials before 0x05C re-registers
                new keys. AKL requires highest authorization level.

------------------------------------------------------------
SECTION 3 — UDS PROTOCOL REQUIREMENTS
------------------------------------------------------------
1. Diagnostic Session Levels:
   - Default session (0x10 01): standard OBD queries — Modes 01–04,
     07, 09. No IMMO access.
   - Extended diagnostic session (0x10 03): required for IMMO
     read/write operations (Mode 05).
   - Programming session (0x10 02): not used by LUME firmware.
     Build agent must not implement programming session access.

2. Security Access (0x27):
   - Level 0x01/0x02: standard extended session security.
     Used for 0x05A, 0x05B, 0x05C.
   - Level 0x03/0x04 or higher: elevated security for AKL procedures.
     Used for 0x05D only.
   - The seed/key algorithm is OEM-specific. See Section 5 for
     algorithm sourcing requirements.

3. Session Keep-Alive:
   - While a Mode 05 session is open, firmware must send
     TesterPresent (0x3E 00) every 2 seconds to prevent session timeout.
   - If BLE connection to app is lost during an active session:
     stop TesterPresent immediately, allow session to timeout naturally.
     Do not hold session open without app connection.

4. Error Handling:
   - Negative Response Code (NRC) 0x22 (conditionsNotCorrect):
     Log and report to app. Common cause: ignition state mismatch.
     Prompt technician to confirm ignition is in correct position
     per OEM procedure.
   - NRC 0x35 (invalidKey): Security access failed. Log attempt.
     After 3 consecutive failures: lock out Mode 05 for 60 seconds.
     Log lockout event.
   - NRC 0x37 (requiredTimeDelayNotExpired): Enforce OEM-specified
     delay before retry. Do not retry immediately.
   - All NRCs must be reported to the app with plain-language
     description. Do not surface raw hex codes to the technician UI.

5. ISO Compliance:
   - All UDS communication must comply with ISO 14229-1.
   - CAN transport layer must comply with ISO 15765-2.
   - CAN listen-before-talk requirement from dual-dongle handoff
     Section 3 applies in Mode 05 sessions as well.

------------------------------------------------------------
SECTION 4 — AUTHORIZATION GATES
------------------------------------------------------------
Mode 05 is a gated mode. The firmware must not accept Mode 05
commands without verified authorization. Three authorization levels:

  Level A — Read (0x05A):
    - Requires active BLE session with authenticated LUME app.
    - No additional gate. Read-only, no risk.

  Level B — Standard Key Programming (0x05B + 0x05C):
    - Requires active BLE session with authenticated LUME app.
    - Requires technician ID (must be provided by app — not optional).
    - Requires explicit in-app confirmation: "Program new key for
      [VIN]? This action will be permanently recorded."
    - Requires vehicle VIN confirmation: dongle reads VIN via Mode 09
      PID 0x02 and app must confirm VIN matches expected vehicle before
      session opens.
    - Confirmation must be received by dongle via BLE before 0x05B
      initiates. Not a UI-only gate — the dongle waits for the
      authorization payload.

  Level C — Delete / AKL (0x05D):
    - All Level B requirements, plus:
    - Requires secondary confirmation: technician must type the last
      six characters of the VIN in the app to confirm intent.
    - This is a destructive operation. Extra friction is intentional.
    - Log includes full technician ID, timestamp, VIN, and reason
      code selected by technician from: "LOST_KEY" | "STOLEN_KEY" |
      "DECOMMISSION" | "OTHER".

------------------------------------------------------------
SECTION 5 — SEED/KEY ALGORITHM SOURCING
------------------------------------------------------------
1. The Requirement:
   The UDS security access response (0x27 02) requires a key derived
   from the vehicle's seed using an OEM-specific algorithm. This
   algorithm is not standardized across manufacturers. It must be
   sourced before Mode 05 can be implemented for any given OEM.

2. Approved Sourcing Path — NASTF SDRM:
   - National Automotive Service Task Force — Security Information
     Access portal (nastf.org).
   - Registration required: business verification, background check,
     annual fee (~$150/year as of 2026).
   - Provides legitimate, documented access to OEM security procedures
     including IMMO programming sequences and seed/key algorithms for
     independent repair facilities.
   - This is the clean compliance path. Build agent must not source
     algorithms from reverse-engineered or unlicensed databases.

3. Alternative — Licensed Algorithm API:
   - Several B2B providers offer licensed IMMO algorithm libraries
     (Advanced Diagnostics, Ilco, KeyDIY B2B division).
   - Integration model: app sends seed + OEM identifier to licensed
     API endpoint → API returns computed key → app forwards to dongle
     via BLE → dongle sends to vehicle.
   - This keeps the algorithm off the dongle entirely. The dongle
     receives the computed key; it never computes it locally.
   - Recommended architecture for the firmware product: algorithm
     computation lives in the cloud/app layer, not in dongle firmware.
     This simplifies firmware, makes algorithm updates seamless, and
     keeps NASTF compliance in the software layer.

4. OEM Coverage Priority (suggested order by Manheim lot volume):
   - Priority 1: Ford, GM, Chrysler/Stellantis (highest NA auction volume)
   - Priority 2: Toyota, Honda, Nissan
   - Priority 3: BMW, Mercedes, Volkswagen Group
   - Build agent should implement OEM identifier as a required field
     so coverage can be expanded incrementally without firmware changes.

5. Unsupported OEM Behavior:
   - If OEM is not in the supported list, Mode 05 must return a clear
     error to the app: "Key programming not yet supported for this
     vehicle. Supported makes: [list]."
   - Do not attempt generic IMMO commands on unsupported OEMs.
     The result is unpredictable and potentially damaging to the
     vehicle's security system.

------------------------------------------------------------
SECTION 6 — DATA MODEL — KEY MANAGEMENT RECORDS
------------------------------------------------------------
All key management events generate a record anchored to CAL and
attached to the vehicle's Asset Passport.

1. Key Programming Event Record:
   {
     "record_type":        "key_programming_event",
     "timestamp":          "ISO 8601 UTC",
     "event":              "key_registered" | "key_deleted" | "session_opened" | "session_timeout" | "security_lockout",
     "vin":                "string — 17-character VIN, verified via Mode 09",
     "dongle_id":          "string",
     "technician_id":      "string — required, non-null for all write events",
     "oem_identifier":     "string (e.g., FORD, GM, TOYOTA)",
     "key_slot_index":     int | null,
     "transponder_type":   "string | null (e.g., Hitag2, DST80, Megamos48)",
     "chip_data_hash":     "string — SHA-256 of transponder chip payload, not the raw data",
     "security_level":     "A" | "B" | "C",
     "reason_code":        "string | null (required for Level C delete events)",
     "session_duration_ms":int,
     "result":             "SUCCESS" | "FAILURE" | "TIMEOUT" | "LOCKOUT",
     "failure_nrc":        "string | null (UDS NRC code on failure)",
     "cal_anchor_hash":    "string | null (populated after CAL POST)"
   }

2. CAL Submission:
   - Endpoint: POST /api/submit/arbitration (reuse existing endpoint —
     key programming events are an integrity/provenance record class)
   - On successful key registration or deletion: submit record
     immediately, before app shows success screen to technician.
   - cal_anchor_hash is populated from CAL response and stored in
     the local record.

3. Asset Passport Extension:
   - The vehicle's Asset Passport (/api/passport/:vin) must include
     a key_history array.
   - Each key programming event record (summarized) is appended to
     key_history on CAL.
   - key_history is visible to facility managers and corporate users
     per the "Verified but Private" access tier model.
   - key_history is NOT visible to external parties.

------------------------------------------------------------
SECTION 7 — HARD CONSTRAINTS
------------------------------------------------------------
These constraints are absolute. They are firmware requirements,
not application-layer suggestions.

HC-K1: VIN Verification Before Any Write
  - Mode 05 write commands (0x05B, 0x05C, 0x05D) are blocked until
    dongle reads VIN via Mode 09 PID 0x02 and receives VIN
    confirmation payload from app.
  - If VIN cannot be read: Mode 05 write commands are unavailable.
    App must display: "VIN unreadable. Key programming unavailable."

HC-K2: No Programming Session
  - UDS programming session (0x10 02) is architecturally unavailable
    in LUME firmware. This is not a conditional block — it must not
    be implemented.

HC-K3: Session Isolation
  - A Mode 05 session cannot be open simultaneously with any other
    active OBD mode.
  - If Modes 01–04 are actively streaming, Mode 05 cannot initiate.
  - If Mode 05 is active, Modes 01–04 queries are suspended.

HC-K4: BLE Connection Required
  - Mode 05 cannot operate in vehicle-carried mode (background/
    unattended). A live BLE connection to an authenticated app is
    required for all Mode 05 operations.
  - If BLE drops during an active Mode 05 session: immediately
    terminate TesterPresent, allow vehicle session to expire, log
    the interruption event.

HC-K5: Chip Data Never Stored in Raw Form
  - Transponder chip payload received from phone NFC must be hashed
    (SHA-256) immediately upon receipt.
  - The raw chip payload must not be written to dongle flash.
  - Only the hash is stored in the key programming event record.

------------------------------------------------------------
SECTION 8 — FUTURE HARDWARE EXPANSION PATH
------------------------------------------------------------
This section is informational. It does not require build action now.
It is included so the build agent understands the firmware
architecture must be forward-compatible with these additions.

When hardware manufacturing begins, the following RF modules will
be added to the dongle PCB:

  Module A: Sub-1 GHz RF (CC1101 or Si4463)
    - Frequency: 315 MHz (North America), 433.92 MHz (Europe/Asia)
    - Purpose: Remote button programming (lock/unlock/panic sync)
    - Firmware addition: Mode 05E — Remote Sync
    - This does not change the UDS/IMMO architecture above.
      It adds a parallel RF channel for the remote button side only.

  Module B: LF RFID (125 kHz)
    - Component: EM4305 writer or equivalent
    - Purpose: Legacy transponder chip writing (for key blanks that
      require hardware LF write, not just OBD-II credential registration)
    - Covers: older Hitag2, Megamos 48, Texas DST40 without OBD-II IMMO
    - Firmware addition: Mode 05F — LF Transponder Write

  Module C: NFC 13.56 MHz (PN532 or equivalent)
    - Purpose: Smart key / proximity fob support
    - Covers: newer BMW, Mercedes UHF smart key formats
    - Currently handled by phone NFC (sufficient for most use cases)
    - Onboard module eliminates phone NFC dependency

Firmware architecture requirement:
  - Mode 05 command set must be designed now with sub-command
    namespace that accommodates 0x05E and 0x05F without refactoring
    0x05A through 0x05D.
  - OEM identifier, chip type, and transponder data fields in the
    data model (Section 6) are already structured to support hardware-
    assisted modes when modules are present.

------------------------------------------------------------
SECTION 9 — COMPLIANCE AND LEGAL NOTES FOR BUILD AGENT
------------------------------------------------------------
1. Locksmith Licensing:
   - LUME is a professional diagnostic tool sold to mechanics and
     automotive service facilities.
   - The mechanic or service facility operating Mode 05 bears state
     licensing obligations where they apply.
   - The device manufacturer (DarkWave Studios LLC) does not hold a
     locksmith license, nor is one required to manufacture or sell
     professional diagnostic tooling.
   - This is consistent with industry precedent (Snap-on, Autel,
     Launch, XTOOL — none hold locksmith licenses).

2. FCC:
   - Current firmware-only dongle (no RF modules added): no new FCC
     requirements beyond existing WiFi and BLE certifications.
   - When hardware RF modules (Section 8) are added: FCC Part 15
     certification required for 315/433 MHz transmitter before
     commercial sale. Budget 8–12 weeks and $5–15k for certification.

3. NASTF:
   - Algorithm sourcing must use NASTF SDRM or a licensed B2B
     algorithm provider (Section 5).
   - Build agent must not implement algorithms sourced from
     reverse-engineered databases or unofficial community sources.

4. Tone in User-Facing Materials:
   - "Key management" is the correct product term. Not "key hacking,"
     not "key cloning," not "locksmith tool."
   - Lead with the audit trail and governance story, not the
     programming capability. The unique value is cryptographic
     key lifecycle governance, not another key programmer.
   - Consistent with Manheim materials: "This wraps what already
     exists. Manheim's locksmiths still program keys. LUME makes
     every programming event permanently auditable."

------------------------------------------------------------
SECTION 10 — IMPLEMENTATION REQUIREMENTS SUMMARY
------------------------------------------------------------
Firmware:
  - Add Mode 05 (0x05A, 0x05B, 0x05C, 0x05D) to LUME command set
  - UDS extended session (0x10 03) implementation
  - Security access handler (0x27 01 / 0x27 02)
  - TesterPresent keep-alive (0x3E 00) at 2-second interval
  - Session timeout handler (30s for pending 0x05C)
  - VIN read enforcement before any Mode 05 write (HC-K1)
  - Security lockout after 3 NRC 0x35 failures (60s lockout)
  - All five Hard Constraints (HC-K1 through HC-K5) enforced
    at firmware level

App:
  - Phone NFC read flow for transponder chip identification
  - VIN confirmation screen before Mode 05 write sessions
  - Authorization payload sent to dongle via BLE (not UI-only gate)
  - Level C (delete) confirmation: last-six-VIN re-entry
  - Session progress UI (open → secured → programming → confirmed)
  - Plain-language NRC error display
  - CAL anchor confirmation before success screen shown to technician

CAL / Asset Passport:
  - key_history array added to Vehicle Asset Passport schema
  - Key programming event record (Section 6) submitted to CAL on every
    write event
  - cal_anchor_hash populated and stored before success shown to user

Algorithm Layer:
  - Seed/key computation handled in app/cloud layer (recommended)
    OR via licensed API (Section 5)
  - OEM identifier required field — no fallback to generic algorithms
  - Unsupported OEM returns clear error to app

------------------------------------------------------------
END OF HANDOFF — LUME MODE 05 KEY MANAGEMENT FIRMWARE v1.0
------------------------------------------------------------
