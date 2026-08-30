import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";

const app = express();
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ALLOWED_ORIGIN = process.env.APP_URL;
const PORT = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use((req, res, next) => {
  if (!IS_PRODUCTION || !ALLOWED_ORIGIN) return next();
  const origin = req.headers.origin;
  if (!origin || origin === ALLOWED_ORIGIN) return next();
  return res.status(403).json({ error: "Origin not allowed" });
});
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(express.json({ limit: "256kb" }));

// In-memory session cache for server key state verification
const activeHandshakeSessions = new Map<string, any>();
const MAX_HANDSHAKE_SESSIONS = 1000;
const HANDSHAKE_TTL_MS = 10 * 60 * 1000;

function pruneHandshakeSessions() {
  const cutoff = Date.now() - HANDSHAKE_TTL_MS;
  for (const [id, session] of activeHandshakeSessions) {
    if (Date.parse(session.createdAt) < cutoff) activeHandshakeSessions.delete(id);
  }
  while (activeHandshakeSessions.size >= MAX_HANDSHAKE_SESSIONS) {
    const oldest = activeHandshakeSessions.keys().next().value;
    if (!oldest) break;
    activeHandshakeSessions.delete(oldest);
  }
}

// Helper for HKDF-SHA256 in Node.js
function nodeHKDF(ecdhSecret: Buffer, pqSecret: Buffer, infoStr: string): Buffer {
  const combined = Buffer.concat([ecdhSecret, pqSecret]);
  return crypto.hkdfSync("sha256", combined, Buffer.alloc(32), Buffer.from(infoStr), 32) as Buffer;
}

// -------------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------------

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "QuantumShield Research Security Server",
    timestamp: new Date().toISOString(),
    cryptoEngine: "Node crypto X25519 + HKDF-SHA256; PQC handshake is currently a simulation and not a verified ML-KEM implementation",
    pqcStatus: "simulation_not_production_verified",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// 2. Server-side PQC Key Exchange endpoint
app.post("/api/pqc/handshake", (req, res) => {
  try {
    const { clientX25519Hex, clientMLKEMHex, action, sessionId } = req.body;

    if (action === "initiate") {
      pruneHandshakeSessions();
      if (clientX25519Hex && !/^[0-9a-fA-F]{64}$/.test(clientX25519Hex)) {
        return res.status(400).json({ error: "clientX25519Hex must be exactly 32 bytes encoded as hex" });
      }
      if (clientMLKEMHex && !/^[0-9a-fA-F]+$/.test(clientMLKEMHex)) {
        return res.status(400).json({ error: "clientMLKEMHex must be hexadecimal when supplied" });
      }
      const newSessionId = sessionId || `pqc_sess_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      
      // Server generates ECDH (X25519) keypair
      const serverECDH = crypto.generateKeyPairSync("x25519");
      const serverX25519Public = serverECDH.publicKey.export({ type: "spki", format: "der" });
      const serverX25519PublicRaw = serverX25519Public.subarray(-32); // Extract 32-byte raw curve point

      // Placeholder PQ-shaped data for demonstration only. This is NOT ML-KEM encapsulation.
      const pqSharedSecret = crypto.randomBytes(32);
      const pqCiphertext = crypto.randomBytes(1088);
      
      // Embed client key prefix & secret into ciphertext for state binding simulation
      if (clientMLKEMHex && clientMLKEMHex.length >= 32) {
        pqCiphertext.set(pqSharedSecret.subarray(0, 16), 0);
        const clientPrefix = Buffer.from(clientMLKEMHex.substring(0, 32), "hex");
        pqCiphertext.set(clientPrefix, 16);
      }

      // Compute real X25519 ECDH shared secret when a valid client key is provided.
      // Do not fabricate a fallback secret if the client key is invalid.
      let ecdhSecret: Buffer;
      if (clientX25519Hex && clientX25519Hex.length === 64) {
        try {
          const clientKeyDer = Buffer.concat([
            Buffer.from("302a300506032b656e032100", "hex"),
            Buffer.from(clientX25519Hex, "hex")
          ]);
          const clientPubKeyObj = crypto.createPublicKey({ key: clientKeyDer, format: "der", type: "spki" });
          ecdhSecret = crypto.diffieHellman({
            privateKey: serverECDH.privateKey,
            publicKey: clientPubKeyObj
          });
        } catch (e) {
          return res.status(400).json({ error: "Invalid X25519 public key" });
        }
      } else {
        return res.status(400).json({ error: "clientX25519Hex is required for the X25519 handshake" });
      }

      // HKDF Key Derivation on server
      const serverDerivedKey = nodeHKDF(ecdhSecret, pqSharedSecret, "QuantumShield-X25519-DEMO-PQ-HKDF-SHA256");

      activeHandshakeSessions.set(newSessionId, {
        sessionId: newSessionId,
        createdAt: new Date().toISOString(),
        clientX25519Hex,
        clientMLKEMHex,
        serverX25519Hex: serverX25519PublicRaw.toString("hex"),
        serverCiphertextMLKEM: pqCiphertext.toString("hex"),
        serverDerivedKeyHex: serverDerivedKey.toString("hex"),
        status: "demonstration_established"
      });

      return res.json({
        sessionId: newSessionId,
        serverX25519Hex: serverX25519PublicRaw.toString("hex"),
        serverCiphertextMLKEMHex: pqCiphertext.toString("hex"),
        status: "demonstration_key_exchange",
        protocol: "X25519 + placeholder PQ test data + HKDF-SHA256 (NOT ML-KEM)",
        pqcStatus: "simulation_not_production_verified",
        quantumBits: null,
        classicalBits: 256
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err: any) {
    console.error("Error in PQC Handshake:", err);
    res.status(500).json({ error: err.message || "Failed to execute PQC handshake" });
  }
});

// 3. Cryptographic Benchmark Data API
app.get("/api/pqc/benchmark", (req, res) => {
  res.json({
    benchmarkStatus: "REFERENCE_DATA_ONLY",
    statusNote: "Values in this endpoint are informational UI reference data, not measurements from the current server or proof of production cryptographic performance.",
    metrics: [
      {
        algorithm: "RSA-2048",
        category: "Classical RSA",
        publicKeySize: 256,
        privateKeySize: 1184,
        ciphertextOverhead: 256,
        handshakeTimeMs: 14.2,
        quantumSecurityBits: 0,
        classicalSecurityBits: 112,
        nistStatus: "CLASSICAL_REFERENCE — verify current migration guidance independently",
        shorVulnerable: true
      },
      {
        algorithm: "RSA-4096",
        category: "Classical RSA",
        publicKeySize: 512,
        privateKeySize: 2352,
        ciphertextOverhead: 512,
        handshakeTimeMs: 92.5,
        quantumSecurityBits: 0,
        classicalSecurityBits: 128,
        nistStatus: "Deprecating",
        shorVulnerable: true
      },
      {
        algorithm: "ECDH Secp256r1",
        category: "Classical ECC",
        publicKeySize: 64,
        privateKeySize: 32,
        ciphertextOverhead: 64,
        handshakeTimeMs: 0.8,
        quantumSecurityBits: 0,
        classicalSecurityBits: 128,
        nistStatus: "CLASSICAL_REFERENCE — verify current migration guidance independently",
        shorVulnerable: true
      },
      {
        algorithm: "X25519",
        category: "Classical ECC",
        publicKeySize: 32,
        privateKeySize: 32,
        ciphertextOverhead: 32,
        handshakeTimeMs: 0.4,
        quantumSecurityBits: 0,
        classicalSecurityBits: 128,
        nistStatus: "Disallowed Post-2030",
        shorVulnerable: true
      },
      {
        algorithm: "ML-KEM-768",
        category: "NIST PQC",
        publicKeySize: 1184,
        privateKeySize: 2400,
        ciphertextOverhead: 1088,
        handshakeTimeMs: 1.1,
        quantumSecurityBits: 192,
        classicalSecurityBits: 192,
        nistStatus: "NIST FIPS 203 algorithm reference; this server does not implement verified ML-KEM",
        implementationStatus: "NOT_IMPLEMENTED_IN_CURRENT_HANDSHAKE",
        shorVulnerable: null
      },
      {
        algorithm: "X25519 + ML-KEM-768 Hybrid",
        category: "Hybrid PQC",
        publicKeySize: 1216,
        privateKeySize: 2432,
        ciphertextOverhead: 1120,
        handshakeTimeMs: 1.5,
        quantumSecurityBits: 192,
        classicalSecurityBits: 256,
        nistStatus: "HYBRID_DESIGN_REFERENCE — requires a real ML-KEM implementation and protocol review",
        implementationStatus: "NOT_IMPLEMENTED_IN_CURRENT_HANDSHAKE",
        shorVulnerable: null
      }
    ]
  });
});

// 4. Quantum Key Analyzer
app.post("/api/pqc/analyze-keys", (req, res) => {
  const { algorithm, keySize } = req.body;
  if (algorithm !== undefined && (typeof algorithm !== "string" || algorithm.length > 100)) {
    return res.status(400).json({ error: "algorithm must be a string of at most 100 characters" });
  }
  const alg = String(algorithm || "RSA").toUpperCase();

  if (alg.includes("RSA") || alg.includes("ECC") || alg.includes("ECDH") || alg.includes("CURVE25519")) {
    return res.json({
      algorithm,
      shorVulnerable: true,
      estimatedQuantumBreakTime: "Polynomial Time O((log N)^3) on Cryptographically Relevant Quantum Computers (CRQC)",
      nistCompliance: "CLASSICAL ALGORITHM DETECTED — migration requirements depend on the applicable policy and use case",
      riskLevel: "CRITICAL",
      impact: "Store Now, Decrypt Later (SNDL) attacks threaten long-term confidentiality of recorded traffic.",
      recommendedReplacement: "Evaluate a reviewed hybrid migration design appropriate to the deployed protocol and applicable standards"
    });
  }

  const isKnownPqc = alg.includes("ML-KEM") || alg.includes("ML-DSA") || alg.includes("SLH-DSA");
  if (isKnownPqc) {
    return res.json({
      algorithm,
      shorVulnerable: false,
      estimatedQuantumBreakTime: "Not applicable: this endpoint does not prove implementation security.",
      nistCompliance: "Algorithm family recognized as a NIST PQC standard; implementation compliance must be independently verified.",
      riskLevel: "REVIEW_REQUIRED",
      impact: "Algorithm naming alone is not evidence that the deployed implementation is quantum-safe.",
      recommendedReplacement: "Verify the concrete implementation, parameters, key handling and protocol integration."
    });
  }

  return res.json({
    algorithm,
    shorVulnerable: null,
    estimatedQuantumBreakTime: "Unknown without algorithm-specific analysis",
    nistCompliance: "UNKNOWN / NOT VERIFIED",
    riskLevel: "REVIEW_REQUIRED",
    impact: "The analyzer cannot infer post-quantum security merely because an algorithm is not RSA or ECC.",
    recommendedReplacement: "Provide the exact cryptographic primitive and implementation details for review."
  });
});

// 5. AI Cryptographic Audit using Gemini API
app.post("/api/ai/crypto-audit", async (req, res) => {
  try {
    const { codeOrConfig, systemName } = req.body;
    if (typeof codeOrConfig !== "string" || codeOrConfig.length === 0 || codeOrConfig.length > 100000) {
      return res.status(400).json({ error: "codeOrConfig must be a string of at most 100000 characters" });
    }
    if (systemName !== undefined && (typeof systemName !== "string" || systemName.length > 200)) {
      return res.status(400).json({ error: "systemName must be a string of at most 200 characters" });
    }

    // If GEMINI_API_KEY is missing, return the offline fallback audit instead of an error so the endpoint works without paid API access.
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY environment variable is missing — returning offline fallback audit.");

      const isRsaOrEcc = /RSA|ECDH|ECDSA|Secp|Prime|TLSv1\.2/i.test(codeOrConfig || "");
      const hasExplicitPqc = /ML-KEM|ML-DSA|SLH-DSA|FIPS 203|FIPS 204|FIPS 205/i.test(codeOrConfig || "");
      const fallbackAudit = {
        overallRiskScore: isRsaOrEcc ? 92 : hasExplicitPqc ? 40 : 50,
        riskLevel: isRsaOrEcc ? "CRITICAL" : hasExplicitPqc ? "REVIEW_REQUIRED" : "UNKNOWN",
        summary: isRsaOrEcc
          ? "The analyzed configuration relies on classical RSA/ECC public-key primitives vulnerable to Shor's algorithm on Cryptographically Relevant Quantum Computers (CRQCs). Recorded ciphertext may be decrypted once large-scale quantum hardware is available."
          : hasExplicitPqc
          ? "The input references post-quantum primitives, but this offline heuristic cannot verify implementation correctness or compliance."
          : "The offline heuristic could not determine the cryptographic posture from the supplied input.",
        vulnerabilities: isRsaOrEcc
          ? [
              {
                title: "Shor's Algorithm Public-Key Break",
                description: "Classical RSA / ECDHE key exchange relies on discrete logarithms and integer factorization, easily broken by Shor's algorithm in polynomial time.",
                severity: "CRITICAL",
                affectedStandard: "NIST SP 800-52 Rev 2 Deprecated"
              },
              {
                title: "Store-Now-Decrypt-Later (SNDL) Exposure",
                description: "Adversaries passively recording current encrypted sessions will decrypt them retroactively as soon as a quantum computer with sufficient logical qubits becomes available.",
                severity: "HIGH",
                affectedStandard: "NIST IR 8547 PQC Transition"
              }
            ]
          : [],
        recommendations: [
          {
            action: "Deploy Hybrid X25519 + ML-KEM-768 Key Exchange",
            details: "Upgrade TLS endpoint to OpenSSL 3.4 or BoringSSL supporting ML-KEM-768 (FIPS 203) alongside classical X25519.",
            targetStandard: "NIST FIPS 203",
            codeSnippet: `// OpenSSL 3.4 / Nginx Post-Quantum TLS 1.3 Configuration\nssl_protocols TLSv1.3;\nssl_conf_command Groups X25519MLKEM768:X25519;`
          }
        ],
        aiAnalysis: "Fallback offline audit generated while Gemini API is not configured. Transition to NIST FIPS 203 ML-KEM-768 is strongly recommended prior to 2030."
      };

      return res.json(fallbackAudit);
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `
You are an expert Post-Quantum Cryptography (PQC) Security Auditor specializing in NIST FIPS 203 (ML-KEM / Kyber), FIPS 204 (ML-DSA / Dilithium), FIPS 205 (SLH-DSA), and hybrid key exchange migra[...]

Perform a comprehensive Quantum Readiness & Cryptographic Migration Audit for the following system configuration or code snippet:

System/Context Name: "${systemName || "Enterprise Infrastructure"}"
Config/Code Snippet:
\`\`\`
${codeOrConfig || "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 / RSA 2048 / Secp256r1"}
\`\`\`

Provide a structured response in valid JSON with these exact fields:
1. "overallRiskScore": integer (0 to 100, where 100 is maximum quantum risk)
2. "riskLevel": string ("CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "QUANTUM_SAFE")
3. "summary": string (Concise 2-sentence assessment of quantum vulnerability and Store-Now-Decrypt-Later threats)
4. "vulnerabilities": array of objects { "title": string, "description": string, "severity": string, "affectedStandard": string }
5. "recommendations": array of objects { "action": string, "details": string, "targetStandard": string, "codeSnippet": string }
6. "aiAnalysis": string (Detailed technical markdown commentary on Shor's algorithm impact, lattice-based cryptography migration timeline, and TLS 1.3 / OpenSSL 3.4 PQC configuration advice)

Respond ONLY with valid JSON, no markdown code fence blocks surrounding the outer JSON.
`;

    // Attempt generation with fallback model aliases if high-demand/503 errors occur
    const candidateModels = [
      ...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []),
      "gemini-flash-latest"
    ];
    let lastError: any = null;
    let responseText: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response?.text) {
          responseText = response.text;
          break;
        }
      } catch (e: any) {
        console.warn(`Model ${modelName} failed or busy (${e.message}), attempting fallback...`);
        lastError = e;
      }
    }

    if (responseText) {
      // Clean up potential markdown wrapper codeblocks if model returned them
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7);
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.substring(3);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }

      const auditData = JSON.parse(cleanedText.trim());
      return res.json(auditData);
    }

    // Fallback response if all AI models are temporarily busy (503 high demand)
    const isRsaOrEcc = /RSA|ECDH|ECDSA|Secp|Prime|TLSv1\.2/i.test(codeOrConfig || "");
    const hasExplicitPqc = /ML-KEM|ML-DSA|SLH-DSA|FIPS 203|FIPS 204|FIPS 205/i.test(codeOrConfig || "");
    const fallbackAudit = {
      overallRiskScore: isRsaOrEcc ? 92 : hasExplicitPqc ? 40 : 50,
      riskLevel: isRsaOrEcc ? "CRITICAL" : "REVIEW_REQUIRED",
      summary: isRsaOrEcc
        ? "The analyzed configuration relies on classical RSA/ECC public-key primitives vulnerable to Shor's algorithm on Cryptographically Relevant Quantum Computers (CRQCs). Recorded ciphertext[...]
        : hasExplicitPqc
          ? "The input references post-quantum primitives, but the fallback cannot verify implementation correctness, deployment, or compliance."
          : "The fallback could not determine the cryptographic posture from the supplied input.",
      vulnerabilities: isRsaOrEcc ? [
        {
          title: "Shor's Algorithm Public-Key Break",
          description: "Classical RSA / ECDHE key exchange relies on discrete logarithms and integer factorization, easily broken by Shor's algorithm in polynomial time.",
          severity: "CRITICAL",
          affectedStandard: "NIST SP 800-52 Rev 2 Deprecated"
        },
        {
          title: "Store-Now-Decrypt-Later (SNDL) Exposure",
          description: "Adversaries passively recording current encrypted sessions will decrypt them retroactively as soon as a quantum computer with sufficient logical qubits becomes available.",
          severity: "HIGH",
          affectedStandard: "NIST IR 8547 PQC Transition"
        }
      ] : [],
      recommendations: [
        {
          action: "Deploy Hybrid X25519 + ML-KEM-768 Key Exchange",
          details: "Upgrade TLS endpoint to OpenSSL 3.4 or BoringSSL supporting ML-KEM-768 (FIPS 203) alongside classical X25519.",
          targetStandard: "NIST FIPS 203",
          codeSnippet: `// OpenSSL 3.4 / Nginx Post-Quantum TLS 1.3 Configuration\nssl_protocols TLSv1.3;\nssl_conf_command Groups X25519MLKEM768:X25519;`
        }
      ],
      aiAnalysis: "Fallback offline audit generated while Gemini API is experiencing temporary server demand. Transition to NIST FIPS 203 ML-KEM-768 is strongly recommended prior to 2030."
    };

    return res.json(fallbackAudit);
  } catch (err: any) {
    console.error("Gemini AI Crypto Audit Error:", err);
    res.status(500).json({
      error: "Failed to generate AI Cryptographic Audit",
      details: err.message
    });
  }
});

// -------------------------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// -------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[QuantumShield Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
