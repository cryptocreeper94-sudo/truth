TITLE: LUME Dual-Dongle Architecture with OBD-II Splitter + Optional Vehicle-Carried Mode
VERSION: 1.1
AUTHOR: DarkWave Studios LLC
DATE: May 2026
STATUS: Build-ready directive. All sections are implementation requirements, not proposals.

------------------------------------------------------------
SECTION 1 — COX2M CELLULAR DONGLE (EXISTING VEHICLE LAYER)
------------------------------------------------------------
1. Device Type:
   - Cellular telematics unit (NOT Bluetooth, NOT Wi-Fi).
   - Uses LTE-M / NB-IoT for connectivity.

2. Purpose:
   - Long-term asset tracking.
   - GPS pings at low frequency.
   - Basic OBD events (MIL, battery voltage, ignition state).
   - Repossession, fleet visibility, compliance.

3. Behavior:
   - Stays plugged into the vehicle for months or years.
   - Sends data directly to Cox servers.
   - Not designed for real-time diagnostics or operational workflows.
   - Operates on low-frequency wake cycles — passive on the CAN bus the
     majority of the time.

4. Key Point:
   - This device remains in the vehicle and is NOT replaced by LUME.
   - LUME does not modify, communicate with, or depend on the Cox2M dongle
     in any way.

------------------------------------------------------------
SECTION 2 — LUME DIAGNOSTIC DONGLE (TECHNICIAN-CARRIED MODE)
------------------------------------------------------------
1. Device Type:
   - BLE (Bluetooth Low Energy 5.0 minimum) diagnostic dongle.

2. Purpose:
   - Real-time, high-frequency OBD telemetry (42-signal capture).
   - Intake, movement, recon, QC, and checkout workflow steps.
   - Synthetic organism scoring via Lume-Auto 4/42 architecture.
   - Deterministic state transitions within the operational OS.

3. Behavior:
   - Carried by the technician.
   - Plugged in only during active workflow steps.
   - Streams live OBD data to technician's phone via BLE.
   - Phone → cellular → cloud → dashboard.

4. HARD CONSTRAINT — READ-ONLY OPERATION:
   - The LUME dongle NEVER writes to the ECU under any condition.
   - No ECU reprogramming.
   - No calibration changes.
   - No firmware alteration.
   - No Mode 04 operations (DTC clear) unless explicitly triggered by an
     authorized workflow step with a separate confirmation gate.
   - This constraint is enforced at the firmware level, not at the
     application layer. The firmware must make ECU write commands
     architecturally impossible in standard operating modes.

5. BLE Range:
   - Sufficient because the technician is physically at the vehicle.
   - BLE 5.0 minimum required for vehicle-carried mode bulk data sync
     (see Section 5 for throughput requirements).

6. Key Point:
   - This mode does NOT conflict with the Cox2M dongle.
   - LUME is the operational layer. Cox2M is the asset tracking layer.
     They are not the same product and do not serve the same function.

------------------------------------------------------------
SECTION 3 — OBD-II SPLITTER (DUAL-DONGLE COEXISTENCE)
------------------------------------------------------------
1. Hardware:
   - Passive OBD-II Y-splitter with two female ports.
   - MUST be a passive splitter — no active electronics, no onboard
     arbitration logic.
   - Active splitters with onboard logic are NOT approved for this
     architecture; they introduce unpredictable CAN behavior.

2. Configuration:
   - Port A: Cox2M cellular dongle.
   - Port B: LUME diagnostic dongle.

3. CAN Bus Arbitration — Accurate Model:
   - IMPORTANT: The splitter does NOT arbitrate CAN bus access.
     The splitter is passive hardware. CAN bus arbitration is managed
     by the CAN bus protocol and the firmware of each device.

   - Priority behavior is achieved through the operational pattern:
     - Cox2M operates on long wake intervals (typically minutes to hours
       between active CAN queries). During these intervals it is passive.
     - LUME takes CAN bus access during active diagnostic sessions.

   - Collision handling (firmware requirement):
     - The LUME firmware MUST monitor for CAN activity from other devices
       on the bus before initiating a diagnostic session.
     - If CAN activity is detected from a source other than the LUME
       dongle (Cox2M waking), LUME must implement a listen-before-talk
       window of 500ms before re-attempting.
     - LUME must never force-hold the CAN bus during collision.
       CAN protocol arbitration resolves collisions at the bit level;
       LUME firmware must be compliant with ISO 15765-2 (CAN transport
       protocol) and must not implement non-standard bus-hold behavior.

4. Result:
   - Both devices coexist without interference under normal operating
     conditions.
   - No modification to Cox hardware or infrastructure required.
   - No modification to Cox software or server infrastructure required.

------------------------------------------------------------
SECTION 4 — LUME VEHICLE-CARRIED MODE (OPTIONAL UPGRADE)
------------------------------------------------------------
1. Hardware Enhancements Required:
   - Onboard flash storage: 8–32MB (see storage schedule below).
   - Low-power sleep mode with scheduled wake cycles.
   - Buffered CAN data logging with circular buffer overflow protection.
   - BLE 5.0 (required — not optional — for acceptable bulk sync time).
   - Internal clock for timestamping without phone presence.

2. Wake Cycle Schedule:
   - Default wake interval: every 15 minutes.
   - On wake: sample ignition state, battery voltage, and any pending
     DTCs. Log timestamped record. Return to sleep.
   - If ignition is ON at wake time: extend active sampling to full
     OBD session (42-signal capture) until ignition OFF event detected.
     Then return to sleep.
   - Emergency wake triggers (immediate, no scheduled delay):
     - Battery voltage drop below 11.8V
     - New DTC detected via CAN broadcast
     - Motion event detected (if accelerometer present)

3. Storage Schedule:
   - At 15-minute wake intervals with 42-signal capture on ignition events:
     - Estimated log growth: 2–5MB per day depending on vehicle activity.
     - 8MB flash: sufficient for approximately 2–4 days of continuous data.
     - 32MB flash: sufficient for approximately 8–16 days.
   - BUILD AGENT NOTE: 32MB is the recommended minimum for a vehicle
     expected to remain on the lot for 7–14 days between syncs.
   - Circular buffer behavior: when flash is full, oldest records are
     overwritten. The technician download workflow (Section 5) must be
     triggered before the buffer overwrites data of record.
   - A low-storage alert must be broadcast via BLE when flash reaches
     80% capacity, detectable by the LUME app on any in-range device.

4. Data Captured in Vehicle-Carried Mode:
   - Cold start events (timestamped engine start with thermal state)
   - Idle period logs (RPM, coolant temp, battery voltage at interval)
   - Battery voltage curve (continuous trend, not just snapshots)
   - Active DTCs and freeze frames at detection time
   - DTC clear events (logged as audit events — who cleared, when)
   - Movement events (ignition ON/OFF, speed delta if available)
   - Recon and QC workflow events (flagged by technician via app)
   - CAN-level anomalies (unexpected message IDs, bus error frames)

5. Key Points:
   - This mode does NOT replace Cox2M. It complements it.
   - Cox2M continues to provide GPS and asset tracking independently.
   - LUME vehicle-carried mode provides diagnostic depth that Cox2M
     was never designed to capture.
   - The read-only hard constraint (Section 2, Item 4) applies in
     vehicle-carried mode exactly as in technician-carried mode.

------------------------------------------------------------
SECTION 5 — TECHNICIAN DOWNLOAD WORKFLOW
------------------------------------------------------------
1. Trigger condition:
   - Technician initiates download before vehicle leaves the lot.
   - Alternatively triggered automatically when low-storage alert
     (80% flash capacity) is received by the LUME app.

2. Download sequence:
   a. Technician opens LUME app. App scans for LUME dongles in BLE range.
   b. App connects to dongle via BLE 5.0.
   c. App requests metadata first: record count, date range, total size,
      storage utilization percentage.
   d. Technician confirms download (or app auto-confirms if triggered by
      low-storage alert).
   e. App downloads stored diagnostic data via BLE.
   f. App uploads data to cloud and attaches to the vehicle's record.
   g. App confirms successful cloud upload to technician.
   h. Technician removes LUME dongle from OBD-II port (or splitter).

3. BLE Transfer Time — Build Agent Must Account For:
   - BLE 5.0 practical throughput: approximately 1.3 Mbps theoretical,
     400–700 KB/s practical with protocol overhead.
   - At 400 KB/s:
     - 8MB log: approximately 20 seconds.
     - 32MB log: approximately 80 seconds (under 2 minutes).
   - BLE 4.2 is NOT acceptable for vehicle-carried mode. At ~125 KB/s,
     a 32MB log takes approximately 4 minutes — an unacceptable workflow
     friction point for a lot technician.
   - The LUME app must display a transfer progress indicator during
     download. No silent transfers.

4. Output:
   - Certified diagnostic history for the full duration the vehicle
     was on the lot.
   - Record anchored to CAL (Cox Automotive Ledger) for immutable
     provenance.
   - Each download event generates a signed sync receipt anchored to CAL
     alongside the diagnostic records.

5. Resolved: "VET" Reference
   - Prior draft referenced "CAL/VET." VET is not a defined system in
     this architecture. All provenance anchoring references CAL only.
     Build agent must not implement a VET system — this was a drafting
     error in v1.0 and is removed.

------------------------------------------------------------
SECTION 6 — DATA MODEL
------------------------------------------------------------
The build agent must implement the following record schemas for all
data captured and transmitted by the LUME dongle.

1. Ignition Event Record:
   {
     "record_type":     "ignition_event",
     "timestamp":       "ISO 8601 UTC",
     "event":           "ON | OFF",
     "battery_voltage": float (volts, e.g., 12.6),
     "coolant_temp_c":  float (Celsius),
     "odometer_km":     float | null,
     "dongle_id":       "string — unique hardware identifier"
   }

2. OBD Session Record (42-signal capture):
   {
     "record_type":     "obd_session",
     "timestamp_start": "ISO 8601 UTC",
     "timestamp_end":   "ISO 8601 UTC",
     "dongle_id":       "string",
     "technician_id":   "string | null (null in vehicle-carried mode)",
     "workflow_step":   "intake | recon | qc | checkout | background | null",
     "signals": {
       "rpm":                  float,
       "vehicle_speed_kmh":    float,
       "coolant_temp_c":       float,
       "intake_air_temp_c":    float,
       "maf_g_per_s":          float,
       "throttle_position_pct":float,
       "engine_load_pct":      float,
       "stft_bank1_pct":       float,
       "ltft_bank1_pct":       float,
       "o2_voltage_b1s1_v":    float,
       "map_kpa":              float,
       "fuel_pressure_kpa":    float,
       "battery_voltage_v":    float,
       "timing_advance_deg":   float,
       "fuel_trim_status":     "open_loop | closed_loop",
       "additional_signals":   {}
     },
     "active_dtcs":     ["string"],
     "organism_mode":   "OPTIMAL | EFFICIENCY | MAINTENANCE_ALERT | FAULT_DETECTED | LIMP_MODE"
   }

3. DTC Event Record:
   {
     "record_type":    "dtc_event",
     "timestamp":      "ISO 8601 UTC",
     "event":          "detected | cleared",
     "dtc_code":       "string (e.g., P0301)",
     "dtc_description":"string",
     "freeze_frame":   {},
     "cleared_by":     "string | null (technician ID if cleared, null if auto-resolved)",
     "dongle_id":      "string"
   }

4. CAN Anomaly Record:
   {
     "record_type":    "can_anomaly",
     "timestamp":      "ISO 8601 UTC",
     "anomaly_type":   "unexpected_message_id | bus_error_frame | arbitration_loss | timeout",
     "message_id":     "hex | null",
     "error_count":    int,
     "dongle_id":      "string"
   }

5. Sync Receipt Record (generated at download completion):
   {
     "record_type":      "sync_receipt",
     "timestamp":        "ISO 8601 UTC",
     "dongle_id":        "string",
     "vehicle_vin":      "string",
     "records_synced":   int,
     "date_range_start": "ISO 8601 UTC",
     "date_range_end":   "ISO 8601 UTC",
     "technician_id":    "string",
     "upload_confirmed": true | false,
     "cal_anchor_hash":  "string | null"
   }

------------------------------------------------------------
SECTION 7 — SECURITY
------------------------------------------------------------
1. Encryption at Rest (onboard flash):
   - Algorithm: AES-256-GCM
   - Key derivation: PBKDF2 with dongle hardware serial as entropy source
   - All records written to flash must be encrypted before storage
   - Decryption occurs only during BLE sync session with authenticated
     LUME app

2. BLE Sync Packet Signing:
   - Algorithm: Ed25519 (consistent with CAL, Enterprise Mesh, and
     Lume-V cryptographic standards across the Canon)
   - Each sync packet is signed by the dongle's Ed25519 private key
   - The LUME app verifies the signature before accepting any packet
   - Packet signing key is provisioned at manufacturing time and stored
     in secure element (not in general flash)

3. CAL Anchoring:
   - On successful cloud upload, the sync receipt record is submitted
     to CAL via POST /api/submit/custody
   - The CAL anchor hash is returned and stored in the sync receipt
   - The anchor makes the diagnostic record tamper-evident for the
     vehicle's lifetime in the system

4. Read-Only Enforcement (firmware):
   - The firmware must implement a hardware-level write block on all
     ECU-targeted CAN messages in standard operating modes.
   - The only permissible CAN writes are OBD-II query messages (Mode 01,
     Mode 03, Mode 07, Mode 09 PIDs).
   - Mode 04 (DTC clear) is gated behind an explicit authorized workflow
     step and requires technician ID confirmation before execution.
   - This is a firmware requirement. The application layer cannot
     override it.

------------------------------------------------------------
SECTION 8 — ARCHITECTURAL POSITIONING
------------------------------------------------------------
1. Cox2M Dongle = Vehicle Layer
   - Long-term asset tracking.
   - Cellular connectivity.
   - Asset-centric (where is the vehicle?).

2. LUME Dongle = Operational Layer
   - Real-time and logged diagnostics.
   - Workflow-centric (what is the vehicle's condition, right now?).
   - Technician-driven.

3. Splitter = Coexistence Layer
   - Passive hardware enabling both systems to operate simultaneously.
   - Does not arbitrate. Does not process. Does not modify either signal.

4. Optional LUME Onboard Storage = Life-Cycle Diagnostics Layer
   - Full provenance of vehicle behavior while on the lot.
   - Captures what no one was watching between workflow steps.

5. Enterprise Alignment:
   - No conflict with existing Cox hardware.
   - No need to replace or modify 500k+ cellular dongles in the field.
   - No changes to Cox server infrastructure or data pipelines.
   - LUME becomes the operational OS instrumentation layer that Cox2M
     was never designed to be.

------------------------------------------------------------
SECTION 9 — IMPLEMENTATION REQUIREMENTS SUMMARY
------------------------------------------------------------
1. Firmware:
   - CAN listen-before-talk protocol (500ms window, ISO 15765-2 compliant)
   - Read-only hard constraint enforced at firmware level
   - Mode 04 gated behind authorized workflow confirmation
   - Buffered CAN data logging with circular overflow protection
   - BLE 5.0 transport (minimum — not negotiable for vehicle-carried mode)
   - AES-256-GCM encryption of all records before flash write
   - Ed25519 packet signing (key in secure element)
   - Wake/sleep scheduler (15-minute default interval)
   - Low-storage alert at 80% flash capacity via BLE broadcast
   - Emergency wake triggers (voltage drop, new DTC, motion event)

2. Storage:
   - 32MB flash recommended minimum for 7–14 day lot stay
   - Circular buffer with oldest-record overwrite at capacity
   - All records encrypted at rest (AES-256-GCM)

3. Data Model:
   - All five record schemas in Section 6 must be implemented exactly
   - Timestamps: ISO 8601 UTC, always — no local time
   - Dongle ID: unique hardware identifier, provisioned at manufacturing

4. BLE:
   - BLE 5.0 minimum
   - Transfer progress indicator required (no silent transfers)
   - Metadata request before bulk transfer (record count, size, date range)
   - Ed25519 signature verified on every received packet before acceptance

5. Cloud / CAL Integration:
   - On successful upload: POST sync receipt to CAL /api/submit/custody
   - Store returned CAL anchor hash in sync receipt record
   - Upload must be confirmed before app instructs technician to remove dongle

------------------------------------------------------------
END OF HANDOFF — LUME DUAL-DONGLE ARCHITECTURE v1.1
------------------------------------------------------------
