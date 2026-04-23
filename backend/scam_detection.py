from . import schemas
from typing import Tuple, Dict, Any
import re
import json

# =============================================================================
# PILLAR 1: Keyword Pattern Detection
# =============================================================================

KEYWORD_PATTERNS = {
    "financial": {
        "weight": 12.0,
        "label": "Financial Red Flags",
        "keywords": [
            "registration fee", "certificate fee", "processing fee", "training fee",
            "security deposit", "refundable deposit", "advance payment",
            "pay to join", "pay to apply", "send money", "wire transfer",
            "bank account details", "bank transfer", "western union", "money order",
            "bitcoin payment", "crypto payment", "gift card",
        ],
    },
    "communication": {
        "weight": 10.0,
        "label": "Suspicious Communication",
        "keywords": [
            "whatsapp group join", "whatsapp group", "join whatsapp",
            "telegram group", "join telegram", "dm on instagram",
            "contact on personal email", "personal whatsapp",
            "gmail.com", "official message on whatsapp",
        ],
    },
    "urgency": {
        "weight": 8.0,
        "label": "High-Pressure Urgency Tactics",
        "keywords": [
            "act now", "limited time", "limited spots", "hurry",
            "apply immediately", "urgent requirement", "urgent hiring",
            "last date today", "closing soon", "don't miss",
            "once in a lifetime", "exclusive opportunity",
        ],
    },
    "unrealistic_promises": {
        "weight": 10.0,
        "label": "Unrealistic Promises",
        "keywords": [
            "guaranteed placement", "guaranteed job", "100% placement",
            "guaranteed income", "guaranteed salary", "earn from day 1",
            "no interview", "no experience needed", "no skills required",
            "work from home", "easy money", "get rich", "passive income",
            "mlm", "multi-level", "network marketing",
        ],
    },
    "scam_language": {
        "weight": 8.0,
        "label": "Scam-Associated Language",
        "keywords": [
            "money", "cash", "payment required", "investment opportunity",
            "make money fast", "financial freedom", "be your own boss",
            "earn lakhs", "earn thousands", "earn crores",
        ],
    },
}

# =============================================================================
# PILLAR 2: Suspicious Phrase Scoring
# =============================================================================

SUSPICIOUS_PHRASES = [
    (r"(?:earn|make|get)\s+\$?\d{3,}.*(?:per|a|every)\s*(?:day|week|hour)", 15.0, "Contains unrealistic income claims"),
    (r"(?:earn|make)\s+(?:lakhs?|crores?|thousands?|millions?)", 12.0, "Exaggerated large earnings mentioned"),
    (r"(?:pay|deposit|fee|charge)\s+(?:of\s+)?\$?\d+", 15.0, "Requests an upfront deposit or fee"),
    (r"(?:registration|certificate|training|joining)\s+(?:fee|charge|cost)", 18.0, "Demands registration/certificate fee"),
    (r"(?:send|share|provide)\s+(?:your\s+)?(?:aadhar|aadhaar|pan|passport|ssn|bank)", 15.0, "Attempts to harvest sensitive identity/bank info"),
    (r"(?:contact|reach|call|text)\s+(?:us\s+)?(?:on|at|via)\s+(?:whatsapp|\+?\d{10,})", 10.0, "Redirects communication to unverified numbers/WhatsApp"),
    (r"(?:offer|appointment)\s+letter\s+(?:will|shall)\s+be\s+(?:sent|provided|issued)", 5.0, "Uses language associated with fake offer letter scams"),
    (r"(?:refer|recruit)\s+(?:\d+\s+)?(?:friends?|people|members?)\s+(?:to|and)\s+(?:earn|get)", 15.0, "Possesses MLM or pyramid scheme patterns"),
]

# =============================================================================
# PILLAR 3: Heuristic-Based Credibility Rules
# =============================================================================

def _evaluate_credibility_heuristics(internship: schemas.InternshipCreate, findings: list) -> float:
    penalty = 0.0
    desc = internship.description
    title = internship.title

    if len(desc.strip()) < 50:
        penalty += 15.0
        findings.append({"text": "Description is extremely short and vague", "severity": "high"})

    caps_ratio = sum(1 for c in title if c.isupper()) / max(len(title), 1)
    if caps_ratio > 0.6:
        penalty += 10.0
        findings.append({"text": "Title uses excessive capitalization (sensationalist)", "severity": "medium"})

    exclamation_count = title.count("!") + desc.count("!")
    if exclamation_count >= 3:
        penalty += 8.0
        findings.append({"text": "Excessive use of exclamation marks detected", "severity": "medium"})

    skills = internship.skills_required.strip().lower()
    if skills in ["none", "n/a", "any", "no skills", "not required", "nil", ""]:
        penalty += 12.0
        findings.append({"text": "Explicitly states 'no skills required'", "severity": "high"})

    words = desc.lower().split()
    if len(words) > 10:
        unique_ratio = len(set(words)) / len(words)
        if unique_ratio < 0.4:
            penalty += 10.0
            findings.append({"text": "Text is highly repetitive or copy-pasted", "severity": "medium"})

    if re.search(r"\$\d+|₹\d+|\d+k\s*(?:per|/)\s*(?:month|week|day)", title.lower()):
        penalty += 10.0
        findings.append({"text": "Title contains unusual salary/money figures", "severity": "high"})

    loc = internship.location.strip().lower()
    if loc in ["", "anywhere", "any", "n/a", "global", "worldwide"]:
        penalty += 5.0
        findings.append({"text": "Location is completely generic or missing", "severity": "low"})

    return penalty


# =============================================================================
# PILLAR 4: Company Metadata Evaluation
# =============================================================================

PLACEHOLDER_COMPANIES = [
    "unknown", "n/a", "tbd", "not specified", "unnamed", "confidential",
    "abc company", "xyz company", "company name", "startup",
    "new company", "our company", "my company",
]

def _evaluate_company_metadata(internship: schemas.InternshipCreate, findings: list) -> float:
    penalty = 0.0
    company = internship.company.strip().lower()

    for placeholder in PLACEHOLDER_COMPANIES:
        if company == placeholder or company.startswith(placeholder):
            penalty += 20.0
            findings.append({"text": f"Uses placeholder company name: '{internship.company}'", "severity": "high"})
            break

    if not company:
        penalty += 25.0
        findings.append({"text": "Missing company name", "severity": "critical"})

    if 0 < len(company) < 3:
        penalty += 10.0
        findings.append({"text": "Company name is suspiciously short", "severity": "medium"})

    if company.replace(" ", "").isdigit():
        penalty += 15.0
        findings.append({"text": "Company name consists only of numbers", "severity": "high"})

    url = internship.source_url.lower() if internship.source_url else ""
    if url:
        shorteners = ["bit.ly", "tinyurl", "goo.gl", "t.co", "ow.ly", "is.gd", "buff.ly"]
        for shortener in shorteners:
            if f"{shortener}/" in url or url.endswith(shortener):
                penalty += 15.0
                findings.append({"text": f"Uses suspicious URL shortener ({shortener}) to hide destination", "severity": "high"})
                break

        if url.startswith("http://") and not url.startswith("https://"):
            penalty += 5.0
            findings.append({"text": "Source URL is not secure (HTTP instead of HTTPS)", "severity": "low"})

        if any(site in url for site in ["blogspot", "wordpress.com", "wix.com", "facebook.com/", "instagram.com/"]):
            penalty += 10.0
            findings.append({"text": "Application URL goes to a personal blog or social media instead of a careers portal", "severity": "medium"})
    else:
        penalty += 10.0
        findings.append({"text": "No source URL provided", "severity": "medium"})

    return penalty


# =============================================================================
# PILLAR 5: Compensation Anomaly Detection
# =============================================================================

def _detect_compensation_anomalies(internship: schemas.InternshipCreate, findings: list) -> float:
    penalty = 0.0
    text = (internship.description + " " + internship.title).lower()

    money_patterns = [
        (r"\$\s*(\d[\d,]*)", "usd"),
        (r"₹\s*(\d[\d,]*)", "inr"),
        (r"(\d[\d,]*)\s*(?:dollars?|usd)", "usd"),
        (r"(\d[\d,]*)\s*(?:rupees?|inr|rs\.?)", "inr"),
        (r"(\d+)k\s*(?:per|/|a)\s*(?:month|mo)", "k_per_month"),
    ]

    for pattern, currency in money_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            try:
                amount = float(match.replace(",", ""))

                if currency == "usd":
                    if "week" in text and amount > 3000:
                        penalty += 15.0
                        findings.append({"text": f"Highly anomalous compensation detected (>${amount}/week for intern)", "severity": "critical"})
                    elif "day" in text and amount > 500:
                        penalty += 15.0
                        findings.append({"text": f"Highly anomalous compensation detected (>${amount}/day for intern)", "severity": "critical"})
                    elif amount > 10000:
                        penalty += 12.0
                        findings.append({"text": f"Suspiciously large USD amount mentioned (${amount})", "severity": "high"})

                elif currency == "inr":
                    if amount > 200000:
                        penalty += 12.0
                        findings.append({"text": f"Suspiciously large INR amount mentioned (₹{amount})", "severity": "high"})
                    elif "day" in text and amount > 10000:
                        penalty += 15.0
                        findings.append({"text": f"Highly anomalous compensation detected (>₹{amount}/day for intern)", "severity": "critical"})

                elif currency == "k_per_month":
                    if amount > 50:
                        penalty += 12.0
                        findings.append({"text": f"Highly anomalous compensation detected (>{amount}k/month for intern)", "severity": "high"})
            except ValueError:
                pass

    earn_pattern = re.findall(r"(?:earn|make|get)\s+\$?(\d[\d,]*)\s*(?:per|a|every)\s*(?:day|week)", text)
    for match in earn_pattern:
        try:
            amount = float(match.replace(",", ""))
            if amount > 500:
                penalty += 15.0
                findings.append({"text": f"Unrealistic generic earning claim ('Earn >${amount} per day/week')", "severity": "critical"})
        except ValueError:
            pass

    return penalty


# =============================================================================
# RISK LEVEL DETERMINATION
# =============================================================================

def _get_risk_level(score: float) -> str:
    if score >= 60:
        return "critical"
    elif score >= 30:
        return "high"
    elif score >= 15:
        return "medium"
    elif score > 0:
        return "low"
    return "safe"

def _get_risk_label(level: str) -> str:
    return {
        "critical": "Critical Risk — Almost Certainly a Scam",
        "high": "High Risk — Likely a Scam",
        "medium": "Medium Risk — Suspicious Indicators Found",
        "low": "Low Risk — Minor Concerns",
        "safe": "Safe — No Issues Detected",
    }.get(level, "Unknown")


# =============================================================================
# MAIN DETECTION FUNCTION
# =============================================================================

def detect_scam(internship: schemas.InternshipCreate) -> Tuple[bool, float, str]:
    """
    Runs the full 5-pillar scam analysis and returns:
        (is_scam: bool, scam_score: float, scam_report_json: str)

    The scam_report_json is a JSON string with the structure:
    {
        "overall_score": float,
        "risk_level": str,
        "risk_label": str,
        "pillars": [
            {
                "id": str,
                "name": str,
                "score": float,
                "max_score": float,
                "findings": [ { "text": str, "severity": str } ]
            }
        ],
        "summary": [ str ]   # flat list of all finding texts (backward-compatible)
    }
    """
    desc_lower = internship.description.lower()
    title_lower = internship.title.lower()
    combined_text = f"{title_lower} {desc_lower}"

    # Track per-pillar results
    pillar_results = []
    total_score = 0.0
    all_findings_flat = []

    # ── PILLAR 1: Keyword Pattern Detection ──────────────────────────────────
    p1_score = 0.0
    p1_findings = []
    for category, config in KEYWORD_PATTERNS.items():
        weight = config["weight"]
        for keyword in config["keywords"]:
            if keyword in combined_text:
                if keyword in title_lower:
                    p1_score += weight * 1.5
                    p1_findings.append({"text": f"Clickbait keyword in title: '{keyword}'", "severity": "high"})
                else:
                    p1_score += weight
                    p1_findings.append({"text": f"Suspicious keyword: '{keyword}'", "severity": "medium"})

    pillar_results.append({
        "id": "keyword_patterns",
        "name": "Keyword Pattern Detection",
        "icon": "search",
        "score": round(p1_score, 1),
        "max_score": 50.0,
        "findings": _dedupe_findings(p1_findings),
    })
    total_score += p1_score

    # ── PILLAR 2: Suspicious Phrase Scoring ──────────────────────────────────
    p2_score = 0.0
    p2_findings = []
    for pattern, phrase_score, desc in SUSPICIOUS_PHRASES:
        if re.search(pattern, combined_text):
            p2_score += phrase_score
            p2_findings.append({"text": desc, "severity": "high"})

    pillar_results.append({
        "id": "phrase_scoring",
        "name": "Suspicious Phrase Scoring",
        "icon": "message-circle",
        "score": round(p2_score, 1),
        "max_score": 50.0,
        "findings": _dedupe_findings(p2_findings),
    })
    total_score += p2_score

    # ── PILLAR 3: Heuristic Credibility Rules ────────────────────────────────
    p3_findings = []
    p3_score = _evaluate_credibility_heuristics(internship, p3_findings)
    pillar_results.append({
        "id": "credibility_heuristics",
        "name": "Heuristic Credibility Rules",
        "icon": "shield",
        "score": round(p3_score, 1),
        "max_score": 50.0,
        "findings": _dedupe_findings(p3_findings),
    })
    total_score += p3_score

    # ── PILLAR 4: Company Metadata Evaluation ────────────────────────────────
    p4_findings = []
    p4_score = _evaluate_company_metadata(internship, p4_findings)
    pillar_results.append({
        "id": "company_metadata",
        "name": "Company Metadata Evaluation",
        "icon": "building",
        "score": round(p4_score, 1),
        "max_score": 50.0,
        "findings": _dedupe_findings(p4_findings),
    })
    total_score += p4_score

    # ── PILLAR 5: Compensation Anomaly Detection ─────────────────────────────
    p5_findings = []
    p5_score = _detect_compensation_anomalies(internship, p5_findings)
    pillar_results.append({
        "id": "compensation_anomaly",
        "name": "Compensation Anomaly Detection",
        "icon": "dollar-sign",
        "score": round(p5_score, 1),
        "max_score": 50.0,
        "findings": _dedupe_findings(p5_findings),
    })
    total_score += p5_score

    # ── Build final report ───────────────────────────────────────────────────
    final_score = min(total_score, 100.0)
    is_scam = final_score >= 30.0
    risk_level = _get_risk_level(final_score)

    # Build flat summary for backward compatibility
    for pillar in pillar_results:
        for finding in pillar["findings"]:
            all_findings_flat.append(finding["text"])

    report = {
        "overall_score": round(float(final_score), 1),
        "risk_level": risk_level,
        "risk_label": _get_risk_label(risk_level),
        "is_scam": is_scam,
        "pillars": pillar_results,
        "summary": list(dict.fromkeys(all_findings_flat)),
    }

    return is_scam, round(float(final_score), 1), json.dumps(report)


def _dedupe_findings(findings: list) -> list:
    """Remove duplicate findings preserving order."""
    seen = set()
    unique = []
    for f in findings:
        key = f["text"]
        if key not in seen:
            seen.add(key)
            unique.append(f)
    return unique
