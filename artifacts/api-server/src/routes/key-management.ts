import { Router } from "express";

const router = Router();

type EnforcementLevel = "HIGH" | "MODERATE" | "LOW" | "NONE";

interface StateDisclaimerEntry {
  required: boolean;
  state_name: string;
  enforcement: EnforcementLevel;
  licensing_body: string | null;
  notes: string;
  disclaimer_text: string | null;
}

const CONSUMER_DISCLAIMER =
  "Key programming is a regulated activity in your state. Users are responsible for complying with applicable state licensing requirements for automotive key programming. LUME is a professional diagnostic tool — operating it is your responsibility.";

const STATE_DATA: Record<string, StateDisclaimerEntry> = {
  AL: {
    required: true,
    state_name: "Alabama",
    enforcement: "LOW",
    licensing_body: "Alabama Electronic Security Board of Licensure (AESBL)",
    notes: "Locksmith licensing required. Low active enforcement for automotive key programming.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  CA: {
    required: true,
    state_name: "California",
    enforcement: "HIGH",
    licensing_body: "Bureau of Security and Investigative Services (BSIS)",
    notes: "Active enforcement. Automotive dealers and mechanics may qualify for exemptions when programming for the registered owner's vehicle.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  CT: {
    required: true,
    state_name: "Connecticut",
    enforcement: "LOW",
    licensing_body: "Department of Consumer Protection",
    notes: "Locksmith licensing required. Limited active enforcement for automotive key programming.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  IL: {
    required: true,
    state_name: "Illinois",
    enforcement: "MODERATE",
    licensing_body: "Illinois Department of Financial and Professional Regulation (IDFPR)",
    notes: "Locksmith licensing required. No explicit automotive exemption.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  LA: {
    required: true,
    state_name: "Louisiana",
    enforcement: "MODERATE",
    licensing_body: "Louisiana State Licensing Law",
    notes: "Locksmith licensing required. No explicit automotive exemption.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  MD: {
    required: true,
    state_name: "Maryland",
    enforcement: "MODERATE",
    licensing_body: "Maryland Home Improvement Commission (MHIC)",
    notes: "Locksmith licensing required. No explicit automotive exemption.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  NE: {
    required: true,
    state_name: "Nebraska",
    enforcement: "LOW",
    licensing_body: "Secretary of State",
    notes: "Locksmith registration required. Minimal active enforcement for automotive key programming.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  NV: {
    required: true,
    state_name: "Nevada",
    enforcement: "MODERATE",
    licensing_body: "Private Investigators Licensing Board (PILB)",
    notes: "Locksmith licensing required. No explicit automotive exemption.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  NJ: {
    required: true,
    state_name: "New Jersey",
    enforcement: "HIGH",
    licensing_body: "New Jersey State Police",
    notes: "Active enforcement. No explicit automotive exemption.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  NC: {
    required: true,
    state_name: "North Carolina",
    enforcement: "HIGH",
    licensing_body: "North Carolina Locksmith Licensing Board (NCLSLA)",
    notes: "Active enforcement. No explicit automotive exemption.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  OK: {
    required: true,
    state_name: "Oklahoma",
    enforcement: "MODERATE",
    licensing_body: "Oklahoma State Bureau of Investigation (OSBI)",
    notes: "Locksmith licensing required. No explicit automotive exemption.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  OR: {
    required: true,
    state_name: "Oregon",
    enforcement: "MODERATE",
    licensing_body: "Construction Contractors Board (CCB)",
    notes: "Locksmith licensing required. No explicit automotive exemption.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  TN: {
    required: true,
    state_name: "Tennessee",
    enforcement: "HIGH",
    licensing_body: "Tennessee Department of Commerce and Insurance (TDCI)",
    notes: "Active enforcement. No explicit automotive exemption.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  TX: {
    required: true,
    state_name: "Texas",
    enforcement: "HIGH",
    licensing_body: "Texas Department of Public Safety (DPS)",
    notes: "Active enforcement. One of the most regulated states for locksmith activity. No explicit automotive exemption. Mechanics programming keys for paying customers should verify licensing status.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
  VA: {
    required: true,
    state_name: "Virginia",
    enforcement: "HIGH",
    licensing_body: "Department of Criminal Justice Services (DCJS)",
    notes: "Active enforcement. No explicit automotive exemption.",
    disclaimer_text: CONSUMER_DISCLAIMER,
  },
};

const NO_DISCLAIMER: StateDisclaimerEntry = {
  required: false,
  state_name: "",
  enforcement: "NONE",
  licensing_body: null,
  notes: "No state locksmith licensing law. No disclaimer required.",
  disclaimer_text: null,
};

router.get("/key-management/state-disclaimer", (req, res) => {
  const raw = req.query.state;

  if (!raw || typeof raw !== "string") {
    res.status(400).json({
      error: "Missing required query parameter: state",
      example: "/api/key-management/state-disclaimer?state=TX",
    });
    return;
  }

  const stateCode = raw.trim().toUpperCase();

  if (stateCode.length !== 2) {
    res.status(400).json({
      error: "state must be a 2-letter US state abbreviation (e.g. TX, CA, FL)",
    });
    return;
  }

  const entry = STATE_DATA[stateCode] ?? { ...NO_DISCLAIMER, state_name: stateCode };

  res.json({
    state: stateCode,
    state_name: entry.state_name || stateCode,
    disclaimer_required: entry.required,
    enforcement_level: entry.enforcement,
    licensing_body: entry.licensing_body,
    notes: entry.notes,
    disclaimer_text: entry.disclaimer_text,
  });
});

router.get("/key-management/regulated-states", (_req, res) => {
  const summary = Object.entries(STATE_DATA).map(([code, entry]) => ({
    state: code,
    state_name: entry.state_name,
    enforcement_level: entry.enforcement,
    licensing_body: entry.licensing_body,
  }));

  res.json({
    total_regulated: summary.length,
    total_us_states: 50,
    unregulated_states: 50 - summary.length,
    regulated: summary,
  });
});

export default router;
