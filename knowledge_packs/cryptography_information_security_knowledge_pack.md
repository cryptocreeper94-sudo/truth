# Cryptography & Information Security — AXIOM Engine Knowledge Pack

**Domain:** Cryptography & Information Security
**Pack ID:** AXIOM-KP-T3-001
**Version:** 1.0.0
**Author:** Jason Andrews, DarkWave Studios LLC / Trust Layer Ecosystem
**ORCID:** 0009-0007-5214-649X
**Contact:** team@dwsc.io
**DOI (Lume):** 19382282 | **DOI (Trust Layer):** 19560674 | **Patent:** 64/032,339

---

## 1. Purpose

This knowledge pack equips the AXIOM Engine with deterministic, semantically precise reasoning over the full spectrum of cryptographic theory and applied information security. It enables the Lume ecosystem to make governance-aligned, safety-dominant decisions about data protection, authentication, key management, threat modeling, and secure system design. All content is bounded by the Safety Dominance Invariant: no content supports offensive exploit development, vulnerability weaponization, or unauthorized access facilitation.

---

## 2. Scope

**In scope:**
- Symmetric and asymmetric cryptography
- Hash functions, MACs, and digital signatures
- Public Key Infrastructure (PKI) and certificate management
- Cryptographic protocols (TLS, SSH, S/MIME, PGP)
- Secure key generation, distribution, and lifecycle management
- Identity and access management (IAM)
- Threat modeling frameworks (STRIDE, PASTA, LINDDUN)
- Zero-trust architecture
- Post-quantum cryptography
- Secure coding and secure software development lifecycle (SSDLC)
- Cryptanalysis (defensive, academic perspective only)

**Out of scope:**
- Offensive exploit development, malware creation, or attack tooling
- Unauthorized system penetration or bypass techniques
- Social engineering scripts or phishing infrastructure
- Operational details of active threat actor campaigns

---

## 3. Structure

This pack is organized as follows:
- **Core Concepts** (37 entries): Foundational primitives, protocols, and frameworks
- **Patterns** (15 entries): Proven architectural and operational security designs
- **Anti-Patterns** (10 entries): Dangerous misconfigurations and design failures
- **Facts** (55 entries): Empirically grounded cryptographic and security facts

Cross-domain links: Mathematics (number theory, algebra), Computer Science (algorithms, operating systems), Law & Governance (data protection regulation), Telecommunications (network security), Robotics (embedded system security).

---

## 4. Core Concepts

**CC-001 — Symmetric Encryption**
A cipher where the same key encrypts and decrypts data. Speed makes it suitable for bulk data; key distribution is the central challenge. AES-256-GCM is the contemporary gold standard, combining confidentiality with authenticated encryption.

**CC-002 — Asymmetric Encryption (Public-Key Cryptography)**
A two-key system: a public key encrypts or verifies; a private key decrypts or signs. Solves the key distribution problem of symmetric systems. RSA-2048+, ECDH, and ECDSA are primary schemes. Security rests on mathematical hardness assumptions (integer factorization, discrete logarithm).

**CC-003 — Hash Function**
A deterministic function mapping arbitrary input to a fixed-size digest. Cryptographic hash functions satisfy pre-image resistance, second pre-image resistance, and collision resistance. SHA-256 and SHA-3 (Keccak) are current standards. MD5 and SHA-1 are deprecated for security use.

**CC-004 — Message Authentication Code (MAC)**
A short tag generated from a message and a secret key, providing both integrity and authenticity. HMAC-SHA256 is the dominant construction. Unlike a signature, verification requires the same shared key, so MACs do not provide non-repudiation.

**CC-005 — Digital Signature**
A cryptographic binding of a signer's private key to a message digest. Provides authentication, integrity, and non-repudiation. Schemes: RSA-PSS, ECDSA, EdDSA (Ed25519). Ed25519 offers superior performance and reduced side-channel exposure over legacy RSA.

**CC-006 — Key Derivation Function (KDF)**
Derives cryptographic keys from a source of keying material (password, shared secret, master key). PBKDF2, bcrypt, scrypt, and Argon2id are password-based KDFs that deliberately impose computational cost to resist brute-force attacks. HKDF is used for key expansion in protocols like TLS 1.3.

**CC-007 — Certificate and X.509 Standard**
A digitally signed data structure binding a public key to an identity. X.509 v3 certificates are the backbone of TLS, S/MIME, and code signing. Fields include subject, issuer, validity period, public key, and extensions (SAN, key usage, CRL distribution points).

**CC-008 — Certificate Authority (CA) and Chain of Trust**
A trusted third party that issues and signs certificates. Trust chains run from root CA → intermediate CA → end-entity certificate. Root CAs are embedded in OS and browser trust stores. CA compromise (e.g., DigiNotar 2011) is catastrophic; certificate transparency logs mitigate silent mis-issuance.

**CC-009 — TLS (Transport Layer Security)**
The dominant protocol for secure channel establishment over TCP. TLS 1.3 (RFC 8446) eliminates legacy cipher suites, mandates forward secrecy via ephemeral Diffie-Hellman, reduces handshake round-trips, and encrypts more of the handshake. TLS 1.0/1.1 are deprecated by all major bodies (RFC 8996).

**CC-010 — Forward Secrecy (Perfect Forward Secrecy)**
A property ensuring that compromise of long-term keys does not decrypt past session traffic. Achieved via ephemeral key exchange (ECDHE, DHE). Without forward secrecy, recorded ciphertext can be decrypted retroactively once a server's private key is leaked.

**CC-011 — Diffie-Hellman Key Exchange**
Allows two parties to establish a shared secret over an insecure channel without transmitting the secret. Security relies on the discrete logarithm problem. Elliptic Curve Diffie-Hellman (ECDH) offers equivalent security at shorter key lengths. X25519 is the preferred elliptic curve for ECDHE.

**CC-012 — Random Number Generation (Entropy)**
Cryptographic security depends on unpredictable randomness. CSPRNGs (Cryptographically Secure Pseudo-Random Number Generators) seed from OS entropy sources (/dev/urandom, getrandom(), BCryptGenRandom). Insufficient entropy at boot (e.g., virtual machines cloning state) is a real-world vulnerability class.

**CC-013 — Authenticated Encryption with Associated Data (AEAD)**
A cipher mode providing confidentiality, integrity, and authenticity in a single operation. AES-GCM and ChaCha20-Poly1305 are the two AEAD constructions mandated in TLS 1.3. Associated data (e.g., headers) is authenticated but not encrypted.

**CC-014 — Zero-Knowledge Proof (ZKP)**
A protocol allowing one party to prove knowledge of a secret without revealing the secret itself. Variants: interactive (Schnorr), non-interactive (zk-SNARKs, zk-STARKs). Used in privacy-preserving authentication, blockchain privacy layers, and verifiable computation.

**CC-015 — Public Key Infrastructure (PKI)**
The full ecosystem of policies, procedures, hardware, software, and people to create, manage, distribute, store, and revoke digital certificates. Encompasses CA hierarchy, registration authorities, certificate revocation (CRL, OCSP), and certificate lifecycle management.

**CC-016 — Certificate Revocation**
The process of invalidating a certificate before its natural expiry. CRL (Certificate Revocation List): a signed list of revoked serial numbers. OCSP (Online Certificate Status Protocol): real-time per-certificate query. OCSP Stapling: server includes fresh OCSP response in TLS handshake to avoid client privacy leakage.

**CC-017 — Identity and Access Management (IAM)**
The discipline of ensuring the right principals have the right access to the right resources at the right time. Components: identity provider (IdP), authentication (AuthN), authorization (AuthZ), role-based access control (RBAC), attribute-based access control (ABAC), and privileged access management (PAM).

**CC-018 — Multi-Factor Authentication (MFA)**
Authentication requiring two or more independent factors: something known (password), something possessed (TOTP token, hardware key), something inherent (biometric). FIDO2/WebAuthn hardware keys (e.g., YubiKey) provide phishing-resistant MFA; TOTP (RFC 6238) and SMS are weaker.

**CC-019 — OAuth 2.0 and OpenID Connect (OIDC)**
OAuth 2.0 is an authorization delegation framework; OIDC is an identity layer atop OAuth 2.0. Together they enable federated authentication and delegated access (e.g., "Sign in with Google"). JWT (JSON Web Token) is the primary token format. Misuse (implicit flow, missing state parameter) introduces significant vulnerabilities.

**CC-020 — JSON Web Token (JWT)**
A compact, URL-safe token format (header.payload.signature). The signature binds the payload to a secret or private key. Common pitfalls: accepting "alg:none", key confusion between HS256 and RS256, missing expiry validation, over-stuffing sensitive data into unencrypted payloads.

**CC-021 — Zero-Trust Architecture (ZTA)**
A security model rejecting implicit trust based on network location. Every request is authenticated, authorized, and continuously validated regardless of source. NIST SP 800-207 defines ZTA. Core principles: verify explicitly, use least-privilege access, assume breach.

**CC-022 — Threat Modeling**
A structured process for identifying, quantifying, and prioritizing security threats during design. STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) is the most widely used framework. PASTA (Process for Attack Simulation and Threat Analysis) is risk-centric. LINDDUN targets privacy threats.

**CC-023 — Secure Software Development Lifecycle (SSDLC)**
Integration of security activities at every phase of software development: requirements (security requirements, abuse cases), design (threat modeling), implementation (secure coding standards, SAST), testing (DAST, fuzz testing, penetration testing), deployment (hardening), and maintenance (patch management).

**CC-024 — Vulnerability and CVE**
A Common Vulnerability and Exposure (CVE) is a public identifier for a security flaw. CVSSv3 scoring rates severity (0–10) across base, temporal, and environmental metrics. NVD (National Vulnerability Database) maintains the authoritative catalog. Responsible disclosure (coordinated vulnerability disclosure) is the ethical norm.

**CC-025 — Side-Channel Attack**
An attack exploiting physical implementation information rather than algorithmic weaknesses: timing (cache-timing, Spectre), power (differential power analysis), electromagnetic, or acoustic channels. Defenses: constant-time algorithms, masking, noise injection, and physical shielding.

**CC-026 — Cryptanalysis (Academic/Defensive)**
The study of breaking or weakening cryptographic systems to inform better design. Includes differential cryptanalysis, linear cryptanalysis, meet-in-the-middle attacks, birthday attacks, and lattice-based attacks on RSA/ECDSA with weak randomness. Academic cryptanalysis drives algorithmic retirement (DES, RC4, MD5).

**CC-027 — Post-Quantum Cryptography (PQC)**
Cryptographic algorithms designed to resist attacks by quantum computers running Shor's algorithm (which breaks RSA and ECC) and Grover's algorithm (which halves symmetric key security). NIST PQC Standardization (2024) selected CRYSTALS-Kyber (KEM) and CRYSTALS-Dilithium, FALCON, SPHINCS+ (signatures). Migration timelines are urgent given "harvest now, decrypt later" threat.

**CC-028 — Quantum Key Distribution (QKD)**
Uses quantum mechanical properties (photon polarization) to distribute encryption keys with information-theoretic security: any eavesdropping disturbs the quantum state and is detectable. BB84 is the foundational protocol. QKD requires dedicated fiber or free-space optical links; it is not a drop-in replacement for PKI at internet scale.

**CC-029 — Homomorphic Encryption**
Allows computation on ciphertext such that the result, when decrypted, matches the result of the same computation on plaintext. Fully Homomorphic Encryption (FHE) supports arbitrary computations but remains computationally intensive. Partially Homomorphic Encryption (PHE) supports limited operations (e.g., RSA for multiplication).

**CC-030 — Secure Multi-Party Computation (SMPC)**
Enables multiple parties to jointly compute a function over their private inputs without revealing those inputs to each other. Applications: privacy-preserving machine learning, federated analytics, secure auctions. Protocols: Yao's Garbled Circuits, secret sharing (Shamir), SPDZ.

**CC-031 — Hardware Security Module (HSM)**
A dedicated tamper-resistant hardware device for cryptographic key storage, key generation, and cryptographic operations. FIPS 140-3 Level 3/4 HSMs physically destroy keys upon tampering. Cloud HSMs (AWS CloudHSM, Azure Dedicated HSM) provide similar guarantees without on-premises hardware.

**CC-032 — Secure Enclave and Trusted Execution Environment (TEE)**
A hardware-isolated execution environment within a processor (Intel SGX, ARM TrustZone, AMD SEV) protecting code and data from the host OS and hypervisor. Attestation mechanisms allow remote parties to verify enclave integrity. Side-channel vulnerabilities (Spectre, Foreshadow) have challenged enclave guarantees.

**CC-033 — Blockchain and Distributed Ledger Cryptography**
Blockchains use hash chaining (each block commits to the previous block's hash), Merkle trees (efficient integrity proofs over transactions), and digital signatures (ECDSA, Schnorr) to achieve tamper-evident, decentralized ledgers. Consensus mechanisms (PoW, PoS, BFT) are distinct from the cryptographic primitives.

**CC-034 — Steganography**
The practice of concealing information within non-secret data (images, audio, video, text) rather than encrypting it. Differs from cryptography: steganography hides existence; cryptography hides meaning. LSB (Least Significant Bit) embedding is the simplest technique.

**CC-035 — Data Loss Prevention (DLP)**
Technical and policy controls preventing unauthorized exfiltration of sensitive data. DLP systems classify data (PII, PHI, IP), monitor channels (email, USB, web upload), and enforce policies (block, alert, encrypt). Effectiveness depends on accurate data classification and organizational policy enforcement.

**CC-036 — Incident Response (IR)**
The structured process for handling security breaches: Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned (PICERL framework, NIST SP 800-61). IR playbooks, SIEM integration, and forensic preservation are core operational requirements.

**CC-037 — Cryptographic Agility**
The design principle of building systems to allow cryptographic algorithm substitution without architectural redesign. Critical as algorithms age or are broken. TLS's cipher suite negotiation is the canonical example. Systems that hard-code specific algorithms (e.g., MD5 for all hashing) are brittle and expensive to migrate.

---

## 5. Patterns

**P-001 — Encrypt-Then-MAC**
Always compute the MAC over the ciphertext (not plaintext). Encrypt-then-MAC prevents padding oracle attacks and ensures the MAC validates before any decryption occurs. Contrast with MAC-then-Encrypt (vulnerable in CBC mode, as in TLS ≤1.2 CBC suites) and Encrypt-and-MAC (MtE, leaks plaintext information).

**P-002 — Defense in Depth**
Layer multiple independent security controls so that failure of any single control does not compromise the system. Example: network firewall + host firewall + WAF + application input validation + output encoding + SIEM alerting. No single control is a complete defense.

**P-003 — Least Privilege**
Grant principals only the permissions required for their current task. Apply to users, services, processes, API keys, and IAM roles. Least-privilege limits blast radius when credentials are compromised.

**P-004 — Key Rotation**
Cryptographic keys should be rotated on a defined schedule (or immediately on compromise suspicion). Key rotation limits the data volume encrypted under any single key and reduces exposure windows. Automate rotation via secrets managers (HashiCorp Vault, AWS Secrets Manager).

**P-005 — Certificate Transparency (CT) Monitoring**
All publicly trusted CAs must log issued certificates to append-only CT logs. Operators should monitor CT logs for unauthorized certificates issued for their domains (via crt.sh, Facebook CT Monitor). CT enforcement (via SCT in TLS handshake) detects mis-issuance.

**P-006 — Hardened TLS Configuration**
Enforce TLS 1.2 minimum (TLS 1.3 preferred), disable weak cipher suites (RC4, DES, 3DES, CBC-mode suites in TLS 1.2), require ephemeral key exchange for forward secrecy, set HSTS headers (Strict-Transport-Security), and configure OCSP stapling.

**P-007 — Secrets Management**
Never store secrets (passwords, API keys, private keys) in source code, environment variables accessible to untrusted processes, or plaintext config files. Use secrets managers (Vault, AWS Secrets Manager, Azure Key Vault) with fine-grained access control and audit logging.

**P-008 — Input Validation and Output Encoding**
Validate all inputs against allowlists (type, length, format, range) at every trust boundary. Encode outputs context-appropriately (HTML encoding, SQL parameterization, shell escaping) to prevent injection attacks (SQLi, XSS, command injection). Validation ≠ sanitization; both are needed.

**P-009 — Separation of Duties (SoD)**
Critical operations require multiple independent actors to authorize. CA key ceremonies require multiple HSM holders. Production database access requires approval workflow. SoD prevents insider threats and single points of compromise.

**P-010 — Secure Boot and Code Signing**
Ensure boot firmware, bootloader, OS kernel, and application binaries are verified against trusted signatures before execution. UEFI Secure Boot, Android Verified Boot, and Apple's chain of trust implement this. Unsigned code execution is the foundation of persistent compromise.

**P-011 — Canary Tokens and Honeypots**
Deploy realistic-looking but fake credentials, documents, or services that generate alerts when accessed. Provide early detection of lateral movement and credential stuffing with negligible false positive rates.

**P-012 — Immutable Infrastructure**
Deploy servers as immutable artifacts; instead of patching running servers, replace them with freshly built images. Reduces configuration drift, eliminates persistent footholds, and simplifies auditability. Containers and cloud AMIs support this pattern naturally.

**P-013 — Cryptographic Agility by Design**
Parameterize algorithm selection at configuration time. Decouple protocol versions from application logic. Include algorithm identifier in all stored cryptographic outputs (KDF parameters, cipher mode, key length). Enables migration when primitives are deprecated.

**P-014 — Continuous Compliance and Security Scanning**
Integrate SAST (Static Application Security Testing), SCA (Software Composition Analysis), container image scanning, and IaC security scanning into CI/CD pipelines. Make security findings blocking for critical/high severity. Continuous scanning surfaces vulnerabilities before deployment.

**P-015 — Graduated Trust for API Authentication**
Short-lived tokens (JWT with tight expiry) for stateless APIs; refresh tokens stored securely (httpOnly, Secure cookies) for session renewal; API keys scoped to minimal permissions and rotated regularly; mTLS for service-to-service authentication in zero-trust environments.

---

## 6. Anti-Patterns

**AP-001 — Rolling Your Own Cryptography**
Implementing custom cryptographic algorithms or cipher modes. Amateur implementations invariably introduce subtle flaws invisible to the implementer but exploitable by skilled adversaries. Use vetted, audited cryptographic libraries (libsodium, BoringSSL, OpenSSL, Bouncy Castle).

**AP-002 — Storing Passwords in Plaintext or with Weak Hashing**
Storing passwords as plaintext or with MD5/SHA-1 (even with salt) makes credential databases instantly exploitable upon breach. Use bcrypt, scrypt, or Argon2id with appropriate cost parameters. Pepper storage (application-layer secret added before hashing) provides additional protection.

**AP-003 — Hardcoded Secrets in Source Code**
Embedding API keys, private keys, database passwords, or other secrets directly in code commits them to version history permanently (even after deletion) and leaks them to everyone with repository access. Use secrets managers and environment-variable injection at runtime.

**AP-004 — Trusting the Client for Security Decisions**
Making authorization decisions based on data supplied by the client (user role in JWT without server-side verification, hidden HTML fields, client-side price calculation). Clients are adversarial; all security decisions must be enforced server-side.

**AP-005 — Disabling Certificate Validation**
Bypassing TLS certificate verification (ssl_verify=False, -k flag in curl, InsecureRequestWarning suppression) to "fix" connectivity issues. This completely defeats TLS protection, enabling trivial MITM attacks. The correct fix is to provide the correct CA bundle.

**AP-006 — Using ECB Mode Encryption**
AES-ECB encrypts each 16-byte block independently, producing identical ciphertext for identical plaintext blocks. This leaks data patterns (the "ECB penguin" problem). Always use authenticated modes (GCM, CCM) or at minimum CBC with random IV.

**AP-007 — Excessive JWT Lifetime Without Revocation**
Issuing JWTs with multi-day or indefinite expiry without a revocation mechanism means compromised tokens remain valid until expiry. Use short-lived access tokens (≤15 minutes) with refresh token rotation and a revocation store for high-security applications.

**AP-008 — Ignoring Cryptographic Side Channels in Comparisons**
Using standard string equality (==) to compare MACs, passwords, or tokens leaks timing information (short-circuit comparison reveals prefix match length). Use constant-time comparison functions (hmac.compare_digest, crypto.timingSafeEqual) for all security-sensitive comparisons.

**AP-009 — Security Through Obscurity as Primary Defense**
Relying on secrecy of an algorithm, protocol, or architecture rather than mathematical hardness. Kerckhoffs's principle: a cryptosystem should be secure even if everything about the system except the key is public knowledge. Security through obscurity may be one layer but cannot be the primary defense.

**AP-010 — Neglecting Post-Quantum Migration Planning**
Continuing to deploy RSA and ECC without a PQC migration roadmap. "Harvest now, decrypt later" attacks collect ciphertext today for quantum decryption in the future. Organizations handling long-lived sensitive data must begin PQC migration before quantum computers mature.

---

## 7. Facts

**F-001** — AES-256 has a key space of 2^256 — approximately 1.16 × 10^77 keys — computationally infeasible to brute-force with any foreseeable classical computing power.

**F-002** — The original Data Encryption Standard (DES) used a 56-bit key, broken by brute force in 22 hours by the EFF's Deep Crack machine in 1999 for $250,000 in hardware.

**F-003** — SHA-256 produces a 256-bit (32-byte) digest; SHA-512 produces a 512-bit (64-byte) digest; SHA-3-256 produces a 256-bit digest using the Keccak sponge construction.

**F-004** — The birthday paradox means that collisions in an n-bit hash function become likely after approximately 2^(n/2) hashes, halving the effective security level.

**F-005** — RSA-1024 was considered insecure as of 2010; RSA-2048 is the current minimum recommendation; RSA-4096 is recommended for certificates with long validity periods.

**F-006** — Ed25519 signatures are 64 bytes, public keys are 32 bytes, and signing/verification is faster than RSA-2048 by roughly 10–100× depending on implementation.

**F-007** — TLS 1.3 (RFC 8446, 2018) reduces the handshake to 1 RTT (or 0-RTT for resumption), eliminating RSA key exchange and all export-grade cipher suites.

**F-008** — Let's Encrypt issued its one-billionth certificate in 2020 and issues approximately 200 million active certificates, making free DV TLS certificates universal.

**F-009** — The DigiNotar CA was compromised in 2011; attackers issued fraudulent certificates for google.com and 500+ other domains before detection, leading to DigiNotar's bankruptcy.

**F-010** — Certificate Transparency became mandatory for all new certificates trusted by Chrome in April 2018 via Chrome CT Policy enforcement.

**F-011** — NIST selected CRYSTALS-Kyber for key encapsulation and CRYSTALS-Dilithium, FALCON, and SPHINCS+ for digital signatures in its PQC standardization (2022–2024).

**F-012** — Shor's algorithm can factor an n-bit RSA modulus in O(n^3) quantum operations, breaking RSA and all discrete-logarithm-based systems (ECC, DH).

**F-013** — Grover's algorithm provides a quadratic speedup for searching unstructured databases, effectively halving symmetric key security: AES-256 retains 128-bit security against quantum adversaries.

**F-014** — A FIPS 140-3 Level 3 HSM must physically destroy key material upon detection of tampering (temperature extremes, voltage anomalies, physical intrusion).

**F-015** — The Heartbleed vulnerability (CVE-2014-0160) in OpenSSL allowed unauthenticated attackers to read 64 KB of server memory per request, leaking private keys, session tokens, and user data.

**F-016** — SHA-1 was practically broken for certificate collisions in 2017 (SHAttered attack, Google/CWI) with a cost of approximately $110,000 in cloud compute.

**F-017** — MD5 was fully broken for collision resistance in 2004 (Wang et al.); the Flame malware (2012) exploited MD5 to forge a valid Microsoft code-signing certificate.

**F-018** — Bcrypt was designed in 1999 with a tunable cost factor; at cost 12, bcrypt requires approximately 250 ms per hash, making offline brute-force attacks practical only at very low rates.

**F-019** — Argon2id (winner of the Password Hashing Competition, 2015) is memory-hard, resisting GPU and ASIC acceleration by requiring large amounts of RAM per hash computation.

**F-020** — PBKDF2 with HMAC-SHA256 and 600,000 iterations is NIST's 2023 recommendation for password hashing, though Argon2id is preferred where hardware constraints allow.

**F-021** — The 2013 Snowden revelations included evidence of NSA influence over the NIST SP 800-90A Dual_EC_DRBG CSPRNG, which contained a suspected backdoor; it was subsequently withdrawn.

**F-022** — Timing attacks on RSA implementations led to RSA blinding defenses: the plaintext is multiplied by a random value before decryption and divided after, masking the timing signal.

**F-023** — The Common Vulnerability Scoring System (CVSSv3) rates vulnerabilities from 0 (informational) to 10 (critical); the 2021 Log4Shell (CVE-2021-44228) received a perfect 10.0.

**F-024** — STRIDE was developed at Microsoft in 1999 by Loren Kohnfelder and Praerit Garg as a mnemonic threat classification framework.

**F-025** — Zero-trust architecture was articulated by John Kindervag at Forrester Research in 2010; NIST SP 800-207 provides the formal definition and implementation guidance.

**F-026** — OAuth 2.0 (RFC 6749) was published in 2012; the implicit grant flow, once widely used for SPAs, was deprecated in OAuth 2.1 in favor of PKCE (Proof Key for Code Exchange).

**F-027** — FIDO2 (WebAuthn + CTAP2) allows phishing-resistant hardware authentication using public-key cryptography; credentials are bound to the relying party origin, preventing credential reuse across sites.

**F-028** — The longest known factored RSA number (RSA-250) has 250 decimal digits (829 bits) and was factored in February 2020 using approximately 2700 CPU core-years.

**F-029** — AES-GCM uses a 96-bit nonce; nonce reuse under the same key is catastrophic: two ciphertexts with the same nonce allow XOR-cancellation of the keystream and forgery of authentication tags.

**F-030** — ChaCha20-Poly1305 was designed by Daniel Bernstein; it avoids timing vulnerabilities inherent in AES implementations that lack hardware AES-NI instructions, making it preferred for mobile and embedded systems.

**F-031** — HTTPS adoption on the web crossed 95% of page loads in Chrome by 2023, up from approximately 40% in 2014, largely driven by Let's Encrypt and browser security indicators.

**F-032** — SSH (Secure Shell, RFC 4253) uses a hybrid cryptosystem: key exchange (ECDH or DH) for session key agreement, symmetric cipher (AES-CTR, ChaCha20-Poly1305) for bulk data, and HMAC or AEAD for integrity.

**F-033** — The WannaCry ransomware (2017) spread via EternalBlue, an NSA-developed exploit for CVE-2017-0144 (SMBv1 buffer overflow), affecting 200,000 systems in 150 countries within 4 days.

**F-034** — A rainbow table precomputes hash inversions for a defined input space; salting passwords (appending a unique random value before hashing) makes rainbow tables per-user prohibitively expensive.

**F-035** — Differential Power Analysis (DPA) was demonstrated by Paul Kocher et al. in 1998, showing that statistical analysis of power traces from embedded cryptographic hardware could recover keys.

**F-036** — Spectre (CVE-2017-5753) and Meltdown (CVE-2017-5754), disclosed in January 2018, exploited CPU speculative execution to leak data across process and privilege boundaries.

**F-037** — The NSA's Suite B cryptography (now Commercial National Security Algorithm Suite, CNSA) specifies AES-256, SHA-384, ECDH P-384, ECDSA P-384, and RSA-3072 for protecting classified information at SECRET and above.

**F-038** — Quantum Key Distribution (BB84 protocol) was proposed by Bennett and Brassard in 1984; commercial QKD systems operate at distances up to ~100 km over fiber or ~1,200 km via satellite relay.

**F-039** — Intel SGX enclaves were broken by multiple side-channel attacks (Foreshadow, Plundervolt, SGAxe); SGX is deprecated on client Intel processors as of the 12th generation (Alder Lake).

**F-040** — The OWASP Top 10 (2021 edition) ranks Cryptographic Failures (formerly Sensitive Data Exposure) as #2, reflecting the prevalence of weak or absent encryption protecting sensitive data.

**F-041** — Elliptic Curve Diffie-Hellman on Curve25519 (X25519) was designed by Daniel Bernstein in 2006 to avoid potential backdoors in NIST P-curves and is now the default in TLS 1.3, SSH, and Signal.

**F-042** — PGP (Pretty Good Privacy) was created by Phil Zimmermann in 1991; its source code was exported as a printed book to circumvent US cryptography export regulations, which classified encryption as munitions.

**F-043** — Signal Protocol (Double Ratchet + X3DH) provides end-to-end encryption with forward secrecy and break-in recovery (future secrecy); it underlies WhatsApp, Signal, and Facebook Messenger Secret Conversations.

**F-044** — The NVD (National Vulnerability Database) contains over 250,000 CVE entries as of 2024; MITRE Corporation manages CVE assignment and coordinates with 275+ CVE Numbering Authorities (CNAs).

**F-045** — GDPR Article 32 requires "appropriate technical measures" including encryption of personal data; failure to encrypt breached data is treated as an aggravating factor in enforcement decisions.

**F-046** — The FIPS 197 standard (2001) officially standardized AES, selecting Rijndael from 15 candidate ciphers submitted globally following a 3-year public competition.

**F-047** — Shamir's Secret Sharing (1979) splits a secret into n shares such that any k shares reconstruct it, but k−1 shares reveal nothing. Used for CA key ceremonies, multi-party key recovery, and disaster recovery.

**F-048** — The Internet's BGP (Border Gateway Protocol) lacks built-in authentication; BGP hijacking (e.g., Pakistan Telecom's 2008 YouTube blackout) remains a systemic risk; RPKI (Resource Public Key Infrastructure) is the developing mitigation.

**F-049** — Supply chain attacks (SolarWinds 2020, 3CX 2023, XZ Utils 2024) compromise build pipelines or dependencies to distribute malicious code through trusted update channels, demonstrating that signed artifacts do not guarantee supply chain integrity without build reproducibility and SBOM.

**F-050** — Fully Homomorphic Encryption (FHE) is still 10,000–1,000,000× slower than plaintext computation for practical circuits; IBM, Microsoft, and Google maintain active FHE research programs targeting practical acceleration.

**F-051** — NIST SP 800-63B (Digital Identity Guidelines) prohibits SMS OTP as a sole second factor for high-assurance authentication due to SIM swapping vulnerabilities, recommending FIDO2 hardware authenticators.

**F-052** — Certificate pinning associates a server's expected public key or certificate hash in the client application, preventing MITM even with a validly signed certificate from a compromised or rogue CA.

**F-053** — The Diffie-Hellman key exchange (1976) by Whitfield Diffie and Martin Hellman is the foundational public-key concept; Ralph Merkle independently developed puzzle-based key exchange; GCHQ's classified prior discovery by Ellis, Cocks, and Williamson was declassified in 1997.

**F-054** — Side-channel attacks on ECDSA using biased nonces (Sony PlayStation 3, 2010) allowed full private key recovery from approximately 200 signatures because the nonce k was set to a constant value.

**F-055** — The Tor network uses layered onion encryption (three layers of AES-CTR encryption for three relays) to provide anonymity; each relay decrypts one layer, and no single relay knows both origin and destination.

---

*Pack ID: AXIOM-KP-T3-001 | Invariants satisfied: Determinism, Identity Primacy, Safety Dominance (no offensive content), Governance Supremacy, Physical Realism, Domain Integrity, Abstraction Coherence, Semantic Graph Consistency, Ontology Alignment, Safety-First Failure*
