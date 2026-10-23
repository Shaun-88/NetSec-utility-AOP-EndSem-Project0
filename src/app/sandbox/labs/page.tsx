"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Lock,
  Mail,
  Server,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Play,
  Volume2,
  VolumeX,
  Key,
  ExternalLink,
  Copy,
  Check,
  Search,
  HelpCircle,
  Terminal,
  ChevronDown,
  ChevronUp,
  Zap,
  Sparkles,
  RefreshCw,
  Globe,
  Shield,
  Layers,
  Flame,
  Database,
  Activity,
  Home,
  Award,
} from "lucide-react";
import { startAmbientScore, stopAmbientScore, isAmbientPlaying } from "@/utils/audio";

// --- AUDIO FEEDBACK ---
let sharedLabsAudioCtx: AudioContext | null = null;
const playLabsSound = (type: "click" | "success" | "error" | "scan" | "victory") => {
  if (typeof window === "undefined") return;
  try {
    if (!sharedLabsAudioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
      if (AudioContextClass) sharedLabsAudioCtx = new AudioContextClass();
    }
    if (sharedLabsAudioCtx && sharedLabsAudioCtx.state === "suspended") {
      sharedLabsAudioCtx.resume().catch(() => {});
    }
    if (!sharedLabsAudioCtx) return;
    const ctx = sharedLabsAudioCtx;
    const now = ctx.currentTime;

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "success") {
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.25);
      });
    } else if (type === "error") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(110, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "scan") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "victory") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.18, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.4);
      });
    }
  } catch {}
};

// --- LAB 1: FORENSIC REPORT & SCENARIO TYPES ---
export interface ForensicReport {
  url: string;
  hostname: string;
  threatScore: number; // 0 to 100
  threatLevel: "CRITICAL MALICIOUS PHISHING" | "HIGH RISK" | "SUSPICIOUS / ELEVATED RISK" | "VERIFIED SAFE / CLEAN";
  domainAge: string;
  registrar: string;
  typosquatting: string;
  tldRisk: string;
  payloadType: string;
  spfDkimAlignment: string;
  verdictSummary: string;
  keyRedFlags: string[];
}

interface EmailScenario {
  id: number;
  subject: string;
  senderName: string;
  senderEmail: string;
  returnPath: string;
  isPhishing: boolean;
  spfDkim: string;
  bodyText: string;
  visibleLink: string;
  hiddenActualLink: string;
  redFlags: string[];
  hints: string[];
  forensicReport: ForensicReport;
}

const PHISHING_SCENARIOS: EmailScenario[] = [
  {
    id: 1,
    subject: "URGENT: Your Corporate Cloud Account Has Been Suspended",
    senderName: "IT Security Helpdesk",
    senderEmail: "admin@corp-cloud-security-portal.xyz",
    returnPath: "bounce@mailer-spam-relay.ru",
    isPhishing: true,
    spfDkim: "SPF: FAIL | DKIM: NONE (Unauthenticated Domain)",
    bodyText:
      "Dear User,\n\nWe detected unauthorized access attempts on your corporate identity. Your account will be terminated in 2 hours unless you re-authenticate immediately.\n\nClick the portal below to unlock your credentials.",
    visibleLink: "https://identity.company.com/verify-account",
    hiddenActualLink: "https://auth-phish-capture.xyz/login.php?user=target",
    redFlags: [
      "Deceptive TLD (.xyz) disguised as corporate IT",
      "SPF & DKIM authentication failed",
      "Mismatch: Link text says identity.company.com but leads to auth-phish-capture.xyz",
      "Artificial 2-hour panic urgency",
    ],
    hints: [
      "Header discrepancy: Bounce address (Return-Path) routes to an untrusted Russian relay (.ru), completely unrelated to your corporate IT.",
      "Anchor Text trap: The text in blue says 'identity.company.com', but the underlying hyperlink destination routes to 'auth-phish-capture.xyz'.",
      "Cryptographic failure: SPF is FAIL and DKIM is NONE, proving this email was sent from an unverified server without company authorization.",
    ],
    forensicReport: {
      url: "https://auth-phish-capture.xyz/login.php?user=target",
      hostname: "auth-phish-capture.xyz",
      threatScore: 96,
      threatLevel: "CRITICAL MALICIOUS PHISHING",
      domainAge: "3 days old (Registered via PrivacyShield Ltd)",
      registrar: "NameCheap Inc. (Proxy Protection Active)",
      typosquatting: "High-risk mimicry: Combines corporate keywords with generic disposable .xyz TLD",
      tldRisk: "CRITICAL (.xyz is among top TLDs abused in automated credential harvesting)",
      payloadType: "Credential Harvester (Simulated phishing login page extracting usernames, passwords & MFA session tokens)",
      spfDkimAlignment: "FAILED: Sending mail server is not authorized by domain MX records",
      verdictSummary:
        "UNSAFE & MALICIOUS: This URL routes to a 3-day-old disposable domain hosting an adversary login harvesting form. The email fails SPF/DKIM authentication and disguises the true destination behind legitimate-looking anchor text.",
      keyRedFlags: [
        "Domain age is under 5 days old (common disposable phishing infrastructure)",
        "Anchor text discrepancy: visible domain differs from actual destination",
        "SPF & DKIM cryptographic failure on outbound MTA",
        "Credential submission query parameter detected (?user=target)",
      ],
    },
  },
  {
    id: 2,
    subject: "NetSec Armoury: Diagnostic Scan Report Ready (#014)",
    senderName: "NetSec Armoury Automated Telemetry",
    senderEmail: "reports@netsec-armoury.org",
    returnPath: "reports@netsec-armoury.org",
    isPhishing: false,
    spfDkim: "SPF: PASS | DKIM: PASS (Signed by netsec-armoury.org)",
    bodyText:
      "Hello Operator,\n\nYour scheduled domain diagnostic audit has completed. No action is required. You can view your scan summary in your local session history at your convenience.",
    visibleLink: "https://netsec-armoury.org/history",
    hiddenActualLink: "https://netsec-armoury.org/history",
    redFlags: [],
    hints: [
      "Sender alignment: Sender email and Return-Path are identical and match the official production domain.",
      "Link transparency: The visible text and actual destination link match 100% with no hidden redirects.",
      "Cryptographic proof: Both SPF and DKIM report PASS with verified RSA 2048-bit digital signatures.",
    ],
    forensicReport: {
      url: "https://netsec-armoury.org/history",
      hostname: "netsec-armoury.org",
      threatScore: 0,
      threatLevel: "VERIFIED SAFE / CLEAN",
      domainAge: "Established 8+ years (Cloudflare Registrar)",
      registrar: "Cloudflare / Clean WHOIS with strict DNSSEC",
      typosquatting: "None: Verified legitimate root domain",
      tldRisk: "LOW (.org with strict registry policies)",
      payloadType: "Static Telemetry Report Dashboard (No credentials or executable downloads)",
      spfDkimAlignment: "PASS: Cryptographically signed by official domain key",
      verdictSummary:
        "SAFE & VERIFIED: This link leads directly to the official NetSec Armoury history dashboard. The domain is established, DNSSEC-signed, and cryptographic email authentication (SPF & DKIM) is verified.",
      keyRedFlags: [],
    },
  },
  {
    id: 3,
    subject: "Invoice #INV-9821 past due: Please review payment remittance",
    senderName: "Billing Accounts Dept",
    senderEmail: "billing@micr0soft-licensing-pay.com",
    returnPath: "relay99@bulkmail-hoster.net",
    isPhishing: true,
    spfDkim: "SPF: SOFTFAIL | DKIM: FAIL",
    bodyText:
      "Please find attached your overdue software licensing statement. Payment must be wire-transferred today to prevent collection agency handoff.\n\nReview payment voucher below:",
    visibleLink: "https://microsoft.com/billing/invoice-9821.pdf",
    hiddenActualLink: "https://micr0soft-licensing-pay.com/malicious-dropper.exe",
    redFlags: [
      "Typosquatting: 'micr0soft' uses zero instead of letter O",
      "Deceptive executable: Link claims to be .pdf but points to an .exe dropper",
      "Return-Path does not match legitimate Microsoft infrastructure",
    ],
    hints: [
      "Typosquatting alert: Notice the sender address and link domain use 'micr0soft' (with a number '0' instead of the letter 'o').",
      "Dangerous executable payload: The blue text says 'invoice-9821.pdf', but the actual destination URL ends in '.exe' (a Windows program binary)!",
      "Authentication relay: The email originated from 'bulkmail-hoster.net' and failed cryptographic DKIM validation.",
    ],
    forensicReport: {
      url: "https://micr0soft-licensing-pay.com/malicious-dropper.exe",
      hostname: "micr0soft-licensing-pay.com",
      threatScore: 98,
      threatLevel: "CRITICAL MALICIOUS PHISHING",
      domainAge: "11 days old (Anonymous Registrar)",
      registrar: "Tucows / Anonymous Registrar Proxy",
      typosquatting: "HOMOGLYPH TYPOSQUATTING: Substitutes digit '0' for letter 'o' to spoof Microsoft",
      tldRisk: "HIGH (Newly minted typosquat domain registered for malicious distribution)",
      payloadType: "Windows PE Binary Executable (.exe) masquerading as an Adobe PDF invoice",
      spfDkimAlignment: "FAILED: Sent via bulkmail-hoster.net with DKIM signature failure",
      verdictSummary:
        "CRITICAL MALWARE & SPOOFING DANGER: This domain is a typosquat of Microsoft using a zero in place of 'o'. The payload is an executable binary (.exe) masked as a PDF document. If run, this payload installs a remote trojan or ransomware dropper on the host.",
      keyRedFlags: [
        "Homoglyph spoofing: 'micr0soft' replaces letter 'O' with digit '0'",
        "Executable masquerade: Hyperlink leads to .exe binary disguised as .pdf",
        "Return-Path routes to third-party bulk relay server",
        "SPF Softfail and complete DKIM signature failure",
      ],
    },
  },
  {
    id: 4,
    subject: "URGENT: Payroll Direct Deposit Re-verification Required for Q4",
    senderName: "Corporate HR & Payroll Services",
    senderEmail: "payroll-benefits@wellsfarg0-corporate-pay.com",
    returnPath: "bounce@phish-bulletproof-mta.ru",
    isPhishing: true,
    spfDkim: "SPF: FAIL | DKIM: NONE (Unauthenticated Domain)",
    bodyText:
      "Attention Employee,\n\nDue to updated anti-fraud banking regulations, all salaried staff must re-link their direct deposit account numbers before 5:00 PM today. Unverified accounts will experience delayed compensation.\n\nUpdate your direct deposit credentials below:",
    visibleLink: "https://wellsfargo.com/workplace/payroll-deposit",
    hiddenActualLink: "https://wellsfarg0-corporate-pay.com/verify-banking.php?emp=9812",
    redFlags: [
      "Homoglyph typosquatting: 'wellsfarg0' replaces letter O with number 0",
      "Anchor text deception: Link displays wellsfargo.com but leads to wellsfarg0-corporate-pay.com",
      "Return-path bounce routes to bulletproof .ru spam relay",
      "Manufactured end-of-day deadline to induce panic",
    ],
    hints: [
      "Look at the bank spelling: The domain substitutes a digit '0' for the letter 'o' in 'wellsfarg0'.",
      "Inspect the actual destination: The anchor text promises the official bank, but the actual URL directs to a harvesting script.",
      "Return-Path reconnaissance: Bounced notifications route to an untrusted overseas spam relay (.ru).",
    ],
    forensicReport: {
      url: "https://wellsfarg0-corporate-pay.com/verify-banking.php?emp=9812",
      hostname: "wellsfarg0-corporate-pay.com",
      threatScore: 95,
      threatLevel: "CRITICAL MALICIOUS PHISHING",
      domainAge: "2 days old (Newly registered via WhoisGuard)",
      registrar: "Porkbun LLC / Anonymous Proxy",
      typosquatting: "HOMOGLYPH FRAUD: Spoofs Wells Fargo using number 0 in 'wellsfarg0'",
      tldRisk: "HIGH (Newly registered domain registered for financial wire fraud)",
      payloadType: "Financial Harvester (Steals bank routing numbers, account credentials & SSN)",
      spfDkimAlignment: "FAILED: MTA fails SPF and DKIM signatures",
      verdictSummary:
        "HIGH SEVERITY FINANCIAL PHISHING: This domain is a 2-day-old typosquat designed to impersonate Wells Fargo and harvest employee bank account numbers and credentials. It fails SPF authentication and exploits urgency tactics.",
      keyRedFlags: [
        "Homoglyph spoofing: 'wellsfarg0' with digit zero",
        "Anchor text divergence: visible link is fake",
        "Domain age is 2 days old",
        "Credential query parameter detected (?emp=9812)",
      ],
    },
  },
  {
    id: 5,
    subject: "NetSec Armoury: Annual Enterprise VPN Certificate Renewal",
    senderName: "NetSec Armoury Global Operations",
    senderEmail: "sec-ops@netsec-armoury.org",
    returnPath: "sec-ops@netsec-armoury.org",
    isPhishing: false,
    spfDkim: "SPF: PASS | DKIM: PASS (2048-bit RSA Signed)",
    bodyText:
      "Hello Team,\n\nThe root certificate for our internal developer gateway has been renewed. Your local NetSec client will automatically ingest the new public key. If you experience connection latency, you may inspect the public CRL list at your convenience.\n\nGateway status page:",
    visibleLink: "https://netsec-armoury.org/vpn/gateway-status",
    hiddenActualLink: "https://netsec-armoury.org/vpn/gateway-status",
    redFlags: [],
    hints: [
      "Sender and Return-Path consistency: Both fields precisely match the official netsec-armoury.org domain.",
      "Link integrity: The destination URL and visible link text are 100% identical and resolve over HTTPS.",
      "Cryptographic validation: SPF and DKIM report PASS with verified 2048-bit domain signatures.",
    ],
    forensicReport: {
      url: "https://netsec-armoury.org/vpn/gateway-status",
      hostname: "netsec-armoury.org",
      threatScore: 0,
      threatLevel: "VERIFIED SAFE / CLEAN",
      domainAge: "Established 8+ years (Cloudflare Registrar)",
      registrar: "Cloudflare / Strict DNSSEC Enabled",
      typosquatting: "None: Verified legitimate production root domain",
      tldRisk: "LOW (.org with strict organizational registry verification)",
      payloadType: "Gateway Status Page (Read-only infrastructure telemetry)",
      spfDkimAlignment: "PASS: Cryptographically signed by official domain key",
      verdictSummary:
        "SAFE & VERIFIED: This link leads directly to an official NetSec Armoury gateway status page. Domain age, cryptographic SPF/DKIM keys, and link alignment are fully authenticated with zero anomalies.",
      keyRedFlags: [],
    },
  },
];

// Heuristic URL Forensic Scanner Engine
function evaluateUrlForensics(inputUrl: string, scenario: EmailScenario): ForensicReport {
  const trimmed = inputUrl.trim();
  if (!trimmed || trimmed === scenario.hiddenActualLink) {
    return scenario.forensicReport;
  }
  for (const s of PHISHING_SCENARIOS) {
    if (trimmed === s.hiddenActualLink) {
      return s.forensicReport;
    }
  }

  // Dynamic heuristic parsing for any custom entered URL
  let parsed: URL | null = null;
  try {
    parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {}

  const host = parsed ? parsed.hostname.toLowerCase() : trimmed.toLowerCase();
  const path = parsed ? parsed.pathname.toLowerCase() : "";
  const isHttps = parsed ? parsed.protocol === "https:" : trimmed.startsWith("https://");

  const flags: string[] = [];
  let score = 15; // baseline unverified

  if (!isHttps) {
    score += 25;
    flags.push("Insecure HTTP protocol: Traffic lacks TLS encryption and can be intercepted");
  }

  // Check known safe domains
  const safeList = ["google.com", "microsoft.com", "apple.com", "github.com", "amazon.com", "netsec-armoury.org"];
  const isKnownSafe = safeList.some((safe) => host === safe || host.endsWith(`.${safe}`));

  if (isKnownSafe && !host.includes("0") && !host.includes("-pay") && !host.includes("-login")) {
    return {
      url: trimmed,
      hostname: host,
      threatScore: 0,
      threatLevel: "VERIFIED SAFE / CLEAN",
      domainAge: "Established Enterprise (Verified Infrastructure)",
      registrar: "Official Certified Registrar",
      typosquatting: "None: Verified official root domain",
      tldRisk: "LOW (Major TLD with strict registry management)",
      payloadType: "Standard Web Traffic",
      spfDkimAlignment: "PASS: Valid Enterprise Security Controls",
      verdictSummary:
        "VERIFIED SAFE: This domain belongs to an established, recognized organization with active TLS and security compliance.",
      keyRedFlags: [],
    };
  }

  // Risky TLDs
  const riskyTlds = [".xyz", ".top", ".ru", ".click", ".vip", ".work", ".download", ".cc", ".tk", ".fit", ".rest"];
  if (riskyTlds.some((tld) => host.endsWith(tld))) {
    score += 30;
    flags.push("High-risk TLD: Domain uses a top-level domain frequently associated with disposable phishing hosts");
  }

  // Typosquatting heuristics
  if (
    /[0-9]/.test(host) &&
    (host.includes("micr0") ||
      host.includes("g00gle") ||
      host.includes("paypa1") ||
      host.includes("amaz0n") ||
      host.includes("app1e"))
  ) {
    score += 40;
    flags.push("Homoglyph typosquatting detected: Digits substituted for letters to impersonate recognized brand");
  }

  // Executable payload
  if (
    path.endsWith(".exe") ||
    path.endsWith(".scr") ||
    path.endsWith(".bat") ||
    path.endsWith(".vbs") ||
    path.endsWith(".iso")
  ) {
    score += 45;
    flags.push("Dangerous binary executable file extension (.exe/.scr) detected in path");
  }

  // Phishing keywords
  const keywords = [
    "login",
    "auth",
    "verify",
    "account",
    "portal",
    "secure",
    "bank",
    "invoice",
    "dropper",
    "wallet",
    "update",
    "support",
  ];
  const matchedKeywords = keywords.filter((kw) => host.includes(kw) || path.includes(kw));
  if (matchedKeywords.length > 0) {
    score += 20;
    flags.push(`Suspicious credential harvesting keywords identified: [${matchedKeywords.join(", ")}]`);
  }

  // Subdomain stacking
  const parts = host.split(".");
  if (parts.length > 3) {
    score += 20;
    flags.push("Subdomain stacking: Multiple subdomain levels detected to disguise the actual registered domain");
  }

  const finalScore = Math.min(Math.max(score, 0), 100);
  let threatLevel: ForensicReport["threatLevel"] = "VERIFIED SAFE / CLEAN";
  if (finalScore >= 75) threatLevel = "CRITICAL MALICIOUS PHISHING";
  else if (finalScore >= 50) threatLevel = "HIGH RISK";
  else if (finalScore >= 25) threatLevel = "SUSPICIOUS / ELEVATED RISK";

  return {
    url: trimmed,
    hostname: host,
    threatScore: finalScore,
    threatLevel,
    domainAge: finalScore >= 50 ? "Estimated < 30 days old (Heuristic flag)" : "Standard registration record",
    registrar: finalScore >= 50 ? "Untrusted / Disposable Privacy Registrar" : "Standard Registrar",
    typosquatting: flags.some((f) => f.includes("typosquatting"))
      ? "Brand mimicry pattern detected"
      : "No obvious brand mimicry pattern",
    tldRisk: riskyTlds.some((tld) => host.endsWith(tld)) ? "HIGH RISK TLD" : "STANDARD TLD",
    payloadType: path.endsWith(".exe")
      ? "Binary Executable Payload"
      : matchedKeywords.length > 0
      ? "Potential Credential Harvesting Form"
      : "Generic Web Page",
    spfDkimAlignment: finalScore >= 50 ? "UNVERIFIED / UNTRUSTED ORIGIN" : "UNKNOWN (EXTERNAL TEST)",
    verdictSummary:
      finalScore >= 75
        ? "CRITICAL WARNING: Heuristic analysis indicates a high probability of malicious phishing or malware delivery. Do not enter credentials or download files from this host."
        : finalScore >= 50
        ? "ELEVATED RISK: Multiple anomalous indicators detected (TLD, keywords, or protocol). Exercise extreme caution."
        : "LOW TO MODERATE RISK: No overt malicious indicators flagged, but maintain defensive scrutiny before submitting sensitive data.",
    keyRedFlags: flags,
  };
}

// --- LAB 2: CRACK-TIME & HASHCAT RIG SIMULATOR TYPES ---
export interface CrackMission {
  id: number;
  title: string;
  category: string;
  targetPassword: string;
  hashType: "NTLM" | "MD5" | "SHA-256" | "Argon2id";
  mockHash: string;
  simulatedRig: string;
  attackMethod: "Rule-Based Dictionary (best64)" | "Pure Brute-Force Keyspace" | "Credential Stuffing Replay" | "Memory-Hard Slow Hash Audit";
  timeToCrack: string;
  entropyBits: number;
  conceptSummary: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  hints: string[];
  rigTelemetry: {
    hashrate: string;
    keyspaceTested: string;
    tempC: number;
    powerW: number;
    recoveredPlaintext: string;
    status: "CRACKED" | "EXHAUSTION_FAILED" | "BYPASSED_NO_CRACK_NEEDED" | "HARDENED_RESISTANT";
  };
}

const CRACK_MISSIONS: CrackMission[] = [
  {
    id: 1,
    title: "The Illusion of Complexity: Why Leetspeak Substitutions Fail",
    category: "DICTIONARY RULE ATTACKS",
    targetPassword: "P@ssw0rd1!",
    hashType: "NTLM",
    mockHash: "$NTLM$8846f7eaee8fb117ad06bdd830b7586c",
    simulatedRig: "8x NVIDIA RTX 4090 Cluster @ 104.2 GH/s",
    attackMethod: "Rule-Based Dictionary (best64)",
    timeToCrack: "1.4 Seconds",
    entropyBits: 48,
    conceptSummary:
      "Adding symbols and digits to common dictionary words satisfies legacy complexity policies, but Hashcat rule files pre-compute these exact leetspeak mutations (@ for a, 0 for o, 1! at end) in microseconds.",
    question:
      "An employee creates 'P@ssw0rd1!'. It has 10 characters, mixed case, numbers, and symbols. Why does a standard 8x RTX 4090 rig crack it in under 2 seconds?",
    options: [
      {
        id: "A",
        text: "Attackers don't guess randomly; Hashcat runs pre-computed rule sets (e.g. best64.rule) against dictionaries, testing predictable human substitutions in microseconds.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "The exclamation mark produces a hash collision in modern GPUs.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "Passwords under 12 characters are mathematically identical to single-character pins.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "The GPU rig exploits a buffer overflow in the NTLM authentication header.",
        isCorrect: false,
      },
    ],
    explanation:
      "Human substitution habits are highly predictable. Instead of testing all 95¹⁰ combinations, Hashcat applies rules like capitalization, '@' for 'a', '0' for 'o', and suffixing '1!' to base dictionary words. A 104 GH/s cluster processes millions of these rule variations in seconds.",
    hints: [
      "Rule vs Pure Brute-Force: Attackers do not test random characters from A to Z; they modify known wordlists.",
      "Human Habits: Capitalizing the first letter, replacing 'a' with '@', and adding digits or '!' at the end are the most common patterns in breached password databases.",
      "True Entropy: Complexity without length or true randomness provides a false sense of security.",
    ],
    rigTelemetry: {
      hashrate: "104.2 GH/s",
      keyspaceTested: "14,344,392 rules applied",
      tempC: 68,
      powerW: 3450,
      recoveredPlaintext: "P@ssw0rd1!",
      status: "CRACKED",
    },
  },
  {
    id: 2,
    title: "The Length Multiplier: Exponential Keyspace Mathematics",
    category: "EXPONENTIAL KEYSPACE & PASSPHRASES",
    targetPassword: "correct-horse-battery-staple",
    hashType: "NTLM",
    mockHash: "$NTLM$c7b949219b16be4c8c2b74044ee78996",
    simulatedRig: "8x NVIDIA RTX 4090 Cluster @ 104.2 GH/s",
    attackMethod: "Pure Brute-Force Keyspace",
    timeToCrack: "3.9 x 10²⁰ Years (Infeasible)",
    entropyBits: 132,
    conceptSummary:
      "Keyspace scales exponentially with length (Pool^Length). A 28-character passphrase renders brute-force attacks mathematically impossible, even when using only lowercase characters and hyphens.",
    question:
      "Compare 'X#9!kQ2$' (8 random chars) vs 'correct-horse-battery-staple' (28 chars, lowercase words). Which resists GPU brute-force cracking longer, and why?",
    options: [
      {
        id: "A",
        text: "'correct-horse-battery-staple' because length is the exponent in keyspace calculation; 28 characters creates a keyspace of astronomical magnitude.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "'X#9!kQ2$' because special characters overload GPU vector registers and halt execution.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "Both crack in identical time because Hashcat ignores word length.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "'X#9!kQ2$' because 8 characters is the NIST recommended maximum length.",
        isCorrect: false,
      },
    ],
    explanation:
      "Total combinations equal Pool^Length. For 8 random characters, 95⁸ ≈ 6.6 × 10¹⁵ combinations—an 8x RTX 4090 cluster (104 GH/s) chews through this in under 18 hours. For 28 characters, even with just 27 symbols (a-z + hyphen), 27²⁸ ≈ 1.2 × 10⁴⁰ combinations, which would take hundreds of quintillion years to exhaust.",
    hints: [
      "The Math of Length: In Pool^Length, Length is the exponent. Doubling the length squares the keyspace.",
      "8-Char Vulnerability: An 8-character string from all printable characters can be brute-forced in less than a day by modern GPU hardware.",
      "Passphrase Power: Multi-word passphrases provide immense mathematical entropy while remaining humanly memorizable.",
    ],
    rigTelemetry: {
      hashrate: "104.2 GH/s",
      keyspaceTested: "1.20 x 10⁴⁰ keyspace capacity",
      tempC: 72,
      powerW: 3600,
      recoveredPlaintext: "UNRECOVERED [KEYSPACE EXHAUSTION REQUIRED]",
      status: "EXHAUSTION_FAILED",
    },
  },
  {
    id: 3,
    title: "The Leetspeak & Mutation Trap: Rule-Based Wordlists",
    category: "WORDLIST MUTATION ENGINES",
    targetPassword: "Tr0ub4dor&3",
    hashType: "NTLM",
    mockHash: "$NTLM$6158d601b34927cb78018bf147171e35",
    simulatedRig: "8x NVIDIA RTX 4090 Cluster @ 104.2 GH/s",
    attackMethod: "Rule-Based Dictionary (best64)",
    timeToCrack: "3.8 Seconds",
    entropyBits: 52,
    conceptSummary:
      "Single-word leetspeak passwords fail against GPU rules engines. Hashcat loads wordlists (like rockyou.txt) into GPU high-speed VRAM and applies mutations like o->0, a->4, and suffix &3 at billions of permutations per second.",
    question:
      "An operator configures 'Tr0ub4dor&3'. Hashcat cracks it in 3.8 seconds using a standard dictionary. How does Hashcat achieve this without checking all 95¹¹ combinations?",
    options: [
      {
        id: "A",
        text: "Hashcat takes the base dictionary word 'troubador' and applies automated rule transformations (s/o/0, s/a/4, $&, $3) at native GPU speeds.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "Hashcat sends an unencrypted ping to the victim's router to recover the key.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "The password is weak because it contains odd numbers.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "The GPU rig converts the hash directly into plaintext using inverse Fourier transforms.",
        isCorrect: false,
      },
    ],
    explanation:
      "Attackers never test 95¹¹ (~5.6 × 10²¹) combinations blindly. They take known dictionary nouns ('troubador') and apply permutation rules: Capitalize first letter, replace 'o' with '0', replace 'a' with '4', and append '&3'. On an 8x RTX 4090 rig, the entire rockyou dictionary with 64 rule mutations finishes in seconds.",
    hints: [
      "Base Word Detection: Notice the dictionary root noun embedded in 'Tr0ub4dor&3'—it is 'troubador'.",
      "Rule Efficiency: Testing a dictionary of 14 million words with 64 rules takes only ~900 million operations—a 104 GH/s GPU rig computes this in 0.008 seconds!",
      "Defense Rule: Combine multiple unrelated words (a passphrase) instead of leetspeak mutations on a single word.",
    ],
    rigTelemetry: {
      hashrate: "104.2 GH/s",
      keyspaceTested: "Wordlist: rockyou.txt + best64.rule",
      tempC: 70,
      powerW: 3520,
      recoveredPlaintext: "Tr0ub4dor&3",
      status: "CRACKED",
    },
  },
  {
    id: 4,
    title: "The Credential Stuffing Vector: The Danger of Password Reuse",
    category: "BREACH DATABASE RE-USE",
    targetPassword: "Valkyrie#992!",
    hashType: "SHA-256",
    mockHash: "$SHA256$2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
    simulatedRig: "Automated Botnet Sprayer (OpenBullet / SilverBullet)",
    attackMethod: "Credential Stuffing Replay",
    timeToCrack: "0.00 Seconds (Instant Bypass)",
    entropyBits: 64,
    conceptSummary:
      "Even a complex 14-character password provides ZERO protection if reused. When a third-party website is breached, attackers use automated botnets to replay the username/password pair across thousands of services.",
    question:
      "An engineer creates a strong password 'Valkyrie#992!' and uses it across their company VPN, personal email, and a gaming forum. The gaming forum suffers a data breach. What is the immediate threat?",
    options: [
      {
        id: "A",
        text: "Attackers don't bother cracking hashes; automated Credential Stuffing bots replay the leaked email and password across corporate VPNs and bank portals within minutes.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "The password is safe because corporate firewalls detect that the leak happened on a different website.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "The gaming forum database only leaks email addresses, not password credentials.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "The password is safe as long as the user doesn't log in during the weekend.",
        isCorrect: false,
      },
    ],
    explanation:
      "Over 65% of internet users reuse credentials. When attackers obtain a breached database, they extract email:password pairs and use automated stuffing tools (like OpenBullet) to test those exact combinations against Microsoft 365, AWS, GitHub, and corporate portals. No hash cracking is required—the front door is opened with the stolen key.",
    hints: [
      "Bypassing Math: Hash cracking speed is completely irrelevant when the plaintext or cracked password is published online in breach dumps.",
      "Scale of Stuffing: Botnets can test millions of breached credential pairs per hour against web login endpoints.",
      "Zero-Reuse Standard: Using a dedicated password manager to generate unique passwords for every single service is the only defense.",
    ],
    rigTelemetry: {
      hashrate: "N/A (Bypassed Hash Cracking)",
      keyspaceTested: "Database Dump: 4.2M Breached Combos",
      tempC: 42,
      powerW: 210,
      recoveredPlaintext: "Valkyrie#992! [REPLAYED FROM BREACH DUMP]",
      status: "BYPASSED_NO_CRACK_NEEDED",
    },
  },
  {
    id: 5,
    title: "Memory Hardness Defense: Why Argon2id & bcrypt Neutralize GPUs",
    category: "KEY DERIVATION & SLOW HASHES",
    targetPassword: "BigBro#Defensive2026",
    hashType: "Argon2id",
    mockHash: "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgqlqMGJGEgw",
    simulatedRig: "8x NVIDIA RTX 4090 Cluster @ 4,200 H/s (Memory Throttled)",
    attackMethod: "Memory-Hard Slow Hash Audit",
    timeToCrack: "4,600+ Years",
    entropyBits: 88,
    conceptSummary:
      "Fast hashes (MD5/NTLM) require almost zero RAM, letting GPUs test 100+ billion per second. Memory-hard algorithms like Argon2id force each attempt to allocate 32-64MB of RAM, starving GPU cores of memory and dropping speed by 24,000,000x.",
    question:
      "Why does storing passwords with Argon2id or bcrypt effectively stop 8x RTX 4090 GPU clusters, whereas MD5 or NTLM hashes are cracked in seconds?",
    options: [
      {
        id: "A",
        text: "Argon2id is memory-hard: it forces each calculation to read and write large blocks of RAM (e.g. 64MB), starving GPU CUDA cores and slashing cracking throughput from 104 billion/s down to ~4,200/s.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "Argon2id is a proprietary Nvidia protocol that shuts down RTX graphics cards if detected.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "bcrypt physically damages the memory bus of any GPU attempting brute force.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "MD5 has 512 bits of entropy while Argon2id has only 16 bits.",
        isCorrect: false,
      },
    ],
    explanation:
      "GPU brute-force power comes from parallel execution across thousands of tiny cores. However, GPUs have very limited RAM per core. Argon2id and scrypt are intentionally designed to be memory-hard: each hash operation requires 32MB to 64MB of RAM. Because an RTX 4090 only has 24GB of VRAM, it can only run a handful of parallel attempts, reducing cracking speed from billions per second to just thousands.",
    hints: [
      "GPU Hardware Limitation: A GPU has tens of thousands of compute cores, but very limited high-speed RAM per core.",
      "Fast vs Slow Hashes: MD5 was designed for fast checksums (microseconds), not password security. Argon2id was designed to be intentionally expensive to compute.",
      "Memory Hardness: Forcing high RAM usage (e.g., 64MB per hash) eliminates the hardware advantage of GPUs and ASICs.",
    ],
    rigTelemetry: {
      hashrate: "4,200 H/s (Throttled by VRAM allocation)",
      keyspaceTested: "Active VRAM: 24GB Maxed Out",
      tempC: 58,
      powerW: 1850,
      recoveredPlaintext: "UNRECOVERED [COMPUTATIONALLY INFEASIBLE]",
      status: "HARDENED_RESISTANT",
    },
  },
];

// --- LAB 3: AUTHENTICATION BYPASS & SQL INJECTION TYPES ---
export interface AuthMission {
  id: number;
  title: string;
  category: string;
  vulnerabilityType: string;
  targetEndpoint: string;
  defaultUsername: string;
  defaultPasswordOrPayload: string;
  rawSqlTemplate: string;
  constructedQueryUnsafe: string;
  constructedQuerySafe: string;
  returnedDatabaseRecord: {
    id: number | null;
    username: string;
    role: string;
    email: string;
    token: string;
  } | null;
  conceptSummary: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  hints: string[];
}

const AUTH_MISSIONS: AuthMission[] = [
  {
    id: 1,
    title: "The Tautology Bypass: Forcing Boolean Truth in WHERE Clauses",
    category: "LOGICAL TAUTOLOGY INJECTION",
    vulnerabilityType: "Unsanitized WHERE Clause String Concatenation",
    targetEndpoint: "/api/v1/auth/login",
    defaultUsername: "admin",
    defaultPasswordOrPayload: "' OR 1=1 --",
    rawSqlTemplate: "SELECT id, username, role, email FROM users WHERE username = '{USER}' AND password = '{PASS}'",
    constructedQueryUnsafe: "SELECT id, username, role, email FROM users WHERE username = 'admin' AND password = '' OR 1=1 --'",
    constructedQuerySafe: "SELECT id, username, role, email FROM users WHERE username = $1 AND password = $2 [BOUND LITERALS]",
    returnedDatabaseRecord: {
      id: 1,
      username: "admin",
      role: "SUPER_ADMINISTRATOR",
      email: "sec-ops@company.internal",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.adm_root",
    },
    conceptSummary:
      "When an application concatenates user inputs directly into SQL strings, entering '' OR 1=1 -- forces the condition to evaluate to TRUE for every single row in the database, returning the first record (usually ID 1, the Administrator).",
    question:
      "Why does entering '' OR 1=1 -- into the password field successfully grant full administrative access when raw string concatenation is used?",
    options: [
      {
        id: "A",
        text: "The boolean condition 1=1 always evaluates to TRUE for every row, and the double dash -- comments out the password check. The engine returns the first matching record (id: 1, admin).",
        isCorrect: true,
      },
      {
        id: "B",
        text: "The database crashes and automatically reboots in insecure administrative recovery mode.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "The numbers 1 and 1 trigger an automated password reset in PostgreSQL.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "The database converts mathematical expressions into valid bcrypt password hashes.",
        isCorrect: false,
      },
    ],
    explanation:
      "SQL query engines evaluate WHERE conditions row by row. Because 1=1 is unconditionally TRUE for every record, every user in the table matches. The double dash -- instructs the database parser to ignore the rest of the developer's query (including the actual password check). The application takes the first returned row, logging the attacker in as the system administrator.",
    hints: [
      "Boolean Logic: Remember that FALSE OR TRUE always results in TRUE in relational algebra.",
      "Comment Characters: The double dash '--' tells the SQL parser that everything following it on that line is developer commentary and should be discarded.",
      "Default Ordering: Relational databases return rows ordered by primary key unless specified; row #1 is almost always the initial superuser created during server provisioning.",
    ],
  },
  {
    id: 2,
    title: "Comment Truncation: Neutralizing the Password Clause Completely",
    category: "COMMENT-BASED LOGIC TRUNCATION",
    vulnerabilityType: "Dangling Quote & Comment Ingestion",
    targetEndpoint: "/api/v1/auth/verify-user",
    defaultUsername: "admin' --",
    defaultPasswordOrPayload: "[LEAVE_BLANK_OR_ANYTHING]",
    rawSqlTemplate: "SELECT id, username, role FROM accounts WHERE user = '{USER}' AND pass_hash = SHA256('{PASS}')",
    constructedQueryUnsafe: "SELECT id, username, role FROM accounts WHERE user = 'admin' --' AND pass_hash = SHA256('')",
    constructedQuerySafe: "SELECT id, username, role FROM accounts WHERE user = $1 AND pass_hash = SHA256($2) [BOUND LITERALS]",
    returnedDatabaseRecord: {
      id: 1,
      username: "admin",
      role: "INFRA_COMMANDER",
      email: "admin@enterprise.net",
      token: "root_bypass_active",
    },
    conceptSummary:
      "By injecting a single quote followed by comment tokens (admin' --), the attacker terminates the user string and causes the SQL parser to discard the entire second half of the query, bypassing password verification without guessing any passwords.",
    question:
      "An attacker injects admin' -- into the username field with an empty password. What happens inside the database query engine?",
    options: [
      {
        id: "A",
        text: "The single quote closes the username string, and the -- token instructs the parser to discard the rest of the line—completely skipping the password verification clause.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "The database throws a syntax error and locks the server out.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "The -- tells the database to decrement the password difficulty to zero.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "The server encrypts the empty password with AES-256 and finds a match.",
        isCorrect: false,
      },
    ],
    explanation:
      "In SQL syntax, -- (or /* */ in MySQL) marks the start of a single-line comment. When injected after admin', the database executes SELECT * FROM accounts WHERE user = 'admin', ignoring the AND pass_hash = ... portion entirely. Because user admin exists, access is granted with an empty password.",
    hints: [
      "Quote Balancing: The single quote immediately following 'admin' closes the string literal cleanly.",
      "Ignored Code: Inspect the executed SQL: notice that the AND pass_hash = clause is grayed out as a comment.",
      "Valid Syntax: Because the comment token absorbs the developer's trailing single quote, the query has no syntax errors.",
    ],
  },
  {
    id: 3,
    title: "Union-Based Exfiltration: Appending Classified Tables into the Response",
    category: "UNION-BASED DATA EXFILTRATION",
    vulnerabilityType: "Multi-Set Query Merging",
    targetEndpoint: "/api/v1/search/directory",
    defaultUsername: "' UNION SELECT id, username, master_api_key, role FROM system_vault --",
    defaultPasswordOrPayload: "ignored",
    rawSqlTemplate: "SELECT id, name, email, department FROM staff WHERE username = '{USER}'",
    constructedQueryUnsafe: "SELECT id, name, email, department FROM staff WHERE username = '' UNION SELECT id, username, master_api_key, role FROM system_vault --'",
    constructedQuerySafe: "SELECT id, name, email, department FROM staff WHERE username = $1 [BOUND LITERALS]",
    returnedDatabaseRecord: {
      id: 99,
      username: "sys_vault_root",
      role: "MASTER_KEY_STORE",
      email: "sec_vault_01@netsec.local",
      token: "AKIA_PROD_VAULT_KEY_9921_SECRET",
    },
    conceptSummary:
      "The SQL UNION operator joins the result set of the developer's intended query with an arbitrary secondary query. If column counts and data types match, secret tables (passwords, API keys) are outputted directly in the user interface.",
    question:
      "An attacker injects ' UNION SELECT id, username, master_api_key, role FROM system_vault -- into a staff lookup search. How does this extract secret credentials?",
    options: [
      {
        id: "A",
        text: "The UNION operator combines the results of the original query with the results of a secondary query, appending confidential rows directly into the application's search output.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "The UNION command drops the database and uploads the backup to an external FTP server.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "It triggers a kernel panic that dumps physical RAM to the network card.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "UNION only works if the database server has less than 4GB of RAM.",
        isCorrect: false,
      },
    ],
    explanation:
      "The SQL UNION operator merges result sets. When an attacker crafts a secondary SELECT with matching column count (4 columns in this case) and compatible datatypes, the database outputs both queries together. Even if the first query finds no matches (username=''), the second query returns records from system_vault, leaking secret API keys.",
    hints: [
      "Column Alignment: UNION queries must return the exact same number of columns with matching or compatible data types.",
      "Data Merging: The database returns rows from both the primary query and the injected secondary query.",
      "Search Exfiltration: Even public features like product or staff search bars can be leveraged to dump authentication tables.",
    ],
  },
  {
    id: 4,
    title: "Brute Force Interception: Neutralizing Credential Stuffing at the API Gate",
    category: "RATE LIMITING & BRUTE FORCE LOCKOUT",
    vulnerabilityType: "Unrestricted Endpoint Consumption",
    targetEndpoint: "/api/v1/auth/token",
    defaultUsername: "admin",
    defaultPasswordOrPayload: "Winter2024! [AUTOMATED BOT STREAM: 25 REQ/SEC]",
    rawSqlTemplate: "POST /api/v1/auth/token -> RateLimiter: SlidingWindow(limit=5, window=60s)",
    constructedQueryUnsafe: "UNRESTRICTED: 25 attempts/sec processed -> Server CPU 98% -> Password Cracked",
    constructedQuerySafe: "UPSTASH REDIS: 3rd failed attempt -> HTTP 429 Too Many Requests [IP 198.51.100.22 Locked for 900s]",
    returnedDatabaseRecord: null,
    conceptSummary:
      "Automated botnets (Hydra, OpenBullet) blast dozens of requests per second directly at login endpoints, bypassing all client-side JavaScript. A server-side distributed rate limiter (Upstash Redis) is necessary to throttle and jail offending IPs.",
    question:
      "An attacker uses an automated tool to blast 200 password attempts per second against /api/v1/auth. Why is client-side validation useless, and what server-side defense halts this attack?",
    options: [
      {
        id: "A",
        text: "Attackers bypass browsers completely by sending direct HTTP requests via cURL or scripts; an atomic server-side rate limiter (e.g. Redis sliding window) with progressive lockouts (HTTP 429) is required.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "Client-side JavaScript running in the browser can freeze the attacker's physical laptop.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "Adding a 2-second CSS animation to the submit button permanently stops API bots.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "Rate limiting is illegal under RFC 2616 and should never be used.",
        isCorrect: false,
      },
    ],
    explanation:
      "Attackers never interact with browser UIs. They write scripts in Python or Go that fire thousands of HTTP POST packets directly at your API endpoints. Any validation or delay in HTML/JS is completely bypassed. Only a server-side rate limiter (like Upstash Redis sliding window) can monitor request velocity per IP/account and return HTTP 429 Too Many Requests to stop brute-force attacks.",
    hints: [
      "Bypassing Frontends: Automated bots do not run HTML or JavaScript; they send raw HTTP network requests directly.",
      "Client Control: Anything executing in the client browser is under the attacker's complete control and can be disabled.",
      "Atomic State: A centralized memory store like Redis is required to accurately track attempts across serverless functions.",
    ],
  },
  {
    id: 5,
    title: "Prepared Statements: Pre-Compiling Syntax to Neutralize Injection",
    category: "PARAMETERIZED QUERIES (SQLi SHIELD)",
    vulnerabilityType: "Architectural Code vs Data Separation",
    targetEndpoint: "/api/v1/auth/hardened",
    defaultUsername: "admin",
    defaultPasswordOrPayload: "' OR '1'='1' --",
    rawSqlTemplate: "PREPARE auth_stmt FROM 'SELECT id, username, role FROM users WHERE user = ? AND pass = ?'",
    constructedQueryUnsafe: "NOT USED -- DEFENSIVE CODE CHANNEL ACTIVE",
    constructedQuerySafe: "EXECUTE auth_stmt USING ('admin', ''' OR ''1''=''1'' --') -> 0 ROWS MATCHED",
    returnedDatabaseRecord: null,
    conceptSummary:
      "Prepared Statements compile the SQL execution plan before any user input is bound. User input is transmitted over a separate data channel and treated strictly as literal string values, making it mathematically impossible for input to alter query logic.",
    question:
      "When Parameterized Queries (Prepared Statements) are active, why does the payload '' OR '1'='1' -- fail to bypass authentication?",
    options: [
      {
        id: "A",
        text: "The database pre-compiles the SQL syntax tree; user input is passed through a separate data channel and evaluated strictly as a literal string value, never as executable code.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "Prepared statements delete any string that contains single quotes or dashes.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "The database automatically converts all incoming SQL into GraphQL.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "Prepared statements only work when the server is running on Windows Server.",
        isCorrect: false,
      },
    ],
    explanation:
      "In a parameterized query (e.g. using $1, ?, or modern ORMs like Prisma/Drizzle), the database engine compiles the query's Abstract Syntax Tree (AST) before seeing user data. When '' OR '1'='1' -- arrives, it is placed in the parameter slot as a literal string. The database searches for a user whose actual password in the database is literally the text '' OR '1'='1' --, which fails safely with 0 rows matched.",
    hints: [
      "Code vs Data: Parameterized queries separate the execution instructions from the data values.",
      "Pre-Compilation: The database determines what the query means before any user input is plugged into the parameters.",
      "Literal Interpretation: The single quotes in user input are treated like standard characters (like letters 'A' or 'B'), not as syntax delimiters.",
    ],
  },
];

// --- LAB 4: VIRTUAL PORT SCAN & ATTACK SURFACE TYPES ---
export interface PortDef {
  port: number;
  service: string;
  protocol: string;
  description: string;
  vulnRisk: "CRITICAL" | "MODERATE" | "LOW" | "SECURE";
  exploitVector: string;
}

export interface PortMission {
  id: number;
  title: string;
  category: string;
  targetPort: number;
  targetService: string;
  recommendedMode: "EXPOSED" | "BASIC" | "HARDENED";
  conceptSummary: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  hints: string[];
  handshakeSimulation: {
    clientAction: string;
    targetResponse: string;
    finalState: "OPEN" | "CLOSED" | "FILTERED";
    latencyMs: number;
  };
}

const COMMON_PORTS: PortDef[] = [
  {
    port: 21,
    service: "FTP",
    protocol: "TCP",
    description: "Unencrypted File Transfer. Plaintext credentials vulnerable to packet sniffing.",
    vulnRisk: "CRITICAL",
    exploitVector: "Cleartext credentials (USER/PASS) sniffable via Wireshark on unencrypted wire",
  },
  {
    port: 22,
    service: "SSH",
    protocol: "TCP",
    description: "Encrypted Secure Shell Remote Access. Hardened against eavesdropping.",
    vulnRisk: "SECURE",
    exploitVector: "Brute force if password-auth enabled; impenetrable with Ed25519 key-only auth",
  },
  {
    port: 80,
    service: "HTTP",
    protocol: "TCP",
    description: "Unencrypted Web Traffic. Lacks TLS encryption; should 301 redirect to HTTPS.",
    vulnRisk: "MODERATE",
    exploitVector: "Session hijacking, credential theft, and transparent MITM proxy injection",
  },
  {
    port: 443,
    service: "HTTPS",
    protocol: "TCP",
    description: "Encrypted Web Traffic (TLS 1.3). Cryptographically authenticates domain.",
    vulnRisk: "SECURE",
    exploitVector: "Standard production web traffic layer with forward secrecy and HSTS",
  },
  {
    port: 3306,
    service: "MySQL",
    protocol: "TCP",
    description: "Relational Database Port. Critical danger if bound to public internet (0.0.0.0).",
    vulnRisk: "CRITICAL",
    exploitVector: "Automated bot brute-force dictionary sprays and unauthenticated RCE exploits",
  },
  {
    port: 8080,
    service: "HTTP-Proxy",
    protocol: "TCP",
    description: "Secondary Web / Staging Proxy Port. Often forgotten on exposed perimeter.",
    vulnRisk: "MODERATE",
    exploitVector: "Accidental exposure of internal debug consoles or actuator endpoints",
  },
];

const PORT_MISSIONS: PortMission[] = [
  {
    id: 1,
    title: "The TCP 3-Way Handshake: Stealth SYN Scanning Mechanics",
    category: "TCP HANDSHAKE & STEALTH RECON",
    targetPort: 443,
    targetService: "HTTPS",
    recommendedMode: "BASIC",
    conceptSummary:
      "A SYN stealth scan ('half-open scan') sends a SYN packet to probe a port. If the host replies with SYN-ACK, the port is OPEN. Nmap immediately sends a RST (reset) packet instead of completing the handshake with an ACK, terminating the connection before application-level servers create an access log entry.",
    question:
      "How does a SYN Stealth Scan (nmap -sS) determine that a port is open without establishing a full TCP connection?",
    options: [
      {
        id: "A",
        text: "The scanner sends a SYN; if the host responds with SYN-ACK, the port is verified OPEN. The scanner immediately sends a RST packet to tear down the socket before application logs are written.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "The scanner floods the gateway with UDP packets until the firewall buffer overflows.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "The scanner guesses port states based on the target operating system's MAC address.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "SYN stealth scans require the attacker to already possess root administrative credentials on the target host.",
        isCorrect: false,
      },
    ],
    explanation:
      "A normal TCP connection requires SYN -> SYN-ACK -> ACK. In a SYN scan (half-open scan), Nmap stops the handshake after receiving the SYN-ACK by responding with a RST packet. Because the TCP socket is never fully established, older intrusion detection systems and web server application logs often fail to record the connection attempt.",
    hints: [
      "Handshake Sequence: The normal full connection sequence is client SYN, server SYN-ACK, client ACK.",
      "Half-Open Strategy: A stealth scan deliberately refrains from transmitting the final ACK packet.",
      "Tear Down: Sending a RST (Reset) terminates the embryonic TCP socket in milliseconds.",
    ],
    handshakeSimulation: {
      clientAction: "Client [SYN] -> Port 443",
      targetResponse: "Target [SYN-ACK] received",
      finalState: "OPEN",
      latencyMs: 14,
    },
  },
  {
    id: 2,
    title: "Cleartext Legacy Protocols: The Danger of FTP (21) & Telnet (23)",
    category: "PLAINTEXT PROTOCOL VULNERABILITIES",
    targetPort: 21,
    targetService: "FTP",
    recommendedMode: "EXPOSED",
    conceptSummary:
      "Legacy protocols like FTP (port 21) and Telnet (port 23) were built before the modern adversarial internet. They send authentication credentials and session data in completely unencrypted ASCII plaintext, allowing anyone on the network path to capture passwords using packet sniffers like Wireshark.",
    question:
      "A network scan reveals port 21 (FTP) exposed to the public internet. What makes exposing cleartext legacy protocols a critical vulnerability?",
    options: [
      {
        id: "A",
        text: "FTP transmits all authentication credentials and file contents in raw, unencrypted plaintext, allowing any eavesdropper or intermediate router to capture passwords using packet sniffers.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "FTP uses 128-bit encryption which has been proven mathematically insecure against quantum computers.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "Telnet was officially decommissioned by the IEEE in 1982 and will not execute on Linux.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "Cleartext protocols physically damage the hardware capacitors of modern network switches.",
        isCorrect: false,
      },
    ],
    explanation:
      "Cleartext protocols lack cryptographic encapsulation. When an operator connects via FTP (Port 21) or Telnet (Port 23), their USER and PASS commands travel over the wire in plain ASCII. Any attacker on the local network (via Wireshark or ARP spoofing) or rogue ISP router can read credentials effortlessly. They must be replaced with SFTP or SSH (Port 22).",
    hints: [
      "Wire Transparency: If traffic is not encrypted with TLS or SSH ciphers, packets can be read like a plaintext email.",
      "Sniffing Tools: Tools like Wireshark and tcpdump reconstruct unencrypted streams into human-readable text.",
      "Secure Alternatives: Always replace FTP with SFTP (SSH File Transfer) and Telnet with SSH.",
    ],
    handshakeSimulation: {
      clientAction: "Client [SYN] -> Port 21 (FTP)",
      targetResponse: "Target [220 Service Ready (Cleartext USER/PASS)]",
      finalState: "OPEN",
      latencyMs: 18,
    },
  },
  {
    id: 3,
    title: "Exposed Database Listeners: The 0.0.0.0:3306 Fatal Misconfiguration",
    category: "DATABASE NETWORK BINDING & VPC PERIMETER",
    targetPort: 3306,
    targetService: "MySQL",
    recommendedMode: "BASIC",
    conceptSummary:
      "Setting bind-address = 0.0.0.0 on a database binds the listener to all network interfaces, including public internet IPs. Databases should strictly listen on 127.0.0.1 (localhost) or isolated private VPC subnets with perimeter firewalls dropping all public inbound connection attempts.",
    question:
      "A database server is configured with bind-address = 0.0.0.0, exposing MySQL (Port 3306) to the internet. What is the correct defensive network configuration?",
    options: [
      {
        id: "A",
        text: "Bind the database listener strictly to localhost (127.0.0.1) or an internal private VPC subnet interface, using an SSH bastion or encrypted private tunnel for remote administrative access.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "Rename the database from 'mysql' to 'secret_mysql' in the configuration file.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "Keep port 3306 open to the internet but enforce uppercase-only passwords for the root account.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "MySQL cannot be protected by firewalls because it uses TCP streaming sockets.",
        isCorrect: false,
      },
    ],
    explanation:
      "Binding to 0.0.0.0 instructs the OS to accept connections from any interface, exposing the database to thousands of automated credential-spraying botnets. Databases should only listen on 127.0.0.1 (localhost) for local web backends, or on private internal network interfaces (e.g. 10.0.x.x VPC). Public database access should never be permitted.",
    hints: [
      "Wildcard Binding: 0.0.0.0 means 'listen on every IP address assigned to this computer, including the public WAN'.",
      "Localhost Isolation: 127.0.0.1 only permits connections originating from processes running on the exact same server.",
      "VPC Segmentation: In multi-server architectures, database instances reside in isolated private subnets with no public IPv4 addresses.",
    ],
    handshakeSimulation: {
      clientAction: "Client [SYN] -> Port 3306 (MySQL)",
      targetResponse: "Target [RST-ACK (Port Closed by DMZ Filter)]",
      finalState: "CLOSED",
      latencyMs: 12,
    },
  },
  {
    id: 4,
    title: "Packet Filtering States: Closed (RST) vs Filtered (DROP)",
    category: "PACKET FILTERING: REJECT VS DROP",
    targetPort: 8080,
    targetService: "HTTP-Proxy",
    recommendedMode: "HARDENED",
    conceptSummary:
      "When a port is CLOSED without a firewall, the OS replies with TCP RST, confirming the host is alive. A hardened firewall uses DROP rules (iptables -j DROP), silently discarding incoming SYN packets. This forces the scanner to wait for timeouts, marking the port FILTERED and revealing zero host telemetry.",
    question:
      "When Nmap scans a hardened firewall, it reports ports as FILTERED rather than CLOSED. What is the fundamental network difference?",
    options: [
      {
        id: "A",
        text: "A CLOSED port actively replies with a TCP RST packet confirming the host exists; a FILTERED port silently drops packets (iptables -j DROP), sending no response and forcing the scanner to timeout.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "A FILTERED port has been scanned and cleaned by an enterprise antivirus program.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "A CLOSED port is accessible only over IPv6, while FILTERED is IPv4 exclusive.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "There is no difference; Nmap alternates between the two words randomly.",
        isCorrect: false,
      },
    ],
    explanation:
      "When a port has no service listening and no firewall, the host kernel sends a TCP RST ('Reset') packet. This confirms to the attacker: 'Host is online, but port is inactive.' A hardened perimeter uses DROP rules: the packet enters a black hole without any response. The scanner must wait through multiple timeout retries, turning a fast scan into an exhausting, slow ordeal and giving away zero reconnaissance data.",
    hints: [
      "Active Rejection vs Black Hole: CLOSED actively sends a polite RST packet; FILTERED sends absolutely nothing.",
      "Reconnaissance Value: An active RST proves to the attacker that the IP address is alive and assigned to a machine.",
      "Scanner Throttling: Silently dropping packets forces scanners to wait through exponential retransmission backoffs.",
    ],
    handshakeSimulation: {
      clientAction: "Client [SYN] -> Port 8080",
      targetResponse: "Firewall [SILENT DROP (iptables -j DROP)] -> Request Timeout",
      finalState: "FILTERED",
      latencyMs: 1250,
    },
  },
  {
    id: 5,
    title: "Attack Surface Minimization: Zero Inbound Open Ports",
    category: "ATTACK SURFACE MINIMIZATION & ZERO-TRUST",
    targetPort: 22,
    targetService: "SSH",
    recommendedMode: "HARDENED",
    conceptSummary:
      "Modern Zero-Trust network architectures eliminate public inbound listening ports completely. By using outbound-only encrypted tunnels (Cloudflare Tunnel, Tailscale/WireGuard mesh), internal services and SSH consoles are accessed with identity-aware authorization while the public perimeter firewall blocks 100% of inbound probes.",
    question:
      "What modern network architecture allows administrators to host web services and manage servers remotely with ZERO open inbound ports on the public firewall?",
    options: [
      {
        id: "A",
        text: "Outbound-only Zero-Trust tunnels (Cloudflare Tunnels, Tailscale/WireGuard mesh): the server establishes an outbound connection to an edge proxy, requiring 0 inbound listening ports on the public firewall.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "Port knocking on port 80 using Morse code audio packets.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "Disabling the TCP/IP stack in the Linux kernel.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "Changing the server's public IP address every 3 milliseconds.",
        isCorrect: false,
      },
    ],
    explanation:
      "Traditional server management required opening port 22 or 443 to the world. Modern Zero-Trust architectures use outbound tunnels (such as Cloudflare Tunnel or Tailscale). The server initiates an outbound encrypted tunnel to trusted edge nodes. To external internet port scanners (like Nmap or Shodan), the server has 0 open inbound ports and is completely invisible, eliminating perimeter exploitation vectors.",
    hints: [
      "Inbound vs Outbound: Inbound connections require open doors (ports); outbound tunnels initiate from inside the protected network.",
      "Edge Proxies: Traffic routes through identity-authenticated edge networks before reaching private servers.",
      "Default-Deny Perfection: A server with zero open inbound ports is completely invisible on public IPv4 sweeps.",
    ],
    handshakeSimulation: {
      clientAction: "Client [SYN] -> Port 22 (SSH)",
      targetResponse: "Firewall [DEFAULT-DENY SHIELD ACTIVE] -> Dropped",
      finalState: "FILTERED",
      latencyMs: 1400,
    },
  },
];

export default function TrainingGroundsLabsPage() {
  const [activeTab, setActiveTab] = useState<"phishing" | "cracktime" | "auth" | "ports">("phishing");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // LAB 1 STATE
  const [phishIdx, setPhishIdx] = useState(0);
  const [phishFeedback, setPhishFeedback] = useState<"CORRECT" | "INCORRECT" | null>(null);
  const [phishScore, setPhishScore] = useState(0);
  const [answeredScenarios, setAnsweredScenarios] = useState<Record<number, boolean>>({});
  const [lab01Completed, setLab01Completed] = useState(false);
  const currentScenario = PHISHING_SCENARIOS[phishIdx];

  // LAB 1 ENHANCEMENTS
  const [showHints, setShowHints] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [scannerUrl, setScannerUrl] = useState("");
  const [isScanningUrl, setIsScanningUrl] = useState(false);
  const [scannerReport, setScannerReport] = useState<ForensicReport | null>(null);
  const [interceptWarning, setInterceptWarning] = useState<string | null>(null);

  // LAB 2 STATE (CRACK-TIME & HASHCAT RIG SIMULATOR)
  const [crackIdx, setCrackIdx] = useState(0);
  const [crackFeedback, setCrackFeedback] = useState<"CORRECT" | "INCORRECT" | null>(null);
  const [crackScore, setCrackScore] = useState(0);
  const [answeredCrackMissions, setAnsweredCrackMissions] = useState<Record<number, boolean>>({});
  const [lab02Completed, setLab02Completed] = useState(false);
  const [showCrackHints, setShowCrackHints] = useState(false);
  const [candidatePassword, setCandidatePassword] = useState("BigBro#NetSec2026");
  const [simulatingHashcat, setSimulatingHashcat] = useState(false);
  const [activeRigOutput, setActiveRigOutput] = useState<{
    status: "CRACKED" | "EXHAUSTION_FAILED" | "BYPASSED_NO_CRACK_NEEDED" | "HARDENED_RESISTANT";
    timeLabel: string;
    hashrate: string;
    plaintext: string;
  } | null>(null);
  const currentCrackMission = CRACK_MISSIONS[crackIdx];

  // LAB 3 STATE (AUTHENTICATION BYPASS & SQL INJECTION SANDBOX)
  const [authIdx, setAuthIdx] = useState(0);
  const [authFeedback, setAuthFeedback] = useState<"CORRECT" | "INCORRECT" | null>(null);
  const [authScore, setAuthScore] = useState(0);
  const [answeredAuthMissions, setAnsweredAuthMissions] = useState<Record<number, boolean>>({});
  const [lab03Completed, setLab03Completed] = useState(false);
  const [showAuthHints, setShowAuthHints] = useState(false);
  const [loginUser, setLoginUser] = useState("admin");
  const [loginPass, setLoginPass] = useState("' OR 1=1 --");
  const [usePreparedStatements, setUsePreparedStatements] = useState(false);
  const [useRateLimiting, setUseRateLimiting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isTransmittingQuery, setIsTransmittingQuery] = useState(false);
  const [loginOutput, setLoginOutput] = useState<{
    status: "EXPLOIT_SUCCESSFUL" | "AUTH_VERIFIED" | "DEFENSE_BLOCKED" | "RATE_LIMITED";
    title: string;
    message: string;
    executedSql: string;
    returnedRow?: { id: number | null; username: string; role: string; email: string; token: string } | null;
  } | null>(null);
  const currentAuthMission = AUTH_MISSIONS[authIdx];

  // LAB 4 STATE (PORT SCANNER & FIREWALL HARDENING)
  const [portIdx, setPortIdx] = useState(0);
  const [portFeedback, setPortFeedback] = useState<"CORRECT" | "INCORRECT" | null>(null);
  const [portScore, setPortScore] = useState(0);
  const [answeredPortMissions, setAnsweredPortMissions] = useState<Record<number, boolean>>({});
  const [lab04Completed, setLab04Completed] = useState(false);
  const [showPortHints, setShowPortHints] = useState(false);
  const [firewallMode, setFirewallMode] = useState<"EXPOSED" | "BASIC" | "HARDENED">("BASIC");
  const [scanning, setScanning] = useState(false);
  const [scannedPorts, setScannedPorts] = useState<Record<number, "OPEN" | "CLOSED" | "FILTERED">>({});
  const [scanType, setScanType] = useState<"SYN" | "CONNECT" | "UDP">("SYN");
  const currentPortMission = PORT_MISSIONS[portIdx];

  // Audio Sync & Cleanup on unmount
  useEffect(() => {
    try {
      const storedMute = sessionStorage.getItem("netsec_bgm_user_muted");
      if (storedMute === "true") {
        setSoundEnabled(false);
      }
    } catch {}
    return () => {
      stopAmbientScore();
    };
  }, []);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      startAmbientScore();
    } else {
      stopAmbientScore();
    }
    try {
      sessionStorage.setItem("netsec_bgm_user_muted", nextState ? "false" : "true");
    } catch {}
    playLabsSound("click");
  };

  const handleSfx = (type: "click" | "success" | "error" | "scan") => {
    if (soundEnabled && !isAmbientPlaying()) {
      startAmbientScore();
    }
    // Tactile mouse click and feedback sounds always play even if BGM is muted
    playLabsSound(type);
  };

  // LAB 2 HANDLERS
  const handleCrackOptionSelect = (isCorrect: boolean) => {
    if (answeredCrackMissions[crackIdx]) return;
    setAnsweredCrackMissions((prev) => ({ ...prev, [crackIdx]: true }));
    if (isCorrect) {
      handleSfx("success");
      setCrackFeedback("CORRECT");
      setCrackScore((prev) => prev + 1);
    } else {
      handleSfx("error");
      setCrackFeedback("INCORRECT");
    }
  };

  const handleNextCrackMission = () => {
    handleSfx("click");
    setCrackFeedback(null);
    setShowCrackHints(false);
    setActiveRigOutput(null);
    if (crackIdx + 1 < CRACK_MISSIONS.length) {
      setCrackIdx((prev) => prev + 1);
    } else {
      setLab02Completed(true);
    }
  };

  const restartLab02 = () => {
    handleSfx("click");
    setCrackIdx(0);
    setCrackScore(0);
    setCrackFeedback(null);
    setAnsweredCrackMissions({});
    setLab02Completed(false);
    setShowCrackHints(false);
    setActiveRigOutput(null);
  };

  const runSimulatedHashcat = (customTarget?: string) => {
    handleSfx("scan");
    setSimulatingHashcat(true);
    const mission = CRACK_MISSIONS[crackIdx];
    setTimeout(() => {
      setSimulatingHashcat(false);
      if (customTarget) {
        const isQuick = passwordStats.entropy < 60;
        setActiveRigOutput({
          status: isQuick ? "CRACKED" : "EXHAUSTION_FAILED",
          timeLabel: passwordStats.timeLabel,
          hashrate: "104.2 GH/s",
          plaintext: isQuick ? customTarget : "UNRECOVERED [TIME EXCEEDS FEASIBLE HORIZON]",
        });
        handleSfx(isQuick ? "error" : "success");
      } else {
        setActiveRigOutput({
          status: mission.rigTelemetry.status,
          timeLabel: mission.timeToCrack,
          hashrate: mission.rigTelemetry.hashrate,
          plaintext: mission.rigTelemetry.recoveredPlaintext,
        });
        if (mission.rigTelemetry.status === "CRACKED" || mission.rigTelemetry.status === "BYPASSED_NO_CRACK_NEEDED") {
          handleSfx("error");
        } else {
          handleSfx("success");
        }
      }
    }, 550);
  };

  // LAB 1 HANDLERS
  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentScenario.hiddenActualLink);
      setCopyFeedback("COPIED TO CLIPBOARD!");
      handleSfx("click");
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  const handleRunForensicScan = (targetUrl?: string) => {
    const urlToTest = targetUrl || scannerUrl || currentScenario.hiddenActualLink;
    if (!urlToTest) return;
    handleSfx("scan");
    setIsScanningUrl(true);
    setScannerReport(null);

    setTimeout(() => {
      const report = evaluateUrlForensics(urlToTest, currentScenario);
      setScannerReport(report);
      setIsScanningUrl(false);
      handleSfx("success");
    }, 420);
  };

  const handleInspectInScanner = () => {
    setScannerUrl(currentScenario.hiddenActualLink);
    handleRunForensicScan(currentScenario.hiddenActualLink);
    handleSfx("click");
    const el = document.getElementById("forensic-scanner");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSuspiciousLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSfx("error");
    setInterceptWarning(
      `🛡️ DEFENSIVE SHIELD INTERCEPTED: Direct click on "${currentScenario.hiddenActualLink}" blocked! In a live attack, this would submit credentials to an adversary server. We loaded the destination URL into the Forensic Scanner below for safe inspection.`
    );
    setScannerUrl(currentScenario.hiddenActualLink);
    handleRunForensicScan(currentScenario.hiddenActualLink);
    const el = document.getElementById("forensic-scanner");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // --- LAB 1 ANSWER HANDLER ---
  const handlePhishAnswer = (userSaidPhishing: boolean) => {
    const isCorrect = userSaidPhishing === currentScenario.isPhishing;
    if (isCorrect) {
      handleSfx("success");
      setPhishFeedback("CORRECT");
      if (!answeredScenarios[currentScenario.id]) {
        setPhishScore((prev) => Math.min(prev + 1, PHISHING_SCENARIOS.length));
        setAnsweredScenarios((prev) => ({ ...prev, [currentScenario.id]: true }));
      }
    } else {
      handleSfx("error");
      setPhishFeedback("INCORRECT");
      setAnsweredScenarios((prev) => ({ ...prev, [currentScenario.id]: true }));
    }
  };

  const nextPhishScenario = () => {
    handleSfx("click");
    setPhishFeedback(null);
    setInterceptWarning(null);
    setScannerReport(null);
    setScannerUrl("");
    setCopyFeedback(null);

    if (phishIdx >= PHISHING_SCENARIOS.length - 1) {
      setLab01Completed(true);
      handleSfx("success");
    } else {
      setPhishIdx((prev) => prev + 1);
    }
  };

  const restartLab01 = () => {
    handleSfx("click");
    setLab01Completed(false);
    setPhishIdx(0);
    setPhishScore(0);
    setPhishFeedback(null);
    setAnsweredScenarios({});
    setInterceptWarning(null);
    setScannerReport(null);
    setScannerUrl("");
    setCopyFeedback(null);
  };

  // --- LAB 2 CALCULATIONS ---
  const passwordStats = useMemo(() => {
    const pwd = candidatePassword;
    const len = pwd.length;
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33;

    const entropy = len > 0 && pool > 0 ? Math.round(len * Math.log2(pool)) : 0;
    const combinations = pool > 0 ? Math.pow(pool, len) : 0;

    // Time calculations
    // 8x RTX 4090 Hashcat rig can test ~100 Billion (10^11) NTLM hashes per second
    const hashesPerSec = 100_000_000_000;
    const seconds = combinations / hashesPerSec;

    let timeLabel = "Instant";
    if (!Number.isFinite(seconds) || seconds > 31536000 * 1_000_000_000_000) timeLabel = "Infeasible (> 10²⁰ Years)";
    else if (seconds < 1) timeLabel = "Under 1 millisecond";
    else if (seconds < 60) timeLabel = `${Math.round(seconds)} seconds`;
    else if (seconds < 3600) timeLabel = `${Math.round(seconds / 60)} minutes`;
    else if (seconds < 86400) timeLabel = `${Math.round(seconds / 3600)} hours`;
    else if (seconds < 31536000) timeLabel = `${Math.round(seconds / 86400)} days`;
    else if (seconds < 31536000 * 1000) timeLabel = `${Math.round(seconds / 31536000)} years`;
    else if (seconds < 31536000 * 1_000_000) timeLabel = `${Math.round(seconds / (31536000 * 1000))} Thousand years`;
    else timeLabel = `${(seconds / (31536000 * 1_000_000)).toExponential(2)} Million years`;

    let grade: "POOR" | "FAIR" | "STRONG" | "MILITARY" = "POOR";
    if (entropy >= 80) grade = "MILITARY";
    else if (entropy >= 60) grade = "STRONG";
    else if (entropy >= 40) grade = "FAIR";

    return { len, pool, entropy, timeLabel, grade };
  }, [candidatePassword]);

  // --- LAB 3 HANDLERS ---
  const handleAuthOptionSelect = (isCorrect: boolean) => {
    if (answeredAuthMissions[authIdx]) return;
    setAnsweredAuthMissions((prev) => ({ ...prev, [authIdx]: true }));
    if (isCorrect) {
      handleSfx("success");
      setAuthFeedback("CORRECT");
      setAuthScore((prev) => prev + 1);
    } else {
      handleSfx("error");
      setAuthFeedback("INCORRECT");
    }
  };

  const handleNextAuthMission = () => {
    handleSfx("click");
    setAuthFeedback(null);
    setShowAuthHints(false);
    setLoginOutput(null);
    if (authIdx + 1 < AUTH_MISSIONS.length) {
      const nextIdx = authIdx + 1;
      setAuthIdx(nextIdx);
      setLoginUser(AUTH_MISSIONS[nextIdx].defaultUsername);
      setLoginPass(AUTH_MISSIONS[nextIdx].defaultPasswordOrPayload);
    } else {
      setLab03Completed(true);
    }
  };

  const restartLab03 = () => {
    handleSfx("click");
    setAuthIdx(0);
    setAuthScore(0);
    setAuthFeedback(null);
    setAnsweredAuthMissions({});
    setLab03Completed(false);
    setShowAuthHints(false);
    setLoginOutput(null);
    setFailedAttempts(0);
    setUsePreparedStatements(false);
    setUseRateLimiting(false);
    setLoginUser(AUTH_MISSIONS[0].defaultUsername);
    setLoginPass(AUTH_MISSIONS[0].defaultPasswordOrPayload);
  };

  const handleExecuteDatabaseQuery = (targetUser?: string, targetPass?: string) => {
    const userToTest = targetUser !== undefined ? targetUser : loginUser;
    const passToTest = targetPass !== undefined ? targetPass : loginPass;
    handleSfx("scan");
    setIsTransmittingQuery(true);
    setLoginOutput(null);

    setTimeout(() => {
      setIsTransmittingQuery(false);

      // Check Rate Limiting defense
      if (useRateLimiting && failedAttempts >= 3) {
        handleSfx("error");
        setLoginOutput({
          status: "RATE_LIMITED",
          title: "HTTP 429: TOO MANY REQUESTS [IP LOCKED]",
          message:
            "Upstash Redis Rate Limiter intercepted rapid login bursts. IP address 198.51.100.22 placed in progressive lockout jail for 900 seconds.",
          executedSql: "-- REQUEST REJECTED BY REVERSE PROXY BEFORE DATABASE EXECUTION",
          returnedRow: null,
        });
        return;
      }

      // Check Parameterized Queries (Prepared Statements) defense
      if (usePreparedStatements) {
        handleSfx("success");
        setLoginOutput({
          status: "DEFENSE_BLOCKED",
          title: "INJECTION NEUTRALIZED [PREPARED STATEMENT BOUND]",
          message: `The database engine compiled the query plan prior to parameter binding. The payload was safely treated as a harmless literal string. Result: 0 records matched for literal username "${userToTest}".`,
          executedSql: `PREPARE stmt FROM 'SELECT id, username, role, email FROM users WHERE username = ? AND password = ?';\nEXECUTE stmt USING ('${userToTest}', '${passToTest}'); -- [0 ROWS MATCHED]`,
          returnedRow: null,
        });
        return;
      }

      // Unsafe Evaluation (Vulnerable Concatenation)
      const combinedInput = `${userToTest} ${passToTest}`;

      if (combinedInput.includes("UNION SELECT")) {
        handleSfx("success");
        setLoginOutput({
          status: "EXPLOIT_SUCCESSFUL",
          title: "CRITICAL: UNION EXFILTRATION DUMPED MASTER KEYS",
          message:
            "The UNION operator appended records from 'system_vault' into the result pipeline. Confidential master API credentials were leaked in the response.",
          executedSql: `SELECT id, name, email, department FROM staff WHERE username = '${userToTest}';`,
          returnedRow: {
            id: 99,
            username: "sys_vault_root",
            role: "MASTER_KEY_STORE",
            email: "sec_vault_01@netsec.local",
            token: "AKIA_PROD_VAULT_KEY_9921_SECRET",
          },
        });
      } else if (
        combinedInput.includes("OR 1=1") ||
        combinedInput.includes("OR '1'='1'") ||
        userToTest.includes("' --") ||
        userToTest.includes("admin' --") ||
        passToTest.includes("' OR '")
      ) {
        handleSfx("success");
        setLoginOutput({
          status: "EXPLOIT_SUCCESSFUL",
          title: "EXPLOIT VERIFIED: AUTHENTICATION TABLE BYPASSED",
          message:
            "SQL logic was successfully rewritten by the payload. The password check was commented out or evaluated to TRUE. Administrative session established.",
          executedSql: `SELECT id, username, role, email FROM users WHERE username = '${userToTest}' AND password = '${passToTest}';`,
          returnedRow: {
            id: 1,
            username: "admin",
            role: "SUPER_ADMINISTRATOR",
            email: "sec-ops@company.internal",
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.adm_root_session",
          },
        });
      } else if (userToTest === "admin" && passToTest === "SecurePass2026!") {
        handleSfx("success");
        setFailedAttempts(0);
        setLoginOutput({
          status: "AUTH_VERIFIED",
          title: "LEGITIMATE ACCESS: CREDENTIALS AUTHENTICATED",
          message: "Authorized operator credentials matched password hash via bcrypt comparison.",
          executedSql: `SELECT id, username, role, email FROM users WHERE username = 'admin'; -- [BCRYPT VERIFY PASS]`,
          returnedRow: {
            id: 1,
            username: "admin",
            role: "SUPER_ADMINISTRATOR",
            email: "sec-ops@company.internal",
            token: "valid_operator_jwt_token",
          },
        });
      } else {
        handleSfx("error");
        setFailedAttempts((prev) => prev + 1);
        setLoginOutput({
          status: "DEFENSE_BLOCKED",
          title: "AUTHENTICATION FAILED: INVALID CREDENTIALS",
          message: `Query executed with 0 matching rows. Failed attempts recorded: ${failedAttempts + 1}.`,
          executedSql: `SELECT id, username, role, email FROM users WHERE username = '${userToTest}' AND password = '${passToTest}'; -- [0 ROWS MATCHED]`,
          returnedRow: null,
        });
      }
    }, 450);
  };

  // --- LAB 4 HANDLERS ---
  const handlePortOptionSelect = (isCorrect: boolean) => {
    if (answeredPortMissions[portIdx]) return;
    setAnsweredPortMissions((prev) => ({ ...prev, [portIdx]: true }));
    if (isCorrect) {
      handleSfx("success");
      setPortFeedback("CORRECT");
      setPortScore((prev) => prev + 1);
    } else {
      handleSfx("error");
      setPortFeedback("INCORRECT");
    }
  };

  const handleNextPortMission = () => {
    handleSfx("click");
    setPortFeedback(null);
    setShowPortHints(false);
    if (portIdx + 1 < PORT_MISSIONS.length) {
      const nextIdx = portIdx + 1;
      setPortIdx(nextIdx);
      setFirewallMode(PORT_MISSIONS[nextIdx].recommendedMode);
      setScannedPorts({});
    } else {
      setLab04Completed(true);
      playLabsSound("victory");
    }
  };

  const restartLab04 = () => {
    handleSfx("click");
    setPortIdx(0);
    setPortScore(0);
    setPortFeedback(null);
    setAnsweredPortMissions({});
    setLab04Completed(false);
    setShowPortHints(false);
    setScannedPorts({});
    setFirewallMode("BASIC");
  };

  const runPortScan = (modeOverride?: "EXPOSED" | "BASIC" | "HARDENED") => {
    const activeMode = modeOverride || firewallMode;
    handleSfx("scan");
    setScanning(true);
    setScannedPorts({});

    setTimeout(() => {
      const results: Record<number, "OPEN" | "CLOSED" | "FILTERED"> = {};
      COMMON_PORTS.forEach((p) => {
        if (activeMode === "EXPOSED") {
          results[p.port] = "OPEN";
        } else if (activeMode === "BASIC") {
          results[p.port] = p.port === 80 || p.port === 443 || p.port === 22 ? "OPEN" : "CLOSED";
        } else {
          // Hardened Zero-Trust: drop unessential, only 443 active
          results[p.port] = p.port === 443 ? "OPEN" : "FILTERED";
        }
      });
      setScannedPorts(results);
      setScanning(false);
      handleSfx("success");
    }, 650);
  };

  return (
    <div className="min-h-screen w-full bg-[#05070a] text-slate-200 font-sans flex flex-col justify-between selection:bg-[#00e575]/20 selection:text-[#00e575]">
      {/* ========================================================= */}
      {/* HEADER                                                    */}
      {/* ========================================================= */}
      <header className="h-16 border-b border-[#182234] bg-[#070a10]/80 backdrop-blur-xl px-6 sm:px-10 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/sandbox"
            className="flex items-center gap-2 text-slate-400 hover:text-[#00e575] font-mono text-xs font-bold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>[TACTICAL_SIMULATOR]</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e575] animate-ping" />
            <span className="text-white font-display font-black text-xs tracking-widest uppercase">
              Training Grounds // Live Cyber Range
            </span>
          </div>
        </div>

        {/* Audio & Status */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute Background Music (Tactile click sounds remain active)" : "Enable Background Music"}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              soundEnabled
                ? "border-[#00e575]/40 bg-[#00e575]/10 text-[#00e575] shadow-[0_0_15px_rgba(0,229,117,0.2)]"
                : "border-slate-800 bg-slate-900/60 text-slate-400"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? "BGM: ON" : "BGM: MUTED"}</span>
          </button>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SANDBOXED (SAFE SIMULATION)</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN LABS WRAPPER                                         */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Lab Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#182234] pb-4">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              { id: "phishing", label: "01 // Phishing Spotter", icon: Mail },
              { id: "cracktime", label: "02 // Crack-Time Lab", icon: Key },
              { id: "auth", label: "03 // Mock Login Defense", icon: Lock },
              { id: "ports", label: "04 // Port Scan Sim", icon: Server },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleSfx("click");
                    setActiveTab(tab.id as typeof activeTab);
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-mono text-xs font-black tracking-wider uppercase transition-all ${
                    isActive
                      ? "bg-[#00e575] text-black shadow-[0_0_20px_rgba(0,229,117,0.4)] scale-105"
                      : "bg-[#070a10] border border-[#182234] text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>MODE:</span>
            <span className="text-[#00e575] font-bold">CLIENT_SIDE_ONLY</span>
          </div>
        </div>

        {/* ======================================================= */}
        {/* TAB 1: PHISHING SPOTTER                                 */}
        {/* ======================================================= */}
        {activeTab === "phishing" && (
          <section className="space-y-8 animate-fadeIn">
            {/* Lab 01 Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#070a10] border border-[#182234] p-6 rounded-2xl shadow-xl">
              <div>
                <h2 className="text-xl font-black font-display text-white uppercase tracking-wider flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-[#00e575]" />
                  <span>Lab 01 {"//"} Phishing & Social Engineering Spotter</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Deconstruct deceptive email headers, inspect hidden hyperlink destinations, and execute forensic analysis on suspicious URLs.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">SCORE:</span>
                <span className="font-mono text-lg font-black text-[#00e575] bg-[#00e575]/10 px-3.5 py-1 rounded-lg border border-[#00e575]/30">
                  {phishScore} / {PHISHING_SCENARIOS.length}
                </span>
              </div>
            </div>

            {/* Conditional: Lab 01 Completion Screen VS Scenario Practice */}
            {lab01Completed ? (
              <div className="bg-[#070a10] border-2 border-[#00e575]/40 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-[0_0_60px_rgba(0,229,117,0.15)] animate-fadeIn">
                <div className="w-20 h-20 rounded-full bg-[#00e575]/10 border-2 border-[#00e575] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,229,117,0.3)]">
                  <ShieldCheck className="w-10 h-10 text-[#00e575]" />
                </div>

                <div className="space-y-3 max-w-xl mx-auto">
                  <span className="text-xs font-mono font-black tracking-widest text-[#00e575] uppercase px-3 py-1 rounded-full bg-[#00e575]/10 border border-[#00e575]/30 inline-block">
                    LAB 01 COMPLETE {"//"} OPERATOR DEBRIEF
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black font-display text-white tracking-wider uppercase">
                    Phishing Spotter Evaluation
                  </h3>
                  <p className="text-slate-300 text-sm font-sans leading-relaxed">
                    {phishScore === 5
                      ? "Flawless threat reconnaissance! You accurately classified all five deceptive emails, caught homoglyphs and hidden executable payloads, and validated clean cryptographic signatures."
                      : phishScore >= 3
                      ? "Solid defensive aptitude! You intercepted the majority of deceptive email vectors and flagged key social engineering red flags."
                      : "Training completed. Social engineering vectors require heightened scrutiny on Return-Paths, typosquat domains, and anchor text divergence."}
                  </p>
                </div>

                {/* Score Summary Box */}
                <div className="max-w-md mx-auto bg-[#0a0e17] border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 font-mono text-xs">
                    <span className="text-slate-400">OPERATOR RATING:</span>
                    <span
                      className={`font-black ${
                        phishScore === 5
                          ? "text-[#00e575]"
                          : phishScore >= 3
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {phishScore === 5
                        ? "MASTER PHISHING DETECTIVE (100%)"
                        : phishScore >= 3
                        ? "QUALIFIED TACTICAL ANALYST"
                        : "PROVISIONAL CADET"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-mono text-slate-400">FINAL CLEARANCE SCORE:</span>
                    <span className="font-mono text-3xl font-black text-[#00e575]">
                      {phishScore} / 5
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        phishScore === 5
                          ? "bg-[#00e575]"
                          : phishScore >= 3
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${(phishScore / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Two Direct Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 max-w-lg mx-auto">
                  <button
                    onClick={() => {
                      handleSfx("click");
                      setActiveTab("cracktime");
                    }}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00e575] to-[#00b35a] text-black font-mono font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,229,117,0.4)] flex items-center justify-center gap-2"
                  >
                    <span>MOVE TO NEXT LAB ➔ (02 CRACK-TIME)</span>
                  </button>

                  <button
                    onClick={restartLab01}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>REDO LAB 01</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Need a Hint? Operator Intel Drawer */}
                <div className="border border-[#182234] bg-[#070a10] rounded-2xl overflow-hidden transition-all shadow-md">
                  <button
                    onClick={() => {
                      handleSfx("click");
                      setShowHints(!showHints);
                    }}
                    className="w-full flex items-center justify-between px-6 py-3.5 bg-[#0a0e17] hover:bg-[#0f1422] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                        NEED A HINT? {"//"} OPERATOR INTEL
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                        3 TACTICAL CLUES AVAILABLE
                      </span>
                    </div>
                    {showHints ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {showHints && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#182234] bg-[#05070a] animate-fadeIn">
                      {currentScenario.hints.map((hint, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#070a10] space-y-2">
                          <div className="flex items-center gap-2 text-amber-400 font-mono text-[11px] font-bold">
                            <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[9px]">
                              {idx + 1}
                            </span>
                            <span>
                              {idx === 0
                                ? "HEADER RECON"
                                : idx === 1
                                ? "LINK DECONSTRUCTION"
                                : "CRYPTO AUTHENTICATION"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">{hint}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Simulated Email Client */}
                <div className="bg-[#0a0e17] border border-[#182234] rounded-2xl overflow-hidden shadow-2xl">
                  {/* Fake Email Client Header */}
                  <div className="bg-[#0f1422] p-4 sm:p-5 border-b border-[#182234] space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-500 font-bold">FROM:</span>
                        <span className="text-white font-bold">{currentScenario.senderName}</span>
                        <span className="text-amber-400 font-mono">{"<"}{currentScenario.senderEmail}{">"}</span>
                      </div>
                      <span className="text-slate-500 text-[11px] font-mono">
                        SCENARIO {phishIdx + 1} OF {PHISHING_SCENARIOS.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-500 font-bold">RETURN-PATH:</span>
                      <span className="text-slate-300">{currentScenario.returnPath}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-500 font-bold">AUTHENTICATION:</span>
                      <span
                        className={`font-bold ${
                          currentScenario.spfDkim.includes("FAIL") ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {currentScenario.spfDkim}
                      </span>
                    </div>
                  </div>

                  {/* Email Content Body */}
                  <div className="p-6 sm:p-8 space-y-6">
                    <h3 className="text-lg font-bold text-white font-sans">{currentScenario.subject}</h3>
                    <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed font-sans">
                      {currentScenario.bodyText}
                    </p>

                    {/* Interactive Suspicious Link Component */}
                    <div className="bg-[#05070a] p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                          TARGET HYPERLINK {"//"} INTERACTIVE INSPECTION
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>HOVER, COPY, OR AUTO-INSPECT</span>
                        </span>
                      </div>

                      {/* Clickable Suspicious Link */}
                      <div className="group relative inline-block">
                        <a
                          href={currentScenario.hiddenActualLink}
                          onClick={handleSuspiciousLinkClick}
                          className="text-blue-400 underline font-mono text-xs sm:text-sm hover:text-blue-300 transition-colors inline-flex items-center gap-1.5 break-all cursor-pointer"
                          title="Click to trigger defensive interception"
                        >
                          <span>{currentScenario.visibleLink}</span>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        </a>

                        {/* Tooltip on hover */}
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/50 text-[11px] font-mono text-amber-300 shadow-xl whitespace-nowrap z-20">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span>ACTUAL DESTINATION: {currentScenario.hiddenActualLink}</span>
                        </div>
                      </div>

                      {/* Direct Action Buttons for Link */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-900">
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all"
                        >
                          {copyFeedback ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">{copyFeedback}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>COPY LINK ADDRESS</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleInspectInScanner}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00e575]/10 hover:bg-[#00e575]/20 border border-[#00e575]/30 text-xs font-mono text-[#00e575] font-bold transition-all shadow-[0_0_15px_rgba(0,229,117,0.15)]"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>AUTO-INSPECT IN FORENSIC SCANNER</span>
                        </button>
                      </div>
                    </div>

                    {/* Click Interception Alert Toast */}
                    {interceptWarning && (
                      <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono flex items-start gap-3 animate-fadeIn">
                        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-amber-400 block tracking-wider">
                            DEFENSIVE NAVIGATION SHIELD TRIGGERED
                          </span>
                          <p className="leading-relaxed text-slate-200 font-sans">{interceptWarning}</p>
                        </div>
                      </div>
                    )}

                    {/* Flag / Mark Answer Buttons */}
                    {phishFeedback === null ? (
                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800">
                        <button
                          onClick={() => handlePhishAnswer(true)}
                          className="px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>FLAG AS PHISHING</span>
                        </button>
                        <button
                          onClick={() => handlePhishAnswer(false)}
                          className="px-6 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>MARK AS LEGITIMATE</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-slate-800 space-y-4">
                        <div
                          className={`p-4 rounded-xl border flex items-start gap-3 ${
                            phishFeedback === "CORRECT"
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                              : "bg-red-500/10 border-red-500/40 text-red-400"
                          }`}
                        >
                          {phishFeedback === "CORRECT" ? (
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <span className="font-mono font-black text-sm block">
                              {phishFeedback === "CORRECT" ? "ACCURATE DIAGNOSIS!" : "INCORRECT ASSESSMENT"}
                            </span>
                            <p className="text-xs text-slate-300 font-sans">
                              {currentScenario.isPhishing
                                ? "This communication was malicious. The URL and header discrepancies confirmed phishing intent."
                                : "This was a clean communication with verified SPF/DKIM domain keys and zero URL mismatch."}
                            </p>
                          </div>
                        </div>

                        {currentScenario.redFlags.length > 0 && (
                          <div className="bg-[#05070a] p-4 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                              CRITICAL RED FLAGS DETECTED:
                            </span>
                            <ul className="space-y-1 text-xs text-slate-300 font-mono list-disc list-inside">
                              {currentScenario.redFlags.map((flag, idx) => (
                                <li key={idx}>{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <button
                          onClick={nextPhishScenario}
                          className={`px-6 py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                            phishIdx >= PHISHING_SCENARIOS.length - 1
                              ? "bg-gradient-to-r from-[#00e575] to-[#00b35a] text-black hover:scale-105 shadow-[0_0_20px_rgba(0,229,117,0.3)]"
                              : "bg-white text-black hover:bg-slate-200"
                          }`}
                        >
                          <span>
                            {phishIdx >= PHISHING_SCENARIOS.length - 1
                              ? "COMPLETE LAB 01 & VIEW RESULTS"
                              : "NEXT SCENARIO"}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ======================================================= */}
            {/* BUILT-IN PHISHING & URL FORENSIC SCANNER                */}
            {/* ======================================================= */}
            <div
              id="forensic-scanner"
              className="bg-[#070a10] border border-[#182234] rounded-2xl overflow-hidden shadow-2xl space-y-0"
            >
              {/* Terminal Title Bar */}
              <div className="bg-[#0a0e17] px-6 py-4 border-b border-[#182234] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[#00e575]">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Armoury Forensic Engine {"//"} Phishing & URL Scanner</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        ONLINE
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Simulated deep URL heuristic engine mirroring Armoury Tool #016 WHOIS & Tool #017 Website Security Report
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/tools/whois"
                    className="text-[11px] font-mono text-slate-400 hover:text-[#00e575] flex items-center gap-1 transition-colors"
                  >
                    <span>TOOL #016 WHOIS</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <span className="text-slate-600">|</span>
                  <Link
                    href="/tools/website-security-report"
                    className="text-[11px] font-mono text-slate-400 hover:text-[#00e575] flex items-center gap-1 transition-colors"
                  >
                    <span>TOOL #017 REPORT</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Interactive URL Input Bar */}
              <div className="p-6 bg-[#080c14] border-b border-[#182234] space-y-4">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  ENTER OR PASTE TARGET URL FOR HEURISTIC RECONNAISSANCE:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={scannerUrl}
                      onChange={(e) => setScannerUrl(e.target.value)}
                      placeholder="Paste suspicious link here (e.g. https://auth-phish-capture.xyz/login.php)..."
                      className="w-full bg-[#05070a] border border-[#182234] focus:border-[#00e575] text-white px-4 py-3 rounded-xl font-mono text-xs sm:text-sm outline-none transition-colors"
                    />
                    {scannerUrl && (
                      <button
                        onClick={() => setScannerUrl("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-mono"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setScannerUrl(currentScenario.hiddenActualLink);
                      handleRunForensicScan(currentScenario.hiddenActualLink);
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold whitespace-nowrap transition-all"
                  >
                    PASTE CURRENT SCENARIO
                  </button>
                  <button
                    onClick={() => handleRunForensicScan()}
                    disabled={isScanningUrl}
                    className="px-6 py-3 rounded-xl bg-[#00e575] hover:bg-[#00c565] text-black font-mono text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all shadow-[0_0_20px_rgba(0,229,117,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isScanningUrl ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>ANALYZING...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>ANALYZE URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Forensic Report Display */}
              {scannerReport ? (
                <div className="p-6 sm:p-8 space-y-6 animate-fadeIn bg-[#070a10]">
                  {/* Verdict & Score Banner */}
                  <div
                    className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                      scannerReport.threatScore >= 70
                        ? "bg-red-500/10 border-red-500/40 text-red-400"
                        : scannerReport.threatScore >= 30
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {scannerReport.threatScore >= 70 ? (
                          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                        ) : scannerReport.threatScore >= 30 ? (
                          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="font-mono font-black text-sm tracking-wider uppercase">
                          {scannerReport.threatLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans max-w-2xl">
                        {scannerReport.verdictSummary}
                      </p>
                    </div>

                    {/* Threat Index Dial */}
                    <div className="flex flex-col items-center justify-center bg-[#05070a] border border-slate-800 rounded-xl px-6 py-4 min-w-[160px]">
                      <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
                        THREAT INDEX
                      </span>
                      <span
                        className={`font-mono text-3xl font-black ${
                          scannerReport.threatScore >= 70
                            ? "text-red-400"
                            : scannerReport.threatScore >= 30
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {scannerReport.threatScore}/100
                      </span>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            scannerReport.threatScore >= 70
                              ? "bg-red-500"
                              : scannerReport.threatScore >= 30
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${scannerReport.threatScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4 Deep Heuristic Diagnostics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Diagnostic 1: WHOIS / Domain Age */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 font-bold flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-[#00e575]" />
                          <span>DOMAIN REGISTRATION (WHOIS)</span>
                        </span>
                        <span className="text-slate-500">{scannerReport.hostname}</span>
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">DOMAIN AGE:</span>
                          <span
                            className={
                              scannerReport.threatScore >= 50 ? "text-amber-400 font-bold" : "text-emerald-400"
                            }
                          >
                            {scannerReport.domainAge}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">REGISTRAR:</span>
                          <span className="text-slate-300">{scannerReport.registrar}</span>
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic 2: Typosquatting & Homoglyphs */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 font-bold flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-[#00e575]" />
                          <span>TYPOSQUATTING & HOMOGLYPHS</span>
                        </span>
                        <span className="text-slate-500">{scannerReport.tldRisk}</span>
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">MIMICRY STATUS:</span>
                          <span
                            className={
                              scannerReport.threatScore >= 50 ? "text-red-400 font-bold" : "text-emerald-400"
                            }
                          >
                            {scannerReport.typosquatting}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">TLD REPUTATION:</span>
                          <span className="text-slate-300">{scannerReport.tldRisk}</span>
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic 3: Payload & Threat Vector */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 font-bold flex items-center gap-2">
                          <Cpu className="w-3.5 h-3.5 text-[#00e575]" />
                          <span>PAYLOAD & INTENDED ACTION</span>
                        </span>
                        <span className="text-slate-500">HEURISTIC PARSER</span>
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">TARGET PAYLOAD:</span>
                          <span
                            className={
                              scannerReport.threatScore >= 50 ? "text-red-400 font-bold" : "text-emerald-400"
                            }
                          >
                            {scannerReport.payloadType}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">EXECUTION RISK:</span>
                          <span className="text-slate-300">
                            {scannerReport.threatScore >= 70
                              ? "HIGH (Credential/Malware Risk)"
                              : "MINIMAL / BENIGN"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic 4: Cryptographic Alignment */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 font-bold flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-[#00e575]" />
                          <span>CRYPTOGRAPHIC ALIGNMENT</span>
                        </span>
                        <span className="text-slate-500">MTA SECURITY</span>
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">SPF / DKIM STATUS:</span>
                          <span
                            className={
                              scannerReport.threatScore >= 50 ? "text-amber-400 font-bold" : "text-emerald-400"
                            }
                          >
                            {scannerReport.spfDkimAlignment}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">PROTOCOL:</span>
                          <span className="text-slate-300">
                            {scannerReport.url.startsWith("https") ? "HTTPS (TLS Encrypted)" : "HTTP (Insecure Plaintext)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Red Flags List */}
                  {scannerReport.keyRedFlags.length > 0 && (
                    <div className="bg-[#05070a] p-5 rounded-xl border border-red-500/30 space-y-2">
                      <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>RECONNAISSANCE RED FLAGS IDENTIFIED:</span>
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-300 font-mono list-disc list-inside">
                        {scannerReport.keyRedFlags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actionable Operator Next Steps */}
                  <div className="p-4 rounded-xl border border-[#00e575]/30 bg-[#00e575]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-[#00e575] uppercase tracking-wider block">
                        TACTICAL OPERATOR DIRECTIVE:
                      </span>
                      <p className="text-xs text-slate-300 font-sans">
                        {scannerReport.threatScore >= 70
                          ? "Quarantine sender domain at edge DNS resolver. Block outbound HTTP traffic to this host and submit IOCs to internal SOC."
                          : "Verify DNSSEC chain and inspect TLS certificate validity in Armoury Tool #017 Website Security Report."}
                      </p>
                    </div>
                    <Link
                      href={scannerReport.threatScore >= 70 ? "/tools/whois" : "/tools/website-security-report"}
                      className="px-4 py-2 rounded-xl bg-white text-black font-mono font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
                    >
                      <span>TEST IN ARMOURY</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#070a10] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-mono font-bold text-slate-300">
                      SCANNER STANDING BY {"//"} NO URL LOADED
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
                      Click <strong className="text-slate-300">&quot;PASTE CURRENT SCENARIO&quot;</strong> above or copy any link from the email scenario to run simulated heuristic intelligence.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================= */}
            {/* HOW TO AVOID THIS IN REAL LIFE (FIELD GUIDE)            */}
            {/* ======================================================= */}
            <div className="bg-[#070a10] border border-[#182234] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* Field Guide Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182234] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>OPERATOR DEFENSE MANUAL {"//"} REAL-WORLD PROTOCOLS</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black font-display text-white tracking-wide">
                    How to Avoid Phishing & Social Engineering in Real Life
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full self-start sm:self-auto">
                  4 IRONCLAD DEFENSE RULES
                </span>
              </div>

              {/* 4 Tactical Defense Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rule 1: The Direct Navigation Law */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      01
                    </span>
                    <span>THE DIRECT NAVIGATION LAW</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Never click links inside unprompted account alerts.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Over 90% of successful credential thefts originate from email links masquerading as PayPal, Microsoft, Google, or bank notifications.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">REAL-WORLD EXAMPLE:</span>
                    <p className="text-slate-400 font-sans leading-normal">
                      If PayPal emails saying your account is locked, <strong>do not click the button</strong>. Open a clean browser tab, manually type <code className="text-emerald-400">paypal.com</code>, and log in. If an alert is genuine, it will be in your verified dashboard notification bell.
                    </p>
                  </div>
                </div>

                {/* Rule 2: Read URLs Backwards (Domain Suffix Trick) */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      02
                    </span>
                    <span>READ DOMAINS BACKWARDS (THE SUFFIX TRICK)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Find the first single slash &quot;/&quot; to expose the true root domain.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Attackers exploit human left-to-right reading order by stacking trusted brand names into fake subdomains.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">REAL-WORLD ANATOMY:</span>
                    <div className="text-[11px] bg-slate-950 p-2 rounded border border-slate-800 break-all">
                      <span className="text-slate-500">https://</span>
                      <span className="text-slate-400">identity.company.com.</span>
                      <span className="text-red-400 font-bold underline">auth-phish-capture.xyz</span>
                      <span className="text-slate-500">/login</span>
                    </div>
                    <p className="text-slate-400 font-sans leading-normal text-[11px]">
                      The text before the first single slash is <code className="text-red-400">auth-phish-capture.xyz</code>. The corporate name in front is just a deceptive subdomain owned by the hacker!
                    </p>
                  </div>
                </div>

                {/* Rule 3: The 2-Hour Urgency Smell Test */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      03
                    </span>
                    <span>THE 2-HOUR URGENCY SMELL TEST</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Panic deadlines are engineered to bypass your rational scrutiny.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Social engineers rely on amygdala hijack. Phrases like <em>&quot;Account terminated in 2 hours&quot;</em> or <em>&quot;Immediate lawsuit notice&quot;</em> trigger adrenaline so you act before thinking.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">REAL-WORLD EXAMPLE:</span>
                    <p className="text-slate-400 font-sans leading-normal">
                      Enterprise platforms (Microsoft, AWS, Google, banks) provide weeks of advance warnings and multi-channel escalation before terminating production accounts. A tight 60-120 minute ultimatum is a 99% indicator of fraud.
                    </p>
                  </div>
                </div>

                {/* Rule 4: Hardware Passkeys & FIDO2 */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      04
                    </span>
                    <span>HARDWARE PASSKEYS & FIDO2 (THE UNPHISHABLE SHIELD)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Cryptographic public-key binding makes credential theft impossible.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Passwords and even 6-digit SMS/TOTP codes can be intercepted in real-time by adversary proxy kits (like Evilginx). Passkeys eliminate this vector entirely.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">WHY PASSKEYS DEFEAT PHISHING:</span>
                    <p className="text-slate-400 font-sans leading-normal">
                      A Passkey binds cryptographically to the exact verified origin URL in your browser. Even if a hacker tricks you into visiting <code className="text-red-400">g00gle.com</code>, your browser signs for that fake domain, which Google&apos;s real server instantly rejects.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================= */}
        {/* TAB 2: CRACK-TIME & BRUTE-FORCE SIMULATOR               */}
        {/* ======================================================= */}
        {activeTab === "cracktime" && (
          <section className="space-y-8 animate-fadeIn">
            {/* Lab 02 Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#070a10] border border-[#182234] p-6 rounded-2xl">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/20">
                    LAB 02 {"//"} CHALLENGE {crackIdx + 1} OF {CRACK_MISSIONS.length}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">{"//"}</span>
                  <span className="text-slate-400 font-mono text-xs">8x RTX 4090 GPU CLUSTER (104.2 GH/s)</span>
                </div>
                <h2 className="text-xl font-black font-display text-white uppercase tracking-wider flex items-center gap-2.5">
                  <Key className="w-5 h-5 text-[#00e575]" />
                  <span>Lab 02 {"//"} Password Entropy & Hashcat GPU Rig Simulator</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Deconstruct brute-force mathematics, GPU parallel capabilities, dictionary rule engines, and memory-hard hash resistance.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#05070a] border border-[#182234] px-4 py-2 rounded-xl flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">SCORE:</span>
                    <span className="text-sm font-mono font-black text-[#00e575]">
                      {crackScore} / {CRACK_MISSIONS.length}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <Link
                    href="/tools/password-strength"
                    className="flex items-center gap-1.5 text-xs font-mono text-[#00e575] hover:underline"
                    title="Open Password Strength Tool"
                  >
                    <span>TOOL #008</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar (Strict 5/5 Scale) */}
            <div className="grid grid-cols-5 gap-2">
              {CRACK_MISSIONS.map((m, idx) => {
                const isCurrent = idx === crackIdx && !lab02Completed;
                const isPast = idx < crackIdx || (lab02Completed && answeredCrackMissions[idx]);
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (answeredCrackMissions[idx] || lab02Completed) {
                        handleSfx("click");
                        setCrackIdx(idx);
                        setLab02Completed(false);
                        setCrackFeedback(null);
                        setShowCrackHints(false);
                        setActiveRigOutput(null);
                      }
                    }}
                    className={`h-2 rounded-full transition-all ${
                      isPast
                        ? "bg-[#00e575] shadow-[0_0_8px_rgba(0,229,117,0.4)]"
                        : isCurrent
                        ? "bg-amber-400 animate-pulse"
                        : "bg-slate-800"
                    }`}
                    title={`Mission 0${m.id}: ${m.category}`}
                  />
                );
              })}
            </div>

            {/* ---------------------------------------------------- */}
            {/* VIEW A: 5/5 COMPLETION & DEBRIEFING SCREEN           */}
            {/* ---------------------------------------------------- */}
            {lab02Completed ? (
              <div className="bg-[#070a10] border border-[#00e575]/40 rounded-2xl p-8 sm:p-12 text-center space-y-8 animate-fadeIn shadow-[0_0_40px_rgba(0,229,117,0.1)]">
                {/* Visual Icon Badge */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#00e575]/20 animate-ping" />
                  <div className="relative w-20 h-20 rounded-full bg-[#00e575]/10 border border-[#00e575] flex items-center justify-center text-[#00e575] shadow-[0_0_30px_rgba(0,229,117,0.3)]">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                </div>

                <div className="space-y-3 max-w-2xl mx-auto">
                  <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#00e575] uppercase block">
                    {"[MISSION 02 COMPLETE // CRACK-TIME & ENTROPY SIMULATOR DEBRIEF]"}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-wider">
                    CRYPTANALYTIC LAB CLEARANCE RECORDED
                  </h3>
                  <p className="text-slate-300 text-sm font-sans leading-relaxed">
                    {crackScore === 5
                      ? "Flawless cryptographic intelligence! You mastered the mathematical exponential scaling of passphrases, understood why dictionary rules defeat leetspeak, identified credential stuffing vectors, and verified memory-hard slow hash resistance against 8x RTX 4090 clusters."
                      : crackScore >= 3
                      ? "Solid tactical defensive clearance! You demonstrated strong comprehension of GPU brute-force mechanics and passphrase defense principles."
                      : "Mission completed. Review the field defense guide below to reinforce knowledge on keyspace scaling, dictionary rule engines, and memory hardness."}
                  </p>
                </div>

                {/* Score Summary Box */}
                <div className="max-w-md mx-auto bg-[#0a0e17] border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 font-mono text-xs">
                    <span className="text-slate-400">OPERATOR RATING:</span>
                    <span
                      className={`font-black ${
                        crackScore === 5
                          ? "text-[#00e575]"
                          : crackScore >= 3
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {crackScore === 5
                        ? "MASTER CRYPTANALYST (100%)"
                        : crackScore >= 3
                        ? "QUALIFIED DEFENSIVE ARCHITECT"
                        : "PROVISIONAL CADET"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-mono text-slate-400">FINAL CLEARANCE SCORE:</span>
                    <span className="font-mono text-3xl font-black text-[#00e575]">
                      {crackScore} / {CRACK_MISSIONS.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        crackScore === 5
                          ? "bg-[#00e575]"
                          : crackScore >= 3
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${(crackScore / CRACK_MISSIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Two Direct Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 max-w-lg mx-auto">
                  <button
                    onClick={() => {
                      handleSfx("click");
                      setActiveTab("auth");
                    }}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00e575] to-[#00b35a] text-black font-mono font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,229,117,0.4)] flex items-center justify-center gap-2"
                  >
                    <span>MOVE TO NEXT LAB ➔ (03 AUTH DEFENSE)</span>
                  </button>

                  <button
                    onClick={restartLab02}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>REDO LAB 02</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* -------------------------------------------------- */}
                {/* VIEW B: ACTIVE MISSION & CHALLENGE QUESTIONS       */}
                {/* -------------------------------------------------- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Mission Card & Multiple Choice (7 Cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-[#0a0e17] border border-[#182234] rounded-2xl p-6 sm:p-7 space-y-6">
                      {/* Mission Category & Target Callout */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-amber-400 tracking-widest uppercase block">
                            CHALLENGE 0{currentCrackMission.id} {"//"} {currentCrackMission.category}
                          </span>
                          <h3 className="text-lg font-bold text-white font-sans">
                            {currentCrackMission.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-[#05070a] border border-slate-800 text-[11px] font-mono text-slate-300">
                            HASH: <strong className="text-amber-400">{currentCrackMission.hashType}</strong>
                          </span>
                          <span className="px-2.5 py-1 rounded bg-[#05070a] border border-slate-800 text-[11px] font-mono text-slate-300">
                            ENTROPY: <strong className="text-[#00e575]">{currentCrackMission.entropyBits} BITS</strong>
                          </span>
                        </div>
                      </div>

                      {/* Candidate Password Target Box */}
                      <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                            TARGET SPECIMEN IN AUDIT:
                          </span>
                          <code className="text-[#00e575] font-mono font-bold text-lg tracking-wide break-all block">
                            {currentCrackMission.targetPassword}
                          </code>
                        </div>

                        <button
                          onClick={() => {
                            setCandidatePassword(currentCrackMission.targetPassword);
                            runSimulatedHashcat();
                          }}
                          className="px-3.5 py-2 rounded-lg bg-[#00e575]/10 hover:bg-[#00e575]/20 border border-[#00e575]/30 text-[#00e575] text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap self-start sm:self-auto"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>LOAD IN RIG</span>
                        </button>
                      </div>

                      {/* Core Concept Briefing */}
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>TACTICAL BRIEFING:</span>
                        </span>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed">
                          {currentCrackMission.conceptSummary}
                        </p>
                      </div>

                      {/* Tactical Question */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00e575]" />
                          <h4 className="text-sm font-bold text-white font-sans">
                            {currentCrackMission.question}
                          </h4>
                        </div>

                        {/* Interactive Options List */}
                        <div className="space-y-2.5">
                          {currentCrackMission.options.map((opt) => {
                            const isAnswered = answeredCrackMissions[crackIdx];
                            const isCorrect = opt.isCorrect;
                            return (
                              <button
                                key={opt.id}
                                disabled={isAnswered}
                                onClick={() => handleCrackOptionSelect(opt.isCorrect)}
                                className={`w-full text-left p-4 rounded-xl border transition-all text-xs font-sans leading-relaxed flex items-start gap-3 ${
                                  isAnswered
                                    ? isCorrect
                                      ? "border-[#00e575] bg-[#00e575]/10 text-emerald-200 shadow-[0_0_15px_rgba(0,229,117,0.15)]"
                                      : "border-slate-800/60 bg-[#05070a]/60 text-slate-500 opacity-60"
                                    : "border-slate-800 bg-[#05070a] hover:bg-[#0c121e] hover:border-slate-700 text-slate-300 hover:text-white"
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg border font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                                    isAnswered && isCorrect
                                      ? "border-[#00e575] bg-[#00e575] text-black"
                                      : "border-slate-700 bg-slate-900 text-slate-400"
                                  }`}
                                >
                                  {opt.id}
                                </span>
                                <span className="pt-0.5">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tactical Evaluation Feedback Banner */}
                      {crackFeedback && (
                        <div
                          className={`p-5 rounded-xl border space-y-3 animate-fadeIn ${
                            crackFeedback === "CORRECT"
                              ? "border-[#00e575]/40 bg-[#00e575]/10 text-emerald-300"
                              : "border-red-500/40 bg-red-500/10 text-red-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2">
                              {crackFeedback === "CORRECT" ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
                                  <span>[CLEARANCE VERIFIED // TACTICAL ANALYSIS CORRECT]</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-red-400" />
                                  <span>[ANALYSIS REJECTED // RE-EVALUATION REQUIRED]</span>
                                </>
                              )}
                            </span>
                            <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded border border-white/10 text-slate-300">
                              +1 TO CLEARANCE SCORE
                            </span>
                          </div>

                          <p className="text-xs text-slate-200 font-sans leading-relaxed">
                            {currentCrackMission.explanation}
                          </p>

                          <div className="pt-2">
                            <button
                              onClick={handleNextCrackMission}
                              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00e575] to-[#00b35a] text-black font-mono font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                              <span>
                                {crackIdx + 1 < CRACK_MISSIONS.length
                                  ? `CONTINUE TO CHALLENGE 0${crackIdx + 2} ➔`
                                  : "VIEW LAB 02 DEBRIEF & SCORE ➔"}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Live Simulated Hashcat GPU Rig Terminal (5 Cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#070a10] border border-[#182234] rounded-2xl overflow-hidden shadow-2xl space-y-0">
                      {/* Terminal Top Window Titlebar */}
                      <div className="bg-[#04060a] border-b border-[#182234] px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          <span className="text-slate-400 font-mono text-[11px] font-bold ml-2">
                            HASHCAT v6.2.6 // GPU RIG CLUSTER
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                          <span>104.2 GH/s</span>
                        </div>
                      </div>

                      {/* Terminal Main Display */}
                      <div className="p-5 font-mono text-xs space-y-4 bg-[#05070a]">
                        {/* Terminal Command Line */}
                        <div className="space-y-1">
                          <span className="text-slate-500 text-[10px]">OPERATOR TERMINAL DISPATCH:</span>
                          <div className="bg-black/70 p-2.5 rounded-lg border border-slate-900 text-slate-300 font-mono text-[11px] break-all">
                            <span className="text-[#00e575]">$ </span>
                            <span>hashcat -m {currentCrackMission.hashType === "NTLM" ? "1000" : currentCrackMission.hashType === "Argon2id" ? "10900" : "1400"} -a 0 hashes.txt -r rules/best64.rule</span>
                          </div>
                        </div>

                        {/* Hardware Telemetry Card */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-black/50 p-2.5 rounded border border-slate-900">
                            <span className="text-slate-500 block text-[9px] uppercase">ACCELERATOR RIG</span>
                            <span className="text-white font-bold">8x RTX 4090</span>
                          </div>
                          <div className="bg-black/50 p-2.5 rounded border border-slate-900">
                            <span className="text-slate-500 block text-[9px] uppercase">TOTAL VRAM</span>
                            <span className="text-amber-400 font-bold">192 GB GDDR6X</span>
                          </div>
                          <div className="bg-black/50 p-2.5 rounded border border-slate-900">
                            <span className="text-slate-500 block text-[9px] uppercase">ATTACK MODE</span>
                            <span className="text-[#00e575] font-bold truncate block">
                              {currentCrackMission.attackMethod.split(" ")[0]}
                            </span>
                          </div>
                          <div className="bg-black/50 p-2.5 rounded border border-slate-900">
                            <span className="text-slate-500 block text-[9px] uppercase flex items-center gap-1">
                              <Flame className="w-2.5 h-2.5 text-amber-500" />
                              <span>RIG POWER &amp; THERMALS</span>
                            </span>
                            <span className="text-slate-300 font-bold">{currentCrackMission.rigTelemetry.powerW}W // {currentCrackMission.rigTelemetry.tempC}°C</span>
                          </div>
                        </div>

                        {/* Hash Inspection Box */}
                        <div className="space-y-1">
                          <span className="text-slate-500 text-[10px] uppercase flex items-center gap-1">
                            <Database className="w-2.5 h-2.5 text-slate-400" />
                            <span>TARGET CRYPTOGRAPHIC HASH:</span>
                          </span>
                          <div className="p-2.5 rounded bg-black/60 border border-slate-900 font-mono text-[10px] text-amber-300 break-all select-all">
                            {currentCrackMission.mockHash}
                          </div>
                        </div>

                        {/* Trigger Simulator Action Button */}
                        <button
                          onClick={() => runSimulatedHashcat()}
                          disabled={simulatingHashcat}
                          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-[#00e575]/40 text-[#00e575] hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,117,0.1)]"
                        >
                          {simulatingHashcat ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00e575]" />
                              <span>COMPUTING 104 BILLION HASHES/SEC...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-[#00e575]" />
                              <span>EXECUTE HASHCAT CLUSTER AUDIT</span>
                            </>
                          )}
                        </button>

                        {/* Output Status Stream */}
                        {simulatingHashcat && (
                          <div className="p-3 rounded-lg bg-black/80 border border-[#00e575]/20 space-y-1.5 animate-pulse">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>KEYSPACE PROGRESSION:</span>
                              <span className="text-[#00e575]">STREAMING CANDIDATES</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-[#00e575] animate-pulse w-3/4" />
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate">
                              Testing: $HEX[5040737377307264] // best64.rule applied
                            </span>
                          </div>
                        )}

                        {activeRigOutput && !simulatingHashcat && (
                          <div
                            className={`p-4 rounded-xl border space-y-2 animate-fadeIn ${
                              activeRigOutput.status === "CRACKED" || activeRigOutput.status === "BYPASSED_NO_CRACK_NEEDED"
                                ? "bg-red-500/10 border-red-500/30 text-red-200"
                                : "bg-[#00e575]/10 border-[#00e575]/30 text-emerald-200"
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="uppercase">STATUS: {activeRigOutput.status}</span>
                              <span className="font-mono text-[11px]">{activeRigOutput.timeLabel}</span>
                            </div>

                            <div className="text-[11px] font-mono space-y-1 pt-1 border-t border-white/10">
                              <div className="flex justify-between">
                                <span className="text-slate-400">THROUGHPUT:</span>
                                <span className="text-white font-bold">{activeRigOutput.hashrate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">RESULT:</span>
                                <span className="text-white font-bold break-all">{activeRigOutput.plaintext}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Free-form Interactive Custom Passphrase Sandbox */}
                    <div className="bg-[#0a0e17] border border-[#182234] rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-[#00e575]" />
                          <span>FREE-FORM PASSPHRASE TESTER</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">*CLIENT ONLY</span>
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={candidatePassword}
                          onChange={(e) => setCandidatePassword(e.target.value)}
                          className="w-full bg-[#05070a] border border-[#182234] focus:border-[#00e575] text-white px-3.5 py-2.5 rounded-xl font-mono text-sm outline-none transition-colors"
                          placeholder="Type any candidate password..."
                        />
                      </div>

                      {/* 4 Quick Gauges */}
                      <div className="grid grid-cols-4 gap-2 text-center font-mono">
                        <div className="bg-[#05070a] p-2 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">LENGTH</span>
                          <span className="text-xs font-bold text-white">{passwordStats.len}</span>
                        </div>
                        <div className="bg-[#05070a] p-2 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">KEYSPACE</span>
                          <span className="text-xs font-bold text-amber-400">{passwordStats.pool}</span>
                        </div>
                        <div className="bg-[#05070a] p-2 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">ENTROPY</span>
                          <span className="text-xs font-bold text-[#00e575]">{passwordStats.entropy}b</span>
                        </div>
                        <div className="bg-[#05070a] p-2 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">RATING</span>
                          <span className="text-xs font-bold text-white">{passwordStats.grade}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#05070a] border border-slate-800 flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-400 text-[10px]">TIME TO CRACK (8x RTX 4090):</span>
                        <span className="text-white font-bold">{passwordStats.timeLabel}</span>
                      </div>

                      <button
                        onClick={() => runSimulatedHashcat(candidatePassword)}
                        className="w-full py-2 rounded-lg bg-[#05070a] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold transition-all"
                      >
                        TEST CANDIDATE IN GPU SIMULATOR
                      </button>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* NEED A HINT? OPERATOR INTEL DRAWER                 */}
                {/* -------------------------------------------------- */}
                <div className="border border-[#182234] bg-[#070a10] rounded-2xl overflow-hidden transition-all shadow-md">
                  <button
                    onClick={() => {
                      handleSfx("click");
                      setShowCrackHints(!showCrackHints);
                    }}
                    className="w-full flex items-center justify-between px-6 py-3.5 bg-[#0a0e17] hover:bg-[#0f1422] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                        NEED A HINT? {"//"} OPERATOR INTEL
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                        3 TACTICAL CLUES AVAILABLE
                      </span>
                    </div>
                    {showCrackHints ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {showCrackHints && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#182234] bg-[#05070a] animate-fadeIn">
                      {currentCrackMission.hints.map((hint, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-800 bg-[#070a10] space-y-2"
                        >
                          <div className="flex items-center gap-2 text-amber-400 font-mono text-[11px] font-bold">
                            <span className="w-4 h-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span>TACTICAL CLUE {idx + 1}</span>
                          </div>
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            {hint}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ---------------------------------------------------- */}
            {/* FIELD DEFENSE GUIDE: UNCRACKABLE AUTHENTICATION       */}
            {/* ---------------------------------------------------- */}
            <div className="border border-[#182234] bg-[#070a10] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#182234] pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#00e575] font-mono text-xs font-bold uppercase tracking-widest">
                    <Shield className="w-4 h-4" />
                    <span>DEFENSIVE OPERATOR HANDBOOK {"//"} FIELD DEFENSE GUIDE</span>
                  </div>
                  <h3 className="text-lg font-black font-display text-white uppercase tracking-wider">
                    How to Build Uncrackable Passwords in Real Life
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 self-start sm:self-auto">
                  FOUR PILLARS OF AUTHENTICATION HYGIENE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rule 1: The XKCD Passphrase Standard */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      01
                    </span>
                    <span>THE XKCD PASSPHRASE STANDARD (LENGTH &gt; COMPLEXITY)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    4 or 5 random dictionary words defeat multi-GPU clusters effortlessly.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Length is the exponent in total keyspace math (<code className="text-emerald-400">Pool^Length</code>). An 8-character complex password has only 6.6 quadrillion combinations, whereas a 28-character passphrase creates over <code className="text-emerald-400">10^40</code> combinations.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">REAL-WORLD EXAMPLE:</span>
                    <p className="text-slate-400 font-sans leading-normal">
                      Instead of struggling to remember <code className="text-red-400">Tr0ub4dor&amp;3</code> (cracked in 3.8s), use: <code className="text-emerald-400">correct-horse-battery-staple</code> or <code className="text-emerald-400">velvet-crypto-glacier-matrix</code>. High entropy, humanly memorizable, and impossible for GPUs to brute-force.
                    </p>
                  </div>
                </div>

                {/* Rule 2: Zero-Reuse Policy */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      02
                    </span>
                    <span>ZERO-REUSE POLICY (DEFEATING CREDENTIAL STUFFING)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    A 30-character password provides zero security if reused across two sites.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Over 80% of data breaches involve credential stuffing. When a low-security forum or shopping site is breached, automated botnets immediately replay that email and password combination against banks, AWS, and Google.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">REAL-WORLD DEFENSE:</span>
                    <p className="text-slate-400 font-sans leading-normal">
                      Every service must have a completely distinct credential. If one website suffers a catastrophic database leak, your email, banking, and cloud infrastructures remain completely untouched.
                    </p>
                  </div>
                </div>

                {/* Rule 3: Dedicated Password Managers */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      03
                    </span>
                    <span>DEDICATED PASSWORD MANAGERS (ZERO-KNOWLEDGE VAULTS)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Humans cannot memorize 100+ unique 20-character passwords; computers can.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Modern password managers (Bitwarden, 1Password, KeePassXC) use client-side AES-256 and Argon2 key derivation. Your master passphrase encrypts the vault locally before any synchronization occurs.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">THE ONLY THING TO MEMORIZE:</span>
                    <p className="text-slate-400 font-sans leading-normal">
                      Memorize exactly ONE strong 4-word passphrase for your password manager vault. Let the manager auto-generate 24-character random strings (<code className="text-emerald-400">k7$9P!q#m2Z...</code>) for every other account.
                    </p>
                  </div>
                </div>

                {/* Rule 4: Phishing-Resistant MFA & Hardware Passkeys */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      04
                    </span>
                    <span>HARDWARE PASSKEYS &amp; FIDO2 (THE UNCRACKABLE SHIELD)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Physical cryptographic keys make password cracking completely irrelevant.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    FIDO2 hardware keys (like YubiKey) and WebAuthn Passkeys do not transmit shared secrets. Instead, they complete an asymmetric public-key signature bound to the verified domain name in your browser.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">WHY GPUS CANNOT ATTACK PASSKEYS:</span>
                    <p className="text-slate-400 font-sans leading-normal">
                      There is no password hash stored in the server database for an adversary to steal and feed into Hashcat. Even with infinite GPU clusters, an adversary cannot log in without the physical hardware token.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================= */}
        {/* TAB 3: MOCK LOGIN & AUTH DEFENSE LAB                    */}
        {/* ======================================================= */}
        {activeTab === "auth" && (
          <section className="space-y-8 animate-fadeIn">
            {/* Lab 03 Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#070a10] border border-[#182234] p-6 rounded-2xl">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/20">
                    LAB 03 {"//"} CHALLENGE {authIdx + 1} OF {AUTH_MISSIONS.length}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">{"//"}</span>
                  <span className="text-slate-400 font-mono text-xs">POSTGRESQL v16 (SANDBOX ENGINE)</span>
                </div>
                <h2 className="text-xl font-black font-display text-white uppercase tracking-wider flex items-center gap-2.5">
                  <Lock className="w-5 h-5 text-[#00e575]" />
                  <span>Lab 03 {"//"} Authentication Bypass &amp; SQL Injection Sandbox</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Deconstruct SQL injection mechanics, boolean tautologies, union exfiltration, and server-side parameterized query defenses.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#05070a] border border-[#182234] px-4 py-2 rounded-xl flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">SCORE:</span>
                    <span className="text-sm font-mono font-black text-[#00e575]">
                      {authScore} / {AUTH_MISSIONS.length}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div className="text-left font-mono text-[10px] text-slate-400">
                    <span className="text-slate-500 block">DEFENSE ENGINE</span>
                    <span className={usePreparedStatements ? "text-[#00e575] font-bold" : "text-amber-400 font-bold"}>
                      {usePreparedStatements ? "PREPARED STMT" : "RAW CONCAT"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar (Strict 5/5 Scale) */}
            <div className="grid grid-cols-5 gap-2">
              {AUTH_MISSIONS.map((m, idx) => {
                const isCurrent = idx === authIdx && !lab03Completed;
                const isPast = idx < authIdx || (lab03Completed && answeredAuthMissions[idx]);
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (answeredAuthMissions[idx] || lab03Completed) {
                        handleSfx("click");
                        setAuthIdx(idx);
                        setLab03Completed(false);
                        setAuthFeedback(null);
                        setShowAuthHints(false);
                        setLoginOutput(null);
                        setLoginUser(AUTH_MISSIONS[idx].defaultUsername);
                        setLoginPass(AUTH_MISSIONS[idx].defaultPasswordOrPayload);
                      }
                    }}
                    className={`h-2 rounded-full transition-all ${
                      isPast
                        ? "bg-[#00e575] shadow-[0_0_8px_rgba(0,229,117,0.4)]"
                        : isCurrent
                        ? "bg-amber-400 animate-pulse"
                        : "bg-slate-800"
                    }`}
                    title={`Mission 0${m.id}: ${m.category}`}
                  />
                );
              })}
            </div>

            {/* ---------------------------------------------------- */}
            {/* VIEW A: 5/5 COMPLETION & DEBRIEFING SCREEN           */}
            {/* ---------------------------------------------------- */}
            {lab03Completed ? (
              <div className="bg-[#070a10] border border-[#00e575]/40 rounded-2xl p-8 sm:p-12 text-center space-y-8 animate-fadeIn shadow-[0_0_40px_rgba(0,229,117,0.1)]">
                {/* Visual Icon Badge */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#00e575]/20 animate-ping" />
                  <div className="relative w-20 h-20 rounded-full bg-[#00e575]/10 border border-[#00e575] flex items-center justify-center text-[#00e575] shadow-[0_0_30px_rgba(0,229,117,0.3)]">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                </div>

                <div className="space-y-3 max-w-2xl mx-auto">
                  <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#00e575] uppercase block">
                    {"[MISSION 03 COMPLETE // SQL INJECTION & AUTH DEFENSE DEBRIEF]"}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-wider">
                    APPLICATION SECURITY CLEARANCE RECORDED
                  </h3>
                  <p className="text-slate-300 text-sm font-sans leading-relaxed">
                    {authScore === 5
                      ? "Flawless application security intelligence! You deconstructed how unparameterized concatenation allows boolean tautologies and comment truncation to hijack authentication, analyzed UNION exfiltration vectors, and proved how prepared statements and atomic rate limiters eliminate account takeovers."
                      : authScore >= 3
                      ? "Solid defensive aptitude! You demonstrated strong comprehension of SQL injection mechanics and modern server-side parameterization defenses."
                      : "Mission completed. Review the field defense guide below to reinforce knowledge on parameterized queries, ORM safety, and distributed rate limiting."}
                  </p>
                </div>

                {/* Score Summary Box */}
                <div className="max-w-md mx-auto bg-[#0a0e17] border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 font-mono text-xs">
                    <span className="text-slate-400">OPERATOR RATING:</span>
                    <span
                      className={`font-black ${
                        authScore === 5
                          ? "text-[#00e575]"
                          : authScore >= 3
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {authScore === 5
                        ? "MASTER APPSEC DEFENDER (100%)"
                        : authScore >= 3
                        ? "QUALIFIED APPLICATION SECURITY ANALYST"
                        : "PROVISIONAL CADET"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-mono text-slate-400">FINAL CLEARANCE SCORE:</span>
                    <span className="font-mono text-3xl font-black text-[#00e575]">
                      {authScore} / {AUTH_MISSIONS.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        authScore === 5
                          ? "bg-[#00e575]"
                          : authScore >= 3
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${(authScore / AUTH_MISSIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Two Direct Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 max-w-lg mx-auto">
                  <button
                    onClick={() => {
                      handleSfx("click");
                      setActiveTab("ports");
                    }}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00e575] to-[#00b35a] text-black font-mono font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,229,117,0.4)] flex items-center justify-center gap-2"
                  >
                    <span>MOVE TO NEXT LAB ➔ (04 PORT SCANNER)</span>
                  </button>

                  <button
                    onClick={restartLab03}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>REDO LAB 03</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* -------------------------------------------------- */}
                {/* VIEW B: ACTIVE MISSION & CHALLENGE QUESTIONS       */}
                {/* -------------------------------------------------- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Mission Card & Multiple Choice (7 Cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-[#0a0e17] border border-[#182234] rounded-2xl p-6 sm:p-7 space-y-6">
                      {/* Mission Category & Target Callout */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-amber-400 tracking-widest uppercase block">
                            CHALLENGE 0{currentAuthMission.id} {"//"} {currentAuthMission.category}
                          </span>
                          <h3 className="text-lg font-bold text-white font-sans">
                            {currentAuthMission.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-[#05070a] border border-slate-800 text-[11px] font-mono text-slate-300">
                            ENDPOINT: <strong className="text-amber-400">{currentAuthMission.targetEndpoint}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Candidate Payload Target Box */}
                      <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                            TARGET INJECTION PAYLOAD SPECIMEN:
                          </span>
                          <code className="text-[#00e575] font-mono font-bold text-base tracking-wide break-all block">
                            {currentAuthMission.defaultPasswordOrPayload}
                          </code>
                        </div>

                        <button
                          onClick={() => {
                            setLoginUser(currentAuthMission.defaultUsername);
                            setLoginPass(currentAuthMission.defaultPasswordOrPayload);
                            handleExecuteDatabaseQuery(
                              currentAuthMission.defaultUsername,
                              currentAuthMission.defaultPasswordOrPayload
                            );
                          }}
                          className="px-3.5 py-2 rounded-lg bg-[#00e575]/10 hover:bg-[#00e575]/20 border border-[#00e575]/30 text-[#00e575] text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap self-start sm:self-auto"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>LOAD IN DATABASE</span>
                        </button>
                      </div>

                      {/* Core Concept Briefing */}
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>TACTICAL BRIEFING:</span>
                        </span>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed">
                          {currentAuthMission.conceptSummary}
                        </p>
                      </div>

                      {/* Tactical Question */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00e575]" />
                          <h4 className="text-sm font-bold text-white font-sans">
                            {currentAuthMission.question}
                          </h4>
                        </div>

                        {/* Interactive Options List */}
                        <div className="space-y-2.5">
                          {currentAuthMission.options.map((opt) => {
                            const isAnswered = answeredAuthMissions[authIdx];
                            const isCorrect = opt.isCorrect;
                            return (
                              <button
                                key={opt.id}
                                disabled={isAnswered}
                                onClick={() => handleAuthOptionSelect(opt.isCorrect)}
                                className={`w-full text-left p-4 rounded-xl border transition-all text-xs font-sans leading-relaxed flex items-start gap-3 ${
                                  isAnswered
                                    ? isCorrect
                                      ? "border-[#00e575] bg-[#00e575]/10 text-emerald-200 shadow-[0_0_15px_rgba(0,229,117,0.15)]"
                                      : "border-slate-800/60 bg-[#05070a]/60 text-slate-500 opacity-60"
                                    : "border-slate-800 bg-[#05070a] hover:bg-[#0c121e] hover:border-slate-700 text-slate-300 hover:text-white"
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg border font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                                    isAnswered && isCorrect
                                      ? "border-[#00e575] bg-[#00e575] text-black"
                                      : "border-slate-700 bg-slate-900 text-slate-400"
                                  }`}
                                >
                                  {opt.id}
                                </span>
                                <span className="pt-0.5">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tactical Evaluation Feedback Banner */}
                      {authFeedback && (
                        <div
                          className={`p-5 rounded-xl border space-y-3 animate-fadeIn ${
                            authFeedback === "CORRECT"
                              ? "border-[#00e575]/40 bg-[#00e575]/10 text-emerald-300"
                              : "border-red-500/40 bg-red-500/10 text-red-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2">
                              {authFeedback === "CORRECT" ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
                                  <span>[CLEARANCE VERIFIED // TACTICAL ANALYSIS CORRECT]</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-red-400" />
                                  <span>[ANALYSIS REJECTED // RE-EVALUATION REQUIRED]</span>
                                </>
                              )}
                            </span>
                            <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded border border-white/10 text-slate-300">
                              +1 TO CLEARANCE SCORE
                            </span>
                          </div>

                          <p className="text-xs text-slate-200 font-sans leading-relaxed">
                            {currentAuthMission.explanation}
                          </p>

                          <div className="pt-2">
                            <button
                              onClick={handleNextAuthMission}
                              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00e575] to-[#00b35a] text-black font-mono font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                              <span>
                                {authIdx + 1 < AUTH_MISSIONS.length
                                  ? `CONTINUE TO CHALLENGE 0${authIdx + 2} ➔`
                                  : "VIEW LAB 03 DEBRIEF & SCORE ➔"}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Interactive SQL Terminal & Database Sandbox (5 Cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#070a10] border border-[#182234] rounded-2xl overflow-hidden shadow-2xl space-y-0">
                      {/* Terminal Window Titlebar */}
                      <div className="bg-[#04060a] border-b border-[#182234] px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          <span className="text-slate-400 font-mono text-[11px] font-bold ml-2">
                            POSTGRESQL v16 // QUERY PIPELINE
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <span
                            className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                              usePreparedStatements
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-red-500/10 border-red-500/30 text-red-400"
                            }`}
                          >
                            {usePreparedStatements ? "HARDENED (PREPARED)" : "VULNERABLE (RAW CONCAT)"}
                          </span>
                        </div>
                      </div>

                      {/* Terminal Body */}
                      <div className="p-5 font-mono text-xs space-y-4 bg-[#05070a]">
                        {/* Interactive Login Target Form */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-500 uppercase block">
                              TARGET USERNAME
                            </label>
                            <input
                              type="text"
                              value={loginUser}
                              onChange={(e) => setLoginUser(e.target.value)}
                              className="w-full bg-black/60 border border-slate-800 focus:border-[#00e575] text-white px-3 py-2 rounded-lg font-mono text-xs outline-none transition-colors"
                              placeholder="Username..."
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-500 uppercase block">
                              PASSWORD / INJECTION PAYLOAD
                            </label>
                            <input
                              type="text"
                              value={loginPass}
                              onChange={(e) => setLoginPass(e.target.value)}
                              className="w-full bg-black/60 border border-slate-800 focus:border-[#00e575] text-white px-3 py-2 rounded-lg font-mono text-xs outline-none transition-colors"
                              placeholder="Password or SQL payload..."
                            />
                          </div>
                        </div>

                        {/* Server-Side Defense Toggles */}
                        <div className="space-y-2 pt-2 border-t border-slate-900">
                          <span className="text-[10px] text-slate-500 uppercase block">
                            SERVER-SIDE DEFENSE TOGGLES
                          </span>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Toggle 1: Prepared Statements */}
                            <button
                              onClick={() => {
                                handleSfx("click");
                                setUsePreparedStatements(!usePreparedStatements);
                              }}
                              className={`p-2.5 rounded-lg border text-left transition-all ${
                                usePreparedStatements
                                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] uppercase font-bold">SQLi SHIELD</span>
                                <span
                                  className={`text-[8px] px-1 rounded ${
                                    usePreparedStatements ? "bg-emerald-500 text-black font-black" : "bg-slate-800"
                                  }`}
                                >
                                  {usePreparedStatements ? "ON" : "OFF"}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold block truncate">PREPARED STMT</span>
                            </button>

                            {/* Toggle 2: Upstash Rate Limiter */}
                            <button
                              onClick={() => {
                                handleSfx("click");
                                setUseRateLimiting(!useRateLimiting);
                              }}
                              className={`p-2.5 rounded-lg border text-left transition-all ${
                                useRateLimiting
                                  ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] uppercase font-bold">RATE LIMITER</span>
                                <span
                                  className={`text-[8px] px-1 rounded ${
                                    useRateLimiting ? "bg-amber-500 text-black font-black" : "bg-slate-800"
                                  }`}
                                >
                                  {useRateLimiting ? "ON" : "OFF"}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold block truncate">UPSTASH REDIS</span>
                            </button>
                          </div>
                        </div>

                        {/* Execute Action Button */}
                        <button
                          onClick={() => handleExecuteDatabaseQuery()}
                          disabled={isTransmittingQuery}
                          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-[#00e575]/40 text-[#00e575] hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,117,0.1)]"
                        >
                          {isTransmittingQuery ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00e575]" />
                              <span>EVALUATING DATABASE QUERY...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-[#00e575]" />
                              <span>TRANSMIT QUERY TO DATABASE</span>
                            </>
                          )}
                        </button>

                        {/* Dynamic Live SQL Query Construction Visualizer */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-900">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Database className="w-2.5 h-2.5 text-slate-400" />
                              <span>RAW SQL CONSTRUCTED BY BACKEND:</span>
                            </span>
                            <span className="text-[9px] text-slate-600">QUERY ENGINE</span>
                          </div>

                          <div className="bg-black/90 p-3 rounded-xl border border-slate-900 font-mono text-[11px] leading-relaxed break-all space-y-1">
                            {usePreparedStatements ? (
                              <div className="text-emerald-400">
                                <span className="text-purple-400">PREPARE</span> auth_stmt <span className="text-purple-400">FROM</span>{" "}
                                <span className="text-slate-300">&apos;SELECT id, user, role FROM users WHERE user = ? AND pass = ?&apos;;</span>
                                <div className="text-slate-400 text-[10px] mt-1">
                                  <span className="text-purple-400">EXECUTE</span> auth_stmt <span className="text-purple-400">USING</span> (
                                  <span className="text-[#00e575]">&apos;{loginUser}&apos;</span>,{" "}
                                  <span className="text-[#00e575]">&apos;{loginPass}&apos;</span>);
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-purple-400">SELECT</span> id, username, role, email{" "}
                                <span className="text-purple-400">FROM</span> users <span className="text-purple-400">WHERE</span>{" "}
                                username = <span className="text-[#00e575]">&apos;{loginUser}&apos;</span>{" "}
                                <span className="text-purple-400">AND</span> password ={" "}
                                <span className="text-amber-400">&apos;{loginPass}&apos;</span>;
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Database Response Output */}
                        {loginOutput && (
                          <div
                            className={`p-4 rounded-xl border space-y-2.5 animate-fadeIn ${
                              loginOutput.status === "EXPLOIT_SUCCESSFUL"
                                ? "bg-red-500/10 border-red-500/40 text-red-200"
                                : loginOutput.status === "RATE_LIMITED"
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                                : "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="uppercase">{loginOutput.title}</span>
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/10">
                                {loginOutput.status}
                              </span>
                            </div>

                            <p className="text-[11px] leading-relaxed font-sans text-slate-200">
                              {loginOutput.message}
                            </p>

                            {/* Returned Table Row Data */}
                            {loginOutput.returnedRow && (
                              <div className="bg-black/60 p-2.5 rounded-lg border border-white/10 space-y-1 font-mono text-[10px]">
                                <span className="text-amber-400 font-bold block">
                                  DATABASE ROW RETURNED TO SESSION:
                                </span>
                                <div className="grid grid-cols-2 gap-1 text-slate-300">
                                  <div>
                                    <span className="text-slate-500">ID: </span>
                                    <span>{loginOutput.returnedRow.id}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">ROLE: </span>
                                    <span className="text-[#00e575] font-bold">{loginOutput.returnedRow.role}</span>
                                  </div>
                                  <div className="col-span-2 truncate">
                                    <span className="text-slate-500">USER: </span>
                                    <span>{loginOutput.returnedRow.username}</span>
                                  </div>
                                  <div className="col-span-2 truncate">
                                    <span className="text-slate-500">AUTH TOKEN: </span>
                                    <span className="text-amber-300">{loginOutput.returnedRow.token}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* NEED A HINT? OPERATOR INTEL DRAWER                 */}
                {/* -------------------------------------------------- */}
                <div className="border border-[#182234] bg-[#070a10] rounded-2xl overflow-hidden transition-all shadow-md">
                  <button
                    onClick={() => {
                      handleSfx("click");
                      setShowAuthHints(!showAuthHints);
                    }}
                    className="w-full flex items-center justify-between px-6 py-3.5 bg-[#0a0e17] hover:bg-[#0f1422] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                        NEED A HINT? {"//"} OPERATOR INTEL
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                        3 TACTICAL CLUES AVAILABLE
                      </span>
                    </div>
                    {showAuthHints ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {showAuthHints && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#182234] bg-[#05070a] animate-fadeIn">
                      {currentAuthMission.hints.map((hint, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-800 bg-[#070a10] space-y-2"
                        >
                          <div className="flex items-center gap-2 text-amber-400 font-mono text-[11px] font-bold">
                            <span className="w-4 h-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span>TACTICAL CLUE {idx + 1}</span>
                          </div>
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            {hint}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ---------------------------------------------------- */}
            {/* FIELD DEFENSE GUIDE: APPLICATION SECURITY HANDBOOK   */}
            {/* ---------------------------------------------------- */}
            <div className="border border-[#182234] bg-[#070a10] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#182234] pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#00e575] font-mono text-xs font-bold uppercase tracking-widest">
                    <Shield className="w-4 h-4" />
                    <span>DEFENSIVE OPERATOR HANDBOOK {"//"} FIELD DEFENSE GUIDE</span>
                  </div>
                  <h3 className="text-lg font-black font-display text-white uppercase tracking-wider">
                    How to Prevent SQL Injection &amp; Auth Bypass in Real Life
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 self-start sm:self-auto">
                  FOUR PILLARS OF DATABASE &amp; API DEFENSE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rule 1: Parameterized Queries & Prepared Statements */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      01
                    </span>
                    <span>PARAMETERIZED QUERIES (THE GOLD STANDARD)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Never concatenate raw user strings into SQL command statements.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Prepared statements compile the query execution blueprint before binding inputs. Input is sent over a dedicated data channel, making it mathematically impossible to rewrite SQL commands.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">CODE SAMPLE:</span>
                    <div className="text-[11px] bg-slate-950 p-2 rounded border border-slate-800 break-all text-emerald-400">
                      {`// SAFE: PostgreSQL / Node pg parameter binding`}
                      <br />
                      <span className="text-purple-400">await</span> db.query(
                      <br />
                      &nbsp;&nbsp;<span className="text-slate-300">&quot;SELECT * FROM users WHERE email = $1 AND pass = $2&quot;</span>,
                      <br />
                      &nbsp;&nbsp;[userEmail, passwordHash]
                      <br />
                      );
                    </div>
                  </div>
                </div>

                {/* Rule 2: Modern ORMs & Query Builders */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      02
                    </span>
                    <span>USE TYPE-SAFE ORMS (PRISMA, DRIZZLE, KYSELY)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Type-safe ORMs parameterize queries automatically under the hood.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    ORMs eliminate manual string concatenation by building type-checked AST trees. Special characters like quotes and dashes are escaped and bound as parameters without developer intervention.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">SAFE ORM QUERY:</span>
                    <div className="text-[11px] bg-slate-950 p-2 rounded border border-slate-800 break-all text-emerald-400">
                      {`// Prisma automatically parameterizes where arguments`}
                      <br />
                      <span className="text-purple-400">const</span> user = <span className="text-purple-400">await</span> prisma.user.findUnique({`{`}
                      <br />
                      &nbsp;&nbsp;where: {`{ email: inputEmail }`}
                      <br />
                      {`}`});
                    </div>
                  </div>
                </div>

                {/* Rule 3: Principle of Least Privilege for DB Users */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      03
                    </span>
                    <span>PRINCIPLE OF LEAST PRIVILEGE (DATABASE ROLES)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Never connect your web backend as the database &quot;root&quot; or &quot;postgres&quot; superuser.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Create application-specific database roles with restricted permissions. A web application should only have <code className="text-emerald-400">SELECT, INSERT, UPDATE</code> on its necessary tables—never <code className="text-red-400">DROP TABLE, ALTER,</code> or access to system credential vaults.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">DATABASE ROLE HARDENING:</span>
                    <p className="text-slate-400 font-sans leading-normal">
                      If an injection ever occurs, a low-privilege DB user prevents the attacker from reading other tenants&apos; databases, reading filesystem files (<code className="text-red-400">pg_read_file</code>), or executing server commands (<code className="text-red-400">xp_cmdshell</code>).
                    </p>
                  </div>
                </div>

                {/* Rule 4: Distributed Server-Side Rate Limiting */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      04
                    </span>
                    <span>DISTRIBUTED RATE LIMITING (UPSTASH / REDIS / WAF)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Stop high-speed brute force and stuffing attacks at the reverse proxy layer.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Use sliding window rate limiters (such as <code className="text-emerald-400">@upstash/ratelimit</code> with Redis) to track request velocity per IP and per username. Return <code className="text-amber-400">HTTP 429</code> and lock offending IPs for progressive cooldown periods.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">RATE LIMIT POLICY:</span>
                    <p className="text-slate-400 font-sans leading-normal">
                      Limit login attempts to <strong>5 attempts per 5 minutes</strong> per IP. On repeated triggers, escalate to a 15-minute lockout or challenge with an invisible Cloudflare Turnstile token.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================= */}
        {/* TAB 4: VIRTUAL PORT SCAN & FIREWALL SIMULATOR           */}
        {/* ======================================================= */}
        {activeTab === "ports" && (
          <section className="space-y-8 animate-fadeIn">
            {/* Lab 04 Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#070a10] border border-[#182234] p-6 rounded-2xl">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/20">
                    LAB 04 {"//"} FINAL CHALLENGE {portIdx + 1} OF {PORT_MISSIONS.length}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">{"//"}</span>
                  <span className="text-amber-400 font-mono text-xs font-bold">CULMINATING DEFENSE SECTOR</span>
                </div>
                <h2 className="text-xl font-black font-display text-white uppercase tracking-wider flex items-center gap-2.5">
                  <Server className="w-5 h-5 text-[#00e575]" />
                  <span>Lab 04 {"//"} Virtual Port Scan &amp; Attack Surface Defense</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Master network reconnaissance, TCP 3-way handshake mechanics, stealth SYN scans, and zero-inbound-port defense in depth.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#05070a] border border-[#182234] px-4 py-2 rounded-xl flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">SCORE:</span>
                    <span className="text-sm font-mono font-black text-[#00e575]">
                      {portScore} / {PORT_MISSIONS.length}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <Link
                    href="/tools/port-checker"
                    className="flex items-center gap-1.5 text-xs font-mono text-[#00e575] hover:underline"
                    title="Open Port Checker Tool"
                  >
                    <span>TOOL #005</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar (Strict 5/5 Scale) */}
            <div className="grid grid-cols-5 gap-2">
              {PORT_MISSIONS.map((m, idx) => {
                const isCurrent = idx === portIdx && !lab04Completed;
                const isPast = idx < portIdx || (lab04Completed && answeredPortMissions[idx]);
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (answeredPortMissions[idx] || lab04Completed) {
                        handleSfx("click");
                        setPortIdx(idx);
                        setLab04Completed(false);
                        setPortFeedback(null);
                        setShowPortHints(false);
                        setFirewallMode(PORT_MISSIONS[idx].recommendedMode);
                        setScannedPorts({});
                      }
                    }}
                    className={`h-2 rounded-full transition-all ${
                      isPast
                        ? "bg-[#00e575] shadow-[0_0_8px_rgba(0,229,117,0.4)]"
                        : isCurrent
                        ? "bg-amber-400 animate-pulse"
                        : "bg-slate-800"
                    }`}
                    title={`Mission 0${m.id}: ${m.category}`}
                  />
                );
              })}
            </div>

            {/* ---------------------------------------------------- */}
            {/* VIEW A: 5/5 GRAND GRADUATION SCREEN                  */}
            {/* ---------------------------------------------------- */}
            {lab04Completed ? (
              <div className="relative bg-[#070a10] border border-[#00e575]/50 rounded-2xl p-8 sm:p-12 text-center space-y-8 animate-fadeIn shadow-[0_0_50px_rgba(0,229,117,0.15)] overflow-hidden">
                {/* Digital Matrix Victory Confetti Particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
                  {[...Array(18)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute animate-pulse"
                      style={{
                        left: `${(i * 5.8 + 4) % 96}%`,
                        top: `${(i * 17 + 8) % 88}%`,
                        width: i % 2 === 0 ? "7px" : "4px",
                        height: i % 2 === 0 ? "7px" : "4px",
                        backgroundColor: i % 3 === 0 ? "#00e575" : i % 3 === 1 ? "#f59e0b" : "#38bdf8",
                        borderRadius: i % 2 === 0 ? "50%" : "2px",
                        boxShadow: i % 3 === 0 ? "0 0 10px #00e575" : "0 0 10px #f59e0b",
                        opacity: 0.65,
                        animationDuration: `${1.4 + (i % 4) * 0.4}s`,
                        animationDelay: `${(i % 5) * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
                {/* Visual Grand Seal */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#00e575]/20 animate-ping" />
                  <div className="relative w-24 h-24 rounded-full bg-[#00e575]/15 border-2 border-[#00e575] flex items-center justify-center text-[#00e575] shadow-[0_0_40px_rgba(0,229,117,0.4)]">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                </div>

                <div className="space-y-3 max-w-2xl mx-auto relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-emerald-500/20 border border-[#00e575]/40 text-[#00e575] font-mono text-xs font-bold shadow-[0_0_20px_rgba(0,229,117,0.25)]">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>CONGRATULATIONS OPERATOR // 100% TRAINING GROUNDS VICTORY</span>
                  </div>
                  <span className="text-xs font-mono font-bold tracking-[0.3em] text-[#00e575] uppercase block">
                    {"[TACTICAL CYBER RANGE: 100% COMPLETE // LEVEL 6 COMBAT DEFENSE COMMANDER]"}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black font-display text-white uppercase tracking-wider">
                    ALL FOUR DEFENSE SECTORS CLEARED
                  </h3>
                  <p className="text-slate-300 text-sm font-sans leading-relaxed">
                    {portScore === 5
                      ? "Flawless tactical network supremacy! You have mastered all four specialized sectors: social engineering email forensics, password entropy and GPU hashcat cracking, SQL injection and prepared statement parameterization, and network reconnaissance with zero-trust perimeter defense."
                      : portScore >= 3
                      ? "Full cyber range graduation certified! You demonstrated solid network defense skills and completed all four sectors of the tactical training grounds."
                      : "Tactical training curriculum completed across all four sectors. Review the defense handbook below to reinforce key network security standards."}
                  </p>
                </div>

                {/* 4 Sector Dossier Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto font-mono text-xs">
                  <div className="bg-[#05070a] border border-[#00e575]/30 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 block">SECTOR 01</span>
                    <span className="text-white font-bold block truncate">PHISHING</span>
                    <span className="text-[#00e575] text-[10px] font-bold block">✓ VERIFIED</span>
                  </div>
                  <div className="bg-[#05070a] border border-[#00e575]/30 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 block">SECTOR 02</span>
                    <span className="text-white font-bold block truncate">CRACK-TIME</span>
                    <span className="text-[#00e575] text-[10px] font-bold block">✓ RESISTANT</span>
                  </div>
                  <div className="bg-[#05070a] border border-[#00e575]/30 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 block">SECTOR 03</span>
                    <span className="text-white font-bold block truncate">SQL DEFENSE</span>
                    <span className="text-[#00e575] text-[10px] font-bold block">✓ PARAMETERIZED</span>
                  </div>
                  <div className="bg-[#05070a] border border-[#00e575]/30 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 block">SECTOR 04</span>
                    <span className="text-white font-bold block truncate">PERIMETER</span>
                    <span className="text-[#00e575] text-[10px] font-bold block">✓ HARDENED</span>
                  </div>
                </div>

                {/* Score Summary Box */}
                <div className="max-w-md mx-auto bg-[#0a0e17] border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 font-mono text-xs">
                    <span className="text-slate-400">FINAL LAB SCORE:</span>
                    <span className="font-mono text-2xl font-black text-[#00e575]">
                      {portScore} / {PORT_MISSIONS.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-mono text-slate-400">CERTIFIED CLEARANCE:</span>
                    <span className="font-mono text-xs font-black text-amber-400 uppercase">
                      LEVEL 6 COMBAT DEFENSE COMMANDER
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00e575] to-[#00b35a]"
                      style={{ width: `${(portScore / PORT_MISSIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Tactical Navigation Deck (Hybrid Actions) */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-xl mx-auto">
                  <Link
                    href="/command-center"
                    onClick={() => handleSfx("click")}
                    className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#00e575] to-[#00b35a] text-black font-mono font-black text-xs uppercase tracking-widest hover:scale-[1.03] transition-all shadow-[0_0_30px_rgba(0,229,117,0.4)] flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>GRADUATE TO COMMAND CENTER ➔</span>
                  </Link>

                  <Link
                    href="/home"
                    onClick={() => handleSfx("click")}
                    className="px-6 py-4 rounded-xl bg-[#0d131f] hover:bg-[#131c2e] border border-slate-700 hover:border-slate-500 text-white font-mono font-bold text-xs uppercase tracking-wider hover:scale-[1.03] transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Home className="w-4 h-4 text-[#00e575]" />
                    <span>RETURN TO HEADQUARTERS ⌂</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleSfx("click");
                      setActiveTab("phishing");
                    }}
                    className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider hover:scale-[1.03] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>PRACTICE ALL LABS (01 - 04)</span>
                  </button>

                  <button
                    onClick={restartLab04}
                    className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>REDO LAB 04</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* -------------------------------------------------- */}
                {/* VIEW B: ACTIVE MISSION & CHALLENGE QUESTIONS       */}
                {/* -------------------------------------------------- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Mission Card & Multiple Choice (7 Cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-[#0a0e17] border border-[#182234] rounded-2xl p-6 sm:p-7 space-y-6">
                      {/* Mission Category & Target Callout */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-amber-400 tracking-widest uppercase block">
                            CHALLENGE 0{currentPortMission.id} {"//"} {currentPortMission.category}
                          </span>
                          <h3 className="text-lg font-bold text-white font-sans">
                            {currentPortMission.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-[#05070a] border border-slate-800 text-[11px] font-mono text-slate-300">
                            PORT: <strong className="text-amber-400">{currentPortMission.targetPort}</strong>
                          </span>
                          <span className="px-2.5 py-1 rounded bg-[#05070a] border border-slate-800 text-[11px] font-mono text-slate-300">
                            SVC: <strong className="text-[#00e575]">{currentPortMission.targetService}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Specimen Probe Target Box */}
                      <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                            TARGET PORT AUDIT SPECIMEN:
                          </span>
                          <code className="text-[#00e575] font-mono font-bold text-base tracking-wide break-all block">
                            Port {currentPortMission.targetPort} ({currentPortMission.targetService}) {"//"} {currentPortMission.category}
                          </code>
                        </div>

                        <button
                          onClick={() => {
                            setFirewallMode(currentPortMission.recommendedMode);
                            runPortScan(currentPortMission.recommendedMode);
                          }}
                          className="px-3.5 py-2 rounded-lg bg-[#00e575]/10 hover:bg-[#00e575]/20 border border-[#00e575]/30 text-[#00e575] text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap self-start sm:self-auto"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>LOAD IN SCANNER</span>
                        </button>
                      </div>

                      {/* Core Concept Briefing */}
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>TACTICAL BRIEFING:</span>
                        </span>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed">
                          {currentPortMission.conceptSummary}
                        </p>
                      </div>

                      {/* Tactical Question */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00e575]" />
                          <h4 className="text-sm font-bold text-white font-sans">
                            {currentPortMission.question}
                          </h4>
                        </div>

                        {/* Interactive Options List */}
                        <div className="space-y-2.5">
                          {currentPortMission.options.map((opt) => {
                            const isAnswered = answeredPortMissions[portIdx];
                            const isCorrect = opt.isCorrect;
                            return (
                              <button
                                key={opt.id}
                                disabled={isAnswered}
                                onClick={() => handlePortOptionSelect(opt.isCorrect)}
                                className={`w-full text-left p-4 rounded-xl border transition-all text-xs font-sans leading-relaxed flex items-start gap-3 ${
                                  isAnswered
                                    ? isCorrect
                                      ? "border-[#00e575] bg-[#00e575]/10 text-emerald-200 shadow-[0_0_15px_rgba(0,229,117,0.15)]"
                                      : "border-slate-800/60 bg-[#05070a]/60 text-slate-500 opacity-60"
                                    : "border-slate-800 bg-[#05070a] hover:bg-[#0c121e] hover:border-slate-700 text-slate-300 hover:text-white"
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg border font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                                    isAnswered && isCorrect
                                      ? "border-[#00e575] bg-[#00e575] text-black"
                                      : "border-slate-700 bg-slate-900 text-slate-400"
                                  }`}
                                >
                                  {opt.id}
                                </span>
                                <span className="pt-0.5">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tactical Evaluation Feedback Banner */}
                      {portFeedback && (
                        <div
                          className={`p-5 rounded-xl border space-y-3 animate-fadeIn ${
                            portFeedback === "CORRECT"
                              ? "border-[#00e575]/40 bg-[#00e575]/10 text-emerald-300"
                              : "border-red-500/40 bg-red-500/10 text-red-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2">
                              {portFeedback === "CORRECT" ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
                                  <span>[CLEARANCE VERIFIED // TACTICAL ANALYSIS CORRECT]</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-red-400" />
                                  <span>[ANALYSIS REJECTED // RE-EVALUATION REQUIRED]</span>
                                </>
                              )}
                            </span>
                            <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded border border-white/10 text-slate-300">
                              +1 TO CLEARANCE SCORE
                            </span>
                          </div>

                          <p className="text-xs text-slate-200 font-sans leading-relaxed">
                            {currentPortMission.explanation}
                          </p>

                          <div className="pt-2">
                            <button
                              onClick={handleNextPortMission}
                              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00e575] to-[#00b35a] text-black font-mono font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                              <span>
                                {portIdx + 1 < PORT_MISSIONS.length
                                  ? `CONTINUE TO CHALLENGE 0${portIdx + 2} ➔`
                                  : "VIEW FINAL GRADUATION DEBRIEF ➔"}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Interactive Nmap Terminal & Firewall Sandbox (5 Cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#070a10] border border-[#182234] rounded-2xl overflow-hidden shadow-2xl space-y-0">
                      {/* Terminal Window Titlebar */}
                      <div className="bg-[#04060a] border-b border-[#182234] px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          <span className="text-slate-400 font-mono text-[11px] font-bold ml-2">
                            NMAP v7.94 // TACTICAL SCANNER
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <span
                            className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                              firewallMode === "HARDENED"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : firewallMode === "BASIC"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                : "bg-red-500/10 border-red-500/30 text-red-400"
                            }`}
                          >
                            {firewallMode === "HARDENED" ? "ZERO-TRUST SHIELD" : firewallMode === "BASIC" ? "DMZ FILTER" : "EXPOSED"}
                          </span>
                        </div>
                      </div>

                      {/* Terminal Body */}
                      <div className="p-5 font-mono text-xs space-y-4 bg-[#05070a]">
                        {/* Target Gateway Info */}
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">TARGET HOST:</span>
                          <span className="text-white font-bold">10.0.4.42 (simulated-gateway.internal)</span>
                        </div>

                        {/* Firewall Profile Switcher */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-500 uppercase block">
                            FIREWALL DEFENSE PROFILE:
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: "EXPOSED", label: "EXPOSED" },
                              { id: "BASIC", label: "BASIC DMZ" },
                              { id: "HARDENED", label: "HARDENED" },
                            ].map((mode) => (
                              <button
                                key={mode.id}
                                onClick={() => {
                                  handleSfx("click");
                                  setFirewallMode(mode.id as typeof firewallMode);
                                  setScannedPorts({});
                                }}
                                className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all text-center ${
                                  firewallMode === mode.id
                                    ? "bg-[#00e575] text-black shadow-[0_0_12px_rgba(0,229,117,0.3)]"
                                    : "bg-black/50 border border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                {mode.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Scan Technique Profile Selector */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-500 uppercase block">
                            SCAN TECHNIQUE / PROBE TYPE:
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: "SYN", flag: "-sS", label: "SYN STEALTH" },
                              { id: "CONNECT", flag: "-sT", label: "TCP CONNECT" },
                              { id: "UDP", flag: "-sU", label: "UDP PROBE" },
                            ].map((st) => (
                              <button
                                key={st.id}
                                onClick={() => {
                                  handleSfx("click");
                                  setScanType(st.id as typeof scanType);
                                }}
                                className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all text-center ${
                                  scanType === st.id
                                    ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                                    : "bg-black/50 border border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                {st.label} ({st.flag})
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Scan Launch Action Button */}
                        <button
                          onClick={() => runPortScan()}
                          disabled={scanning}
                          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-[#00e575]/40 text-[#00e575] hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,117,0.1)]"
                        >
                          {scanning ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00e575]" />
                              <span>
                                TRANSMITTING {scanType === "SYN" ? "SYN" : scanType === "CONNECT" ? "TCP 3-WAY" : "UDP"} PROBE PACKETS...
                              </span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-[#00e575]" />
                              <span>
                                LAUNCH NMAP SCAN (
                                {scanType === "SYN" ? "-sS SYN STEALTH" : scanType === "CONNECT" ? "-sT TCP CONNECT" : "-sU UDP SCAN"}
                                )
                              </span>
                            </>
                          )}
                        </button>

                        {/* TCP 3-Way Handshake Simulation Diagram */}
                        <div className="p-3.5 rounded-xl bg-black/60 border border-slate-900 space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 uppercase font-bold flex items-center gap-1">
                              <Activity className="w-3 h-3 text-[#00e575]" />
                              <span>TCP PACKET HANDSHAKE INSPECTOR:</span>
                            </span>
                            <span className="text-[#00e575]">{currentPortMission.handshakeSimulation.latencyMs}ms</span>
                          </div>

                          <div className="p-2.5 rounded bg-black border border-slate-800 text-[10px] space-y-1 font-mono">
                            <div className="text-slate-300">
                              1. {currentPortMission.handshakeSimulation.clientAction}
                            </div>
                            <div className="text-amber-400">
                              2. {currentPortMission.handshakeSimulation.targetResponse}
                            </div>
                            <div className="text-slate-400 text-[9px] pt-1 border-t border-slate-900 flex justify-between">
                              <span>RESULTING STATE:</span>
                              <span
                                className={`font-bold ${
                                  currentPortMission.handshakeSimulation.finalState === "OPEN"
                                    ? "text-red-400"
                                    : currentPortMission.handshakeSimulation.finalState === "CLOSED"
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {currentPortMission.handshakeSimulation.finalState}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Port Scan Result Table */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-900">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>GATEWAY PORTS AUDIT TABLE</span>
                            <span>{Object.keys(scannedPorts).length}/6 SCANNED</span>
                          </div>

                          <div className="overflow-x-auto rounded-lg border border-slate-900 bg-black/40">
                            <table className="w-full text-left font-mono text-[11px]">
                              <thead>
                                <tr className="border-b border-slate-900 text-slate-500 text-[9px]">
                                  <th className="p-2">PORT</th>
                                  <th className="p-2">SERVICE</th>
                                  <th className="p-2">STATUS</th>
                                  <th className="p-2">RISK</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-900">
                                {COMMON_PORTS.map((p) => {
                                  const status = scannedPorts[p.port] || "UNSCANNED";
                                  return (
                                    <tr key={p.port} className="hover:bg-white/[0.02]">
                                      <td className="p-2 font-bold text-white">{p.port}/{p.protocol}</td>
                                      <td className="p-2 text-slate-300">{p.service}</td>
                                      <td className="p-2">
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                            status === "OPEN"
                                              ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                              : status === "CLOSED"
                                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                              : status === "FILTERED"
                                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                              : "text-slate-600"
                                          }`}
                                        >
                                          {status}
                                        </span>
                                      </td>
                                      <td className="p-2">
                                        <span
                                          className={`text-[9px] font-bold ${
                                            p.vulnRisk === "CRITICAL"
                                              ? "text-red-400"
                                              : p.vulnRisk === "MODERATE"
                                              ? "text-amber-400"
                                              : "text-emerald-400"
                                          }`}
                                        >
                                          {p.vulnRisk}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* NEED A HINT? OPERATOR INTEL DRAWER                 */}
                {/* -------------------------------------------------- */}
                <div className="border border-[#182234] bg-[#070a10] rounded-2xl overflow-hidden transition-all shadow-md">
                  <button
                    onClick={() => {
                      handleSfx("click");
                      setShowPortHints(!showPortHints);
                    }}
                    className="w-full flex items-center justify-between px-6 py-3.5 bg-[#0a0e17] hover:bg-[#0f1422] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                        NEED A HINT? {"//"} OPERATOR INTEL
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                        3 TACTICAL CLUES AVAILABLE
                      </span>
                    </div>
                    {showPortHints ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {showPortHints && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#182234] bg-[#05070a] animate-fadeIn">
                      {currentPortMission.hints.map((hint, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-800 bg-[#070a10] space-y-2"
                        >
                          <div className="flex items-center gap-2 text-amber-400 font-mono text-[11px] font-bold">
                            <span className="w-4 h-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span>TACTICAL CLUE {idx + 1}</span>
                          </div>
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            {hint}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ---------------------------------------------------- */}
            {/* FIELD DEFENSE GUIDE: PERIMETER & FIREWALL HARDENING  */}
            {/* ---------------------------------------------------- */}
            <div className="border border-[#182234] bg-[#070a10] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#182234] pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#00e575] font-mono text-xs font-bold uppercase tracking-widest">
                    <Shield className="w-4 h-4" />
                    <span>DEFENSIVE OPERATOR HANDBOOK {"//"} FIELD DEFENSE GUIDE</span>
                  </div>
                  <h3 className="text-lg font-black font-display text-white uppercase tracking-wider">
                    How to Harden Firewalls &amp; Network Ports in Real Life
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 self-start sm:self-auto">
                  FOUR PILLARS OF PERIMETER NETWORK SECURITY
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rule 1: Default-Deny Firewall Configuration */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      01
                    </span>
                    <span>DEFAULT-DENY INCOMING (THE FOUNDATIONAL PRINCIPLE)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Block all inbound connections by default; explicitly allow only essential services.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    A default-allow firewall exposes unlisted ports whenever new software or containers are deployed. A default-deny policy ensures that newly installed services remain inaccessible to the internet unless intentionally permitted.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">UBUNTU UFW HARDENING:</span>
                    <div className="text-[11px] bg-slate-950 p-2 rounded border border-slate-800 break-all text-emerald-400">
                      sudo ufw default deny incoming
                      <br />
                      sudo ufw default allow outgoing
                      <br />
                      sudo ufw allow 443/tcp
                      <br />
                      sudo ufw enable
                    </div>
                  </div>
                </div>

                {/* Rule 2: Bind Internal Databases to Localhost Only */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      02
                    </span>
                    <span>BIND INTERNAL LISTENERS TO 127.0.0.1 (NEVER 0.0.0.0)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Database, cache, and admin services must never listen on public IP interfaces.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Services like PostgreSQL (5432), MySQL (3306), and Redis (6379) should be bound strictly to <code className="text-emerald-400">127.0.0.1</code> for local applications, or to private VPC subnet IPs. If developers need remote access, connect via an encrypted SSH tunnel (<code className="text-slate-300">ssh -L 3306:localhost:3306</code>).
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">CONFIGURATION SANITY CHECK:</span>
                    <div className="text-[11px] bg-slate-950 p-2 rounded border border-slate-800 break-all text-emerald-400">
                      {`# /etc/mysql/mysql.conf.d/mysqld.cnf`}
                      <br />
                      bind-address = 127.0.0.1
                    </div>
                  </div>
                </div>

                {/* Rule 3: SSH Perimeter Hardening */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      03
                    </span>
                    <span>HARDEN SSH (DISABLE PASSWORDS, USE ED25519 KEYS)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Never permit password authentication or direct root login on port 22.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Automated brute-force bots continuously spray millions of dictionary passwords against port 22. Enforcing cryptographic Ed25519 public-key authentication makes brute force computationally impossible. Install Fail2ban to ban aggressive scanners automatically.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">SSHD CONFIGURATION:</span>
                    <div className="text-[11px] bg-slate-950 p-2 rounded border border-slate-800 break-all text-emerald-400">
                      PasswordAuthentication no
                      <br />
                      PermitRootLogin no
                      <br />
                      PubkeyAuthentication yes
                    </div>
                  </div>
                </div>

                {/* Rule 4: Zero Inbound Ports Architecture */}
                <div className="p-5 rounded-xl border border-slate-800 bg-[#0a0e17] space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#00e575] font-mono text-xs font-black">
                    <span className="w-5 h-5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[10px]">
                      04
                    </span>
                    <span>ZERO-INBOUND ARCHITECTURE (CLOUDFLARE TUNNELS &amp; TAILSCALE)</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    Eliminate public attack surfaces by closing all inbound listening ports.
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Modern Zero-Trust tools (Cloudflare Tunnels, Tailscale WireGuard mesh) establish outbound-only encrypted connections from inside your network to the edge. Shodan, Censys, and Nmap external scans will report 0 open ports, making the server completely invisible on the internet.
                  </p>
                  <div className="p-3 rounded-lg bg-[#05070a] border border-slate-900 text-xs font-mono space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">THE ULTIMATE SHIELD:</span>
                    <p className="text-slate-400 font-sans leading-normal">
                      An attacker cannot attack an open port that does not exist. Outbound tunnels turn your public firewall into an impenetrable brick wall while still serving authenticated users worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ========================================================= */}
      {/* FOOTER                                                    */}
      {/* ========================================================= */}
      <footer className="h-12 border-t border-[#182234] bg-[#070a10] px-6 sm:px-10 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>THE BIG BRO&#39;S NETSEC ARMOURY // TRAINING GROUND LABS</span>
        <span>CLIENT-SIDE ISOLATED ENVIRONMENT</span>
      </footer>
    </div>
  );
}
