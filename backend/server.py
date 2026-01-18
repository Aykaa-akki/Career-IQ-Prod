from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import json
import hashlib
import razorpay
from openai import OpenAI
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
import base64
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
import io
import PyPDF2
from docx import Document
import aiofiles
import tempfile

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize OpenAI
openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

# Initialize Razorpay
razorpay_client = razorpay.Client(
    auth=(os.environ.get('RAZORPAY_KEY_ID'), os.environ.get('RAZORPAY_KEY_SECRET'))
)

# SendGrid config
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'support.career-iq@aykaa.me')
SENDER_NAME = os.environ.get('SENDER_NAME', 'CareerIQ')

app = FastAPI(title="CareerIQ Backend")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== PYDANTIC MODELS ==============

class OrderCreate(BaseModel):
    tier: int = Field(..., description="Payment tier: 499, 2999, or 4498")
    session_id: str = Field(..., description="Session ID from file upload")
    # UTM tracking parameters
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_adset: Optional[str] = None
    utm_adcreative: Optional[str] = None

class OrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    session_id: str

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    session_id: str
    # UTM tracking parameters
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_adset: Optional[str] = None
    utm_adcreative: Optional[str] = None

class AnalysisInput(BaseModel):
    session_id: str

class UpgradeRequest(BaseModel):
    session_id: str
    new_tier: int

class EmailReportRequest(BaseModel):
    session_id: str
    email: EmailStr

class SessionResponse(BaseModel):
    session_id: str
    status: str
    tier: Optional[int] = None
    report: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

# v3.0 - Delivery Log
class DeliveryLog(BaseModel):
    report_id: str
    channel: str  # 'email' or 'whatsapp'
    status: str  # 'sent', 'failed', 'pending'
    provider_message_id: Optional[str] = None

# ============== PROMPT VERSIONS ==============

PROMPT_VERSIONS = {
    "input_validation": "v3.1",
    "signal_extraction": "v3.1",
    "recruiter_heuristics": "v3.1",
    "diagnosis": "v3.1",
    "risk": "v3.1",
    "execution_guardrails": "v3.1",
    "decision_intelligence": "v3.1",
    "quality_auditor": "v3.1"
}

SCHEMA_VERSIONS = {
    "extraction_json": "v3.1",
    "recruiter_scan": "v3.1",
    "diagnosis_output": "v3.1",
    "risk_output": "v3.1",
    "execution_output": "v3.1",
    "decision_output": "v3.1"
}

# v3.1 Static Disclaimer - Added to all reports
REPORT_DISCLAIMER = """
DISCLAIMER: This report is a diagnostic intelligence output, not career advice. 
CareerIQ analyzes market signals and perception patterns. It does not recommend actions.
All decisions and their consequences are the sole responsibility of the reader.
This analysis is based on the documents provided and reflects market interpretation patterns, not objective truth.
"""

# v3.1 Closing Section - Added to all reports (exact copy - DO NOT MODIFY)
CLOSING_SECTION = {
    "title": "What This Really Means for You",
    "paragraphs": [
        "If this report felt confronting, that's intentional — but it's not a judgment on your ability or potential. What you're seeing here is not a verdict on you. It's a reflection of how the market currently interprets your profile under pressure.",
        "In most cases, professionals don't get filtered out because they're underqualified. They get filtered out because their signals don't line up clearly enough with the decision a recruiter needs to make.",
        "The value of this report isn't in pointing out what's \"wrong.\" It's in showing you what's missing, unclear, or misaligned — so the decision no longer feels mysterious.",
        "Once you understand how these signals are read, the process stops feeling random. You regain control — not by doing more, but by aligning what the market needs to see."
    ],
    "closing_line": "Thank you for trusting CareerIQ with a decision that matters. Clarity is the first step — and now you have it."
}

# ============== RECRUITER HEURISTICS ENGINE (v3.1) ==============
# Pattern shortcuts that recruiters use in 7-15 second scans

RECRUITER_HEURISTICS = """
=== RECRUITER HEURISTICS ENGINE ===
Recruiters don't analyze — they pattern-match. These are the cognitive shortcuts they use:

TITLE HEURISTICS:
- "Too many lateral titles = stagnation signal"
- "Adjacent titles without clear progression = defensive downgrade"
- "Title inflation without scope evidence = internal promotion bias"
- "Fast promotions without external validation = company-specific inflation"

OWNERSHIP HEURISTICS:
- "Outcome-heavy language without scope = execution bias"
- "Strategy words without P&L evidence = aspirational positioning"
- "Team mentions without direct reports = matrix contributor, not leader"
- "Founder adjacency without P&L = perceived support role"

SENIORITY HEURISTICS:
- "Years don't equal seniority — scope does"
- "Big company + vague scope = cog-in-machine perception"
- "Small company + big title = inflation suspicion"
- "Consulting background without industry depth = generalist risk"

IDENTITY HEURISTICS:
- "Multiple domains = jack of all trades perception"
- "Skill-first headline = executor positioning"
- "Outcome-first headline = leader positioning"
- "Mismatched resume/LinkedIn = trust friction"

SCAN BEHAVIOR:
- First 3 seconds: Title, company, tenure
- Next 5 seconds: Progression pattern, scope indicators
- Final 7 seconds: Red flags, deal-breakers, shortlist decision
"""

# ============== MASTER PROMPTS (v3.1 - WITH RECRUITER HEURISTICS) ==============

INPUT_VALIDATION_PROMPT = """You are CareerIQ's input validator. Your ONLY job is to determine if the provided resume and LinkedIn content are valid professional documents suitable for career analysis.

VALIDATION RULES:
1. Resume must have at least 300 characters of extractable text
2. Resume must contain professional indicators (job titles, companies, dates, responsibilities)
3. Resume must NOT be placeholder text, lorem ipsum, or junk
4. LinkedIn profile is OPTIONAL - if not provided, set linkedin_confidence_penalty to true
5. If LinkedIn IS provided, it must contain professional content (headline, about, or experience)

RESPOND ONLY WITH JSON:
{
  "is_valid": true/false,
  "linkedin_provided": true/false,
  "linkedin_confidence_penalty": true/false,
  "reason": "specific reason if invalid, null if valid"
}

DO NOT provide any other commentary or analysis."""

SIGNAL_EXTRACTION_PROMPT = """You are CareerIQ's Signal Extraction Engine. Extract ALL observable signals from the resume and LinkedIn (if provided). You MUST extract signals across ALL FIVE INDEPENDENT SIGNAL CLASSES. Do not collapse signals - each class must be analyzed separately.

=== IDENTITY BLOCK ===
Name: [Extract full name from resume]
Current Role: [Most recent job title]
Target Role: [Provided by user input]

=== SIGNAL CLASS 1: TITLE & ROLE IDENTITY ===
- Exact job titles held (in chronological order)
- Title progression trajectory (ascending, flat, mixed)
- Functional domain consistency (single domain vs. multiple domains)
- Title vs. actual responsibility alignment

=== SIGNAL CLASS 2: OWNERSHIP vs EXECUTION ===
- Decision-led language: "decided", "owned", "led strategy", "chose", "approved"
- Execution-led language: "delivered", "implemented", "executed", "supported", "assisted"
- Ratio of ownership to execution indicators
- Evidence of P&L, budget, or team accountability
- Cross-functional influence scope

=== SIGNAL CLASS 3: SENIORITY & AUTHORITY ===
- Reporting structure indicators (who they reported to, who reported to them)
- Scope of impact (individual, team, department, company, market)
- Decision-making authority evidence
- Span of control indicators
- Leadership vs. individual contributor signals

=== SIGNAL CLASS 4: PROFESSIONAL IDENTITY ===
- Single clear identity vs. fragmented identity
- Primary function (what they ARE vs. what they DO)
- LinkedIn headline framing (role-first, skill-first, outcome-first) - if LinkedIn provided
- About section positioning (leader, expert, executor, generalist) - if LinkedIn provided
- Resume-LinkedIn alignment or mismatch - if LinkedIn provided

=== SIGNAL CLASS 5: MARKET FIT FOR TARGET ROLE ===
- Direct experience match with target role
- Adjacent experience that transfers
- Missing experience gaps
- Seniority alignment with target role expectations
- Market perception risk areas

OUTPUT THIS EXACT JSON STRUCTURE:
{
  "identity_block": {
    "name": "Full name from resume",
    "current_role": "Most recent job title",
    "target_role": "From user input",
    "linkedin_provided": true/false,
    "confidence_modifier": "full|reduced (reduced if no LinkedIn)"
  },
  "signal_class_1_title_identity": {
    "titles_chronological": ["oldest title", "...", "most recent title"],
    "progression_pattern": "ascending|flat|declining|mixed",
    "functional_domains": ["domain1", "domain2"],
    "domain_consistency": "single_domain|multi_domain|fragmented",
    "title_responsibility_alignment": "aligned|inflated|understated|mismatched",
    "raw_title_signals": ["exact phrases from profile"]
  },
  "signal_class_2_ownership_execution": {
    "ownership_indicators": ["exact phrases showing ownership"],
    "execution_indicators": ["exact phrases showing execution"],
    "ownership_strength": "strong|moderate|weak|absent",
    "execution_strength": "strong|moderate|weak|absent",
    "dominant_signal": "ownership|execution|balanced",
    "pnl_budget_evidence": true/false,
    "team_accountability_evidence": true/false,
    "cross_functional_scope": "narrow|moderate|broad"
  },
  "signal_class_3_seniority_authority": {
    "highest_reporting_level": "string",
    "direct_reports_evidence": true/false,
    "scope_of_impact": "individual|team|department|company|market",
    "decision_authority_level": "none|limited|moderate|significant|full",
    "leadership_vs_ic_signal": "leader|ic|hybrid",
    "seniority_trajectory": "ascending|flat|declining"
  },
  "signal_class_4_professional_identity": {
    "primary_identity": "string (what they ARE, not what they do)",
    "secondary_identities": ["other identities present"],
    "identity_clarity": "clear|moderate|fragmented|conflicting",
    "linkedin_headline_type": "role_first|skill_first|outcome_first|hybrid|not_available",
    "linkedin_positioning": "leader|expert|executor|generalist|unclear|not_available",
    "resume_linkedin_alignment": "aligned|misaligned|partially_aligned|not_applicable"
  },
  "signal_class_5_target_role_fit": {
    "target_role": "string",
    "direct_match_signals": ["signals that match target"],
    "adjacent_match_signals": ["related but not direct signals"],
    "gap_signals": ["what's missing for target role"],
    "seniority_fit": "underqualified|matched|overqualified|unclear",
    "perception_risks": ["specific risks for this target role"]
  },
  "multi_signal_conflicts": [
    {
      "conflict": "description of conflict between signal classes",
      "classes_involved": ["class1", "class2"],
      "market_interpretation": "how market will read this conflict"
    }
  ],
  "recruiter_ten_second_scan": {
    "first_3_seconds": "What recruiters notice immediately (title, company, tenure)",
    "next_5_seconds": "What they assess (progression, scope indicators)",
    "final_7_seconds": "Decision triggers (red flags, deal-breakers, shortlist decision)",
    "instant_perception": "Single sentence: How this profile is categorized in 10 seconds",
    "hesitation_triggers": ["Specific elements that cause recruiter pause"],
    "ignored_elements": ["What recruiters will skip or not notice"]
  },
  "heuristics_triggered": [
    {
      "heuristic": "The pattern shortcut that applies",
      "evidence": "What in the profile triggers this heuristic",
      "market_consequence": "How this shapes perception"
    }
  ]
}

CRITICAL RULES:
- Extract ALL five signal classes independently
- Do NOT collapse signals into a single theme
- Include EXACT phrases from the profile as evidence
- Identify conflicts BETWEEN signal classes
- Do NOT invent information not present in the profile
- MUST include recruiter_ten_second_scan with realistic scan behavior
- MUST identify at least 2 heuristics_triggered from the profile
- If LinkedIn not provided, mark relevant fields as "not_available" or "not_applicable"
- Apply confidence_modifier: "reduced" when LinkedIn is missing"""

DIAGNOSIS_PROMPT = """You are CareerIQ — a career DECISION INTELLIGENCE system. You diagnose how the market will interpret a candidate's profile.

=== IDENTITY BLOCK (Include at top of output) ===
You must include the candidate's identity information at the top of your response.

=== CONTEXT INTRO ===
This is a market perception diagnosis. It reveals how recruiters, hiring managers, and decision-makers will interpret the signals in this profile. It does not assess capability, potential, or value. It assesses PERCEPTION.

=== INTERPRETATION ANCHORS ===
1. "The market reads this as..." - Always frame findings as market interpretation
2. "When a recruiter scans this..." - Ground observations in actual scanning behavior
3. "The signal conflict between X and Y creates..." - Show signal interactions
4. "This profile triggers the perception that..." - Focus on perception, not reality

=== CORE CONSTRAINTS ===
- NEVER say "should", "could", "try", "consider", "recommend"
- NEVER provide action steps or fixes
- NEVER offer encouragement or validation
- ALWAYS frame as "how market reads" not "what candidate is capable of"
- ALWAYS reference multiple signal classes (minimum 3 per section)

=== REPORT STRUCTURE ===

1. CAREER VERDICT (Synthesized)
Write ONE decisive verdict that synthesizes signals from AT LEAST 3 signal classes. This verdict must explain the OVERALL market perception, not a single issue.

2. HOW THE MARKET IS READING THIS PROFILE (Multi-Signal)
Analyze how recruiters interpret this profile using:
- Title/Role signals AND
- Ownership/Execution signals AND  
- Seniority/Authority signals AND
- Identity signals
Show how these signals INTERACT during recruiter scanning.

3. WHERE AUTHORITY BREAKS (Multiple Breakpoints)
Identify AT LEAST 3 DIFFERENT points where the candidate's authority perception breaks:
- One from Title/Role misalignment
- One from Ownership/Execution ambiguity
- One from Seniority/Identity conflicts
Each breakpoint must be independent.

4. WHY THIS MISMATCH IS HAPPENING (Structural Causes)
Explain the STRUCTURAL reasons (not just title issues) for signal conflicts:
- How execution-heavy language undermines ownership claims
- How identity fragmentation creates doubt
- How seniority signals don't match scope claims

5. CAREER RISK IF UNCHANGED (Compounding Risks)
Describe AT LEAST 3 DIFFERENT risks from DIFFERENT signal classes:
- Title risk (down-leveling)
- Ownership risk (executor perception)
- Identity risk (unclear positioning)
- Seniority risk (authority doubt)

6. DIAGNOSTIC SUMMARY (Synthesis)
Summarize the interaction of multiple signal conflicts. End with the core tension, not a single issue.

OUTPUT JSON:
{
  "identity_block": {
    "name": "From extraction",
    "current_role": "From extraction",
    "target_role": "From extraction",
    "linkedin_provided": true/false,
    "confidence_level": "full|reduced"
  },
  "recruiter_scan_summary": {
    "ten_second_verdict": "In a 10-second scan, recruiters will see [X], notice [Y], and hesitate at [Z]",
    "instant_categorization": "This profile is instantly categorized as...",
    "primary_hesitation": "The main hesitation trigger is..."
  },
  "context_intro": "This diagnosis reveals how the market interprets [name]'s profile for [target_role] roles. It does not assess capability.",
  "career_verdict": "Multi-signal synthesized verdict (must reference 3+ signal classes)",
  "interpretation_anchors": {
    "primary_anchor": "The market reads this profile as...",
    "scanning_behavior": "When a recruiter scans this profile, they see...",
    "signal_conflict_summary": "The key signal conflicts that shape perception are..."
  },
  "heuristics_applied": [
    {
      "heuristic": "Pattern shortcut recruiters apply",
      "how_it_affects_this_profile": "Specific impact on perception"
    }
  ],
  "market_reading": {
    "title_role_interpretation": "How market reads title/role signals",
    "ownership_execution_interpretation": "How market reads ownership vs execution",
    "seniority_authority_interpretation": "How market reads seniority signals",
    "identity_interpretation": "How market reads professional identity",
    "signal_interaction": "How these signals COMBINE during recruiter scanning"
  },
  "authority_breakpoints": [
    {
      "breakpoint": "string",
      "signal_class": "which signal class",
      "market_consequence": "what happens when this breaks"
    }
  ],
  "mismatch_causes": {
    "structural_cause_1": "string (from ownership/execution)",
    "structural_cause_2": "string (from identity)",
    "structural_cause_3": "string (from seniority)",
    "how_they_compound": "how these causes interact"
  },
  "career_risks": [
    {
      "risk_type": "title|ownership|identity|seniority|market_fit",
      "risk_description": "string",
      "probability_trigger": "what makes this risk activate"
    }
  ],
  "diagnostic_summary": "Synthesis of multi-signal conflicts, ending with core tension"
}

TONE: Precise, clinical, synthesized. NO advice. NO encouragement."""

RISK_PROMPT = """You are CareerIQ — generating the RISK ASSESSMENT layer from STRUCTURED SIGNAL DATA.

=== CRITICAL REQUIREMENT ===
You MUST identify risks from MULTIPLE INDEPENDENT signal classes. 
DO NOT generate risks that are all variations of the same issue.
Each risk must come from a DIFFERENT signal class.

=== RISK CATEGORIES (Must include AT LEAST ONE from EACH) ===

1. TITLE MISALIGNMENT RISK - From Signal Class 1
How title signals create market perception gaps

2. OWNERSHIP SIGNAL RISK - From Signal Class 2  
How ownership vs execution signals create down-leveling risk

3. SENIORITY COMPRESSION RISK - From Signal Class 3
How authority signals fail to match target role expectations

4. IDENTITY DIFFUSION RISK - From Signal Class 4
How fragmented or conflicting identity creates recruiter doubt

5. MARKET FIT RISK - From Signal Class 5
How gaps between profile and target role create rejection triggers

=== SIGNAL CONFLICTS TO SURFACE ===
Identify WHERE signals contradict:
- Title says X but ownership signals say Y
- Seniority claims Z but scope evidence shows W
- Identity is A on LinkedIn but B on resume

OUTPUT JSON:
{
  "independent_risks": [
    {
      "risk_id": 1,
      "risk_category": "title_misalignment|ownership_signal|seniority_compression|identity_diffusion|market_fit",
      "signal_class_source": "1|2|3|4|5",
      "risk_name": "Short name",
      "evidence_from_profile": "Exact signals that create this risk",
      "market_perception": "How recruiters interpret this",
      "consequence": "What happens if unchanged",
      "compounding_factor": "How this risk amplifies other risks"
    }
  ],
  "signal_conflicts": [
    {
      "conflict_id": 1,
      "signal_a": "Signal from one class",
      "signal_b": "Conflicting signal from another class",
      "classes_involved": ["class_x", "class_y"],
      "market_interpretation": "How market reads this conflict",
      "resolution_required": "What decision the candidate must make"
    }
  ],
  "risk_compounding_analysis": "How these independent risks COMBINE to create worse outcomes than any single risk",
  "most_damaging_risk_combination": "Which 2-3 risks together create the worst outcome"
}

CONSTRAINTS:
- MINIMUM 4 independent risks from DIFFERENT signal classes
- MINIMUM 2 signal conflicts
- Each risk must have DIFFERENT evidence
- NO advice, fixes, or steps
- NO encouragement"""

EXECUTION_GUARDRAILS_PROMPT = """You are CareerIQ — generating EXECUTION GUARDRAILS from structured signal and risk data.

You receive the EXTRACTION JSON and RISK ANALYSIS. Your job is to define BOUNDARIES and GUARDRAILS, not action steps.

=== GUARDRAIL CATEGORIES ===

1. IDENTITY PROTECTION GUARDRAILS
What identity signals the candidate must NOT dilute
What positioning they cannot abandon

2. SENIORITY PROTECTION GUARDRAILS  
What authority claims they cannot walk back
What scope evidence they must maintain

3. OWNERSHIP PROTECTION GUARDRAILS
What decision-making signals they cannot let slip
What accountability they must not delegate

4. MARKET POSITIONING GUARDRAILS
What market perception they cannot afford to lose
What competitive positioning they must hold

=== TRAPS TO SURFACE ===
Based on the profile's specific risks, identify:
- Interview traps that will exploit their signal gaps
- Offer traps that will down-level them
- Role traps that will misposition them

OUTPUT JSON:
{
  "identity_guardrails": [
    {
      "protect": "What identity signal to protect",
      "violation_trigger": "What action would violate this",
      "consequence_of_violation": "What happens if violated"
    }
  ],
  "seniority_guardrails": [
    {
      "protect": "What seniority signal to protect",
      "violation_trigger": "What action would violate this",
      "consequence_of_violation": "What happens if violated"
    }
  ],
  "ownership_guardrails": [
    {
      "protect": "What ownership signal to protect",
      "violation_trigger": "What action would violate this",
      "consequence_of_violation": "What happens if violated"
    }
  ],
  "traps_to_avoid": [
    {
      "trap_type": "interview|offer|role|negotiation",
      "trap_description": "The specific trap",
      "why_this_profile_is_vulnerable": "Why their signals make them susceptible",
      "recognition_signal": "How to recognize they're in this trap"
    }
  ],
  "abort_conditions": [
    {
      "condition": "When to walk away",
      "signal_to_watch": "What indicates this condition",
      "why_abort": "Why continuing would be damaging"
    }
  ],
  "guardrails_summary": "Summary of what must be protected and why"
}

NO ACTION STEPS. NO "HOW TO". ONLY BOUNDARIES."""

DECISION_INTELLIGENCE_PROMPT = """You are CareerIQ — generating the DECISION INTELLIGENCE layer.

=== IDENTITY BLOCK (Include at top) ===
Include candidate's name, current role, and target role.

=== CONTEXT INTRO ===
These are COMMITMENTS, not advice. Each commitment forces a choice between two viable paths. Neither path is "right" — both have real costs and real gains. The candidate must COMMIT to one path.

=== COMMITMENT ARCHITECTURE (v3.1) ===

Each COMMITMENT must:
1. Be a clear A vs B choice (not A vs "nothing")
2. Have REAL trade-offs (both options have COSTS)
3. Have IRREVERSIBLE consequences (choosing matters)
4. Come from DIFFERENT signal conflicts
5. Include a MARKET DEFAULT — what happens if no choice is made

=== REQUIRED COMMITMENTS (Generate EXACTLY 3 - NO MORE) ===

CRITICAL: Generate exactly 3 commitments. Not 4, not 5. Three forces decisiveness.

Select the 3 MOST CRITICAL from these types based on the profile's signal conflicts:

COMMITMENT TYPE 1: IDENTITY COMMITMENT
Based on identity signal conflicts, force a commitment about WHO they want to be perceived as.

COMMITMENT TYPE 2: SENIORITY COMMITMENT  
Based on seniority signal gaps, force a commitment about authority positioning.

COMMITMENT TYPE 3: OWNERSHIP COMMITMENT
Based on ownership vs execution signals, force a commitment about role positioning.

COMMITMENT TYPE 4: MARKET TARGETING COMMITMENT
Based on market fit gaps, force a commitment about target strategy.

=== COMMITMENT RULES ===
- EXACTLY 3 commitments (not more, not less)
- No "consider" or "might want to"
- No encouragement
- No advice disguised as options
- Each option must have REAL costs stated explicitly
- "Do nothing" triggers MARKET DEFAULT (always worse than choosing)
- Market Default MUST be specific and unfavorable
- Each commitment should hurt a little — force identity clarity

=== STATE SHIFT SUMMARY ===
Include a simplified state shift showing:
- Now: Current market perception
- If you commit: How perception shifts with clear commitments
- If you don't: How perception degrades without action

OUTPUT JSON:
{
  "identity_block": {
    "name": "From extraction",
    "current_role": "From extraction", 
    "target_role": "From extraction"
  },
  "context_intro": "These are commitments, not advice. Each forces a choice between two viable paths with real costs.",
  "commitments": [
    {
      "commitment_id": 1,
      "commitment_type": "identity|seniority|ownership|market_targeting|risk_appetite",
      "commitment_title": "Clear name of the commitment",
      "signal_conflict_source": "Which signal conflict forces this commitment",
      "option_a": {
        "choice": "What they commit to",
        "trade_off": "What they give up",
        "short_term_consequence": "Immediate impact",
        "long_term_consequence": "Career trajectory impact"
      },
      "option_b": {
        "choice": "Alternative commitment",
        "trade_off": "What they give up",
        "short_term_consequence": "Immediate impact",
        "long_term_consequence": "Career trajectory impact"
      },
      "market_default": {
        "description": "What happens if no commitment is made",
        "why_its_worse": "Why the default path is inferior to either A or B",
        "market_perception": "How the market will interpret inaction"
      },
      "commitment_is_irreversible_because": "Why this commitment matters"
    }
  ],
  "commitment_interactions": {
    "if_all_option_a": "What career path looks like if all A commitments",
    "if_all_option_b": "What career path looks like if all B commitments",
    "optimal_combination": "Which combination of commitments creates best coherence",
    "worst_combination": "Which combination creates most incoherence"
  },
  "state_shift_summary": {
    "current_state": "How market currently perceives this profile",
    "state_if_option_a_path": "How market will perceive after A-path commitments",
    "state_if_option_b_path": "How market will perceive after B-path commitments",
    "state_if_no_commitment": "How market perception will degrade without commitments"
  },
  "final_intelligence_summary": "Synthesis of what these commitments reveal about the candidate's career position"
}

THIS IS THE CORE VALUE OF CAREERIQ. FORCE REAL COMMITMENTS WITH MARKET DEFAULTS."""

QUALITY_AUDITOR_PROMPT = """You are CareerIQ's Quality Auditor. You MUST reject reports that fail CareerIQ standards.

=== REJECTION CRITERIA (HARD RULES) ===

1. SINGLE-SIGNAL DOMINANCE (CRITICAL)
REJECT if more than 40% of content refers to the same signal (e.g., "title mismatch" repeated)
REJECT if the same insight appears in multiple sections with different words
REJECT if risks are all variations of one theme

2. MISSING SIGNAL CLASSES
REJECT if any signal class (title, ownership, seniority, identity, market fit) is not addressed
REJECT if extraction data is not fully utilized

3. ADVICE CONTAMINATION
REJECT if ANY of these appear: "should", "consider", "try to", "might want", "could", "recommend"
REJECT if there are action steps disguised as analysis

4. SHALLOW DECISIONS
REJECT if decisions don't have real trade-offs
REJECT if Option B is just "don't do Option A"
REJECT if consequences aren't specific to this profile

5. GENERIC CONTENT
REJECT if content could apply to any candidate
REJECT if profile-specific evidence is missing

=== QUALITY METRICS ===
Calculate:
- Signal class coverage (must be 5/5)
- Unique insights per section (must be 3+ per section)
- Decision trade-off depth (both options must have real costs)

OUTPUT JSON:
{
  "approved": true/false,
  "quality_scores": {
    "signal_class_coverage": "X/5 signal classes addressed",
    "single_signal_dominance_check": "PASS|FAIL - which signal dominated if fail",
    "unique_insights_count": "number of distinct insights",
    "advice_contamination_check": "PASS|FAIL - exact phrases if fail",
    "decision_quality_check": "PASS|FAIL - reason if fail"
  },
  "rejection_reasons": ["reason1", "reason2"] or null if approved,
  "specific_violations": ["exact text that violates rules"] or null if approved,
  "rewrite_instructions": "What specifically must change" or null if approved
}"""

# ============== HELPER FUNCTIONS ==============

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text.strip()
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        return ""

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc = Document(io.BytesIO(file_content))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text.strip()
    except Exception as e:
        logger.error(f"DOCX extraction error: {e}")
        return ""

def hash_content(content: str) -> str:
    """Generate hash of content for duplicate detection"""
    return hashlib.sha256(content.encode()).hexdigest()

async def call_llm(system_prompt: str, user_content: str, prompt_name: str) -> Dict[str, Any]:
    """Make independent LLM call with logging"""
    try:
        # OpenAI requires 'json' word in messages when using response_format: json_object
        enhanced_user_content = f"{user_content}\n\nRespond with valid JSON only."
        
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt + "\n\nYou must respond with valid JSON format only."},
                {"role": "user", "content": enhanced_user_content}
            ],
            temperature=0.4,  # Slightly higher for more varied analysis
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Log the call
        await db.llm_logs.insert_one({
            "prompt_name": prompt_name,
            "prompt_version": PROMPT_VERSIONS.get(prompt_name, "unknown"),
            "model": "gpt-4o",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "input_length": len(user_content),
            "output": result
        })
        
        return result
    except Exception as e:
        logger.error(f"LLM call error ({prompt_name}): {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

async def run_quality_audit(section_name: str, section_content: Dict, extraction_data: Dict = None) -> Dict:
    """Run quality auditor on a section with extraction context"""
    audit_context = f"Section: {section_name}\nContent: {json.dumps(section_content, indent=2)}"
    if extraction_data:
        audit_context += f"\n\nExtraction Data Available: {json.dumps(extraction_data, indent=2)}"
    return await call_llm(QUALITY_AUDITOR_PROMPT, audit_context, "quality_auditor")

async def generate_section_with_retry(prompt: str, user_content: str, section_name: str, extraction_data: Dict = None, max_retries: int = 2) -> Dict:
    """Generate a section with quality audit and retry logic"""
    for attempt in range(max_retries + 1):
        result = await call_llm(prompt, user_content, section_name)
        audit = await run_quality_audit(section_name, result, extraction_data)
        
        if audit.get("approved", False):
            return result
        
        if attempt < max_retries:
            logger.info(f"Section {section_name} rejected, retrying... Reasons: {audit.get('rejection_reasons')}")
            rewrite_instructions = audit.get("rewrite_instructions", "")
            user_content += f"\n\nPREVIOUS ATTEMPT REJECTED.\nViolations: {audit.get('specific_violations')}\nRewrite Instructions: {rewrite_instructions}\n\nYou MUST address multi-signal synthesis. DO NOT repeat single signals across sections."
        else:
            logger.warning(f"Section {section_name} failed quality audit after {max_retries} retries")
            return result
    
    return result

def generate_pdf_report(report_data: Dict, session_data: Dict) -> bytes:
    """Generate PDF report using ReportLab (v3.0)"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.75*inch, bottomMargin=0.75*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=HexColor('#6366f1')
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=12,
        spaceBefore=20,
        textColor=HexColor('#333333')
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=12,
        leading=16
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=9,
        spaceAfter=8,
        textColor=HexColor('#666666'),
        fontStyle='italic'
    )
    
    story = []
    
    # Title with Identity Block (v3.0)
    story.append(Paragraph("CareerIQ Intelligence Report", title_style))
    story.append(Paragraph(f"<b>Name:</b> {session_data.get('full_name', 'N/A')}", body_style))
    story.append(Paragraph(f"<b>Current Role:</b> {session_data.get('current_role', 'N/A')}", body_style))
    story.append(Paragraph(f"<b>Target Role:</b> {session_data.get('target_role', 'N/A')}", body_style))
    story.append(Paragraph(f"<b>Report Tier:</b> ₹{session_data.get('tier', 'N/A')}", body_style))
    story.append(Spacer(1, 10))
    
    # Disclaimer (v3.0)
    if report_data.get('disclaimer'):
        story.append(Paragraph(str(report_data.get('disclaimer', '')), disclaimer_style))
    story.append(Spacer(1, 20))
    
    # Diagnosis Section with Context Intro
    if 'diagnosis' in report_data:
        diagnosis = report_data['diagnosis']
        
        # Context Intro
        if diagnosis.get('context_intro'):
            story.append(Paragraph(str(diagnosis.get('context_intro', '')), body_style))
            story.append(Spacer(1, 10))
        
        story.append(Paragraph("CAREER VERDICT", heading_style))
        story.append(Paragraph(str(diagnosis.get('career_verdict', '')), body_style))
        
        # Interpretation Anchors (v3.0)
        anchors = diagnosis.get('interpretation_anchors', {})
        if anchors:
            story.append(Paragraph("INTERPRETATION ANCHORS", heading_style))
            if anchors.get('primary_anchor'):
                story.append(Paragraph(f"<b>Primary:</b> {anchors.get('primary_anchor', '')}", body_style))
            if anchors.get('scanning_behavior'):
                story.append(Paragraph(f"<b>Recruiter Scanning:</b> {anchors.get('scanning_behavior', '')}", body_style))
        
        market_reading = diagnosis.get('market_reading', {})
        if isinstance(market_reading, dict):
            story.append(Paragraph("HOW THE MARKET IS READING THIS PROFILE", heading_style))
            for key, value in market_reading.items():
                story.append(Paragraph(f"<b>{key.replace('_', ' ').title()}:</b> {value}", body_style))
        else:
            story.append(Paragraph("HOW THE MARKET IS READING THIS PROFILE", heading_style))
            story.append(Paragraph(str(market_reading), body_style))
        
        story.append(Paragraph("DIAGNOSTIC SUMMARY", heading_style))
        story.append(Paragraph(str(diagnosis.get('diagnostic_summary', '')), body_style))
    
    # Risk Section (₹2999+)
    if 'risk' in report_data:
        story.append(Spacer(1, 30))
        story.append(Paragraph("RISK ASSESSMENT", title_style))
        risk = report_data['risk']
        
        independent_risks = risk.get('independent_risks', [])
        if independent_risks:
            story.append(Paragraph("Independent Risks", heading_style))
            for r in independent_risks:
                story.append(Paragraph(f"<b>{r.get('risk_name', '')} ({r.get('risk_category', '')})</b>", body_style))
                story.append(Paragraph(f"Evidence: {r.get('evidence_from_profile', '')}", body_style))
                story.append(Paragraph(f"Consequence: {r.get('consequence', '')}", body_style))
                story.append(Spacer(1, 10))
        
        story.append(Paragraph("Risk Compounding Analysis", heading_style))
        story.append(Paragraph(str(risk.get('risk_compounding_analysis', '')), body_style))
    
    # Decisions/Commitments Section (₹4999) - v3.0 with Market Defaults
    if 'decisions' in report_data:
        story.append(Spacer(1, 30))
        story.append(Paragraph("COMMITMENTS", title_style))
        decisions = report_data['decisions']
        
        # Context intro for commitments
        if decisions.get('context_intro'):
            story.append(Paragraph(str(decisions.get('context_intro', '')), body_style))
            story.append(Spacer(1, 10))
        
        # Commitments (v3.0)
        commitments = decisions.get('commitments', decisions.get('forced_decisions', []))
        for fd in commitments:
            story.append(Paragraph(f"<b>{fd.get('commitment_title', fd.get('decision_title', ''))}</b>", heading_style))
            
            opt_a = fd.get('option_a', {})
            opt_b = fd.get('option_b', {})
            market_default = fd.get('market_default', {})
            
            story.append(Paragraph(f"<b>Option A:</b> {opt_a.get('choice', '')}", body_style))
            story.append(Paragraph(f"  Trade-off: {opt_a.get('trade_off', '')}", body_style))
            
            story.append(Paragraph(f"<b>Option B:</b> {opt_b.get('choice', '')}", body_style))
            story.append(Paragraph(f"  Trade-off: {opt_b.get('trade_off', '')}", body_style))
            
            # Market Default (v3.0)
            if market_default:
                story.append(Paragraph(f"<b>Market Default (if no choice):</b> {market_default.get('description', '')}", body_style))
            
            story.append(Spacer(1, 10))
        
        # State Shift Summary (v3.0 - ₹4999 only)
        state_shift = decisions.get('state_shift_summary', {})
        if state_shift:
            story.append(Paragraph("STATE SHIFT SUMMARY", heading_style))
            if state_shift.get('current_state'):
                story.append(Paragraph(f"<b>Current State:</b> {state_shift.get('current_state', '')}", body_style))
            if state_shift.get('state_if_option_a_path'):
                story.append(Paragraph(f"<b>If Option A Path:</b> {state_shift.get('state_if_option_a_path', '')}", body_style))
            if state_shift.get('state_if_option_b_path'):
                story.append(Paragraph(f"<b>If Option B Path:</b> {state_shift.get('state_if_option_b_path', '')}", body_style))
            if state_shift.get('state_if_no_commitment'):
                story.append(Paragraph(f"<b>If No Commitment:</b> {state_shift.get('state_if_no_commitment', '')}", body_style))
        
        story.append(Paragraph("Final Intelligence Summary", heading_style))
        story.append(Paragraph(str(decisions.get('final_intelligence_summary', '')), body_style))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

async def send_email_with_pdf(email: str, pdf_content: bytes, session_data: Dict):
    """Send email with PDF attachment via SendGrid"""
    try:
        message = Mail(
            from_email=(SENDER_EMAIL, SENDER_NAME),
            to_emails=email,
            subject=f"Your CareerIQ Intelligence Report - {session_data.get('target_role', 'Career Analysis')}",
            html_content=f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h1 style="color: #6366f1;">Your CareerIQ Report is Ready</h1>
                <p>Thank you for using CareerIQ. Your career decision intelligence report is attached.</p>
                <p><strong>Target Role:</strong> {session_data.get('target_role', 'N/A')}</p>
                <p><strong>Tier:</strong> ₹{session_data.get('tier', 'N/A')}</p>
                <br>
                <p>Remember: This is a diagnosis, not advice. The decisions are yours to make.</p>
                <br>
                <p style="color: #666;">— CareerIQ Team</p>
            </body>
            </html>
            """
        )
        
        encoded_pdf = base64.b64encode(pdf_content).decode()
        attachment = Attachment(
            FileContent(encoded_pdf),
            FileName(f"CareerIQ_Report_{session_data.get('session_id', 'report')[:8]}.pdf"),
            FileType("application/pdf"),
            Disposition("attachment")
        )
        message.attachment = attachment
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        logger.info(f"Email sent to {email}, status: {response.status_code}")
        return response.status_code == 202
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return False

# ============== API ENDPOINTS ==============

@api_router.get("/")
async def root():
    return {"message": "CareerIQ Backend API", "version": "3.1"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "careeriq-backend", "version": "3.1"}

@api_router.post("/upload")
async def upload_files(
    resume: UploadFile = File(...),
    target_role: str = Form(...),
    mobile_number: str = Form(...),
    linkedin: Optional[UploadFile] = File(None),
    # UTM parameters for attribution tracking
    utm_source: Optional[str] = Form(None),
    utm_medium: Optional[str] = Form(None),
    utm_campaign: Optional[str] = Form(None),
    utm_adset: Optional[str] = Form(None),
    utm_adcreative: Optional[str] = Form(None)
):
    """Upload resume and optional LinkedIn PDF files - Simplified flow"""
    session_id = str(uuid.uuid4())
    
    # Read resume file
    resume_content = await resume.read()
    
    # Extract text from resume
    if resume.filename.lower().endswith('.pdf'):
        resume_text = extract_text_from_pdf(resume_content)
    elif resume.filename.lower().endswith('.docx'):
        resume_text = extract_text_from_docx(resume_content)
    else:
        raise HTTPException(status_code=400, detail="Resume must be PDF or DOCX")
    
    # Basic resume validation
    if len(resume_text) < 100:
        raise HTTPException(status_code=400, detail="Resume appears to be empty or unreadable. Please upload a valid resume.")
    
    # Handle optional LinkedIn
    linkedin_text = ""
    linkedin_provided = False
    
    if linkedin:
        linkedin_content = await linkedin.read()
        if linkedin.filename.lower().endswith('.pdf'):
            linkedin_text = extract_text_from_pdf(linkedin_content)
        elif linkedin.filename.lower().endswith('.docx'):
            linkedin_text = extract_text_from_docx(linkedin_content)
        else:
            raise HTTPException(status_code=400, detail="LinkedIn export must be PDF or DOCX")
        
        if len(linkedin_text) >= 50:
            linkedin_provided = True
    
    # Build UTM tracking object
    utm_tracking = {}
    if utm_source:
        utm_tracking["utm_source"] = utm_source
    if utm_medium:
        utm_tracking["utm_medium"] = utm_medium
    if utm_campaign:
        utm_tracking["utm_campaign"] = utm_campaign
    if utm_adset:
        utm_tracking["utm_adset"] = utm_adset
    if utm_adcreative:
        utm_tracking["utm_adcreative"] = utm_adcreative
    
    # Store session - Name and current_role will be extracted from resume during analysis
    session_doc = {
        "session_id": session_id,
        "resume_text": resume_text,
        "linkedin_text": linkedin_text,
        "linkedin_provided": linkedin_provided,
        "resume_hash": hash_content(resume_text),
        "status": "uploaded",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "tier": None,
        "payment_status": "pending",
        "target_role": target_role,
        "mobile_number": mobile_number,
        "utm_tracking": utm_tracking if utm_tracking else None
    }
    
    await db.sessions.insert_one(session_doc)
    
    return {
        "session_id": session_id,
        "status": "uploaded",
        "resume_length": len(resume_text),
        "linkedin_provided": linkedin_provided,
        "linkedin_length": len(linkedin_text) if linkedin_provided else 0,
        "message": "Files uploaded successfully. Proceed to payment."
    }

@api_router.post("/create-order", response_model=OrderResponse)
async def create_order(order: OrderCreate):
    """Create Razorpay order for payment"""
    if order.tier not in [499, 2999, 4498]:
        raise HTTPException(status_code=400, detail="Invalid tier. Must be 499, 2999, or 4498")
    
    session = await db.sessions.find_one({"session_id": order.session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Please upload files first.")
    
    razorpay_order = razorpay_client.order.create({
        "amount": order.tier * 100,
        "currency": "INR",
        "payment_capture": 1,
        "notes": {
            "session_id": order.session_id,
            "tier": order.tier
        }
    })
    
    await db.sessions.update_one(
        {"session_id": order.session_id},
        {"$set": {
            "razorpay_order_id": razorpay_order["id"],
            "tier": order.tier,
            "order_created_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return OrderResponse(
        order_id=razorpay_order["id"],
        amount=order.tier * 100,
        currency="INR",
        session_id=order.session_id
    )

@api_router.post("/verify-payment")
async def verify_payment(payment: PaymentVerify):
    """Verify Razorpay payment"""
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payment.razorpay_order_id,
            'razorpay_payment_id': payment.razorpay_payment_id,
            'razorpay_signature': payment.razorpay_signature
        })
    except Exception as e:
        logger.error(f"Payment verification failed: {e}")
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    # Build UTM tracking object from payment data
    utm_tracking = {}
    if payment.utm_source:
        utm_tracking["utm_source"] = payment.utm_source
    if payment.utm_medium:
        utm_tracking["utm_medium"] = payment.utm_medium
    if payment.utm_campaign:
        utm_tracking["utm_campaign"] = payment.utm_campaign
    if payment.utm_adset:
        utm_tracking["utm_adset"] = payment.utm_adset
    if payment.utm_adcreative:
        utm_tracking["utm_adcreative"] = payment.utm_adcreative
    
    update_data = {
        "payment_status": "completed",
        "razorpay_payment_id": payment.razorpay_payment_id,
        "payment_verified_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Update UTM tracking if provided (overwrite with payment-time values)
    if utm_tracking:
        update_data["utm_tracking"] = utm_tracking
    
    await db.sessions.update_one(
        {"session_id": payment.session_id},
        {"$set": update_data}
    )
    
    return {"status": "success", "message": "Payment verified. You can now start analysis."}

@api_router.post("/analyze")
async def start_analysis(input_data: AnalysisInput, background_tasks: BackgroundTasks):
    """Start the intelligence pipeline after payment"""
    session = await db.sessions.find_one({"session_id": input_data.session_id}, {"_id": 0})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.get("payment_status") != "completed":
        raise HTTPException(status_code=402, detail="Payment required before analysis")
    
    await db.sessions.update_one(
        {"session_id": input_data.session_id},
        {"$set": {
            "status": "processing",
            "analysis_started_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    background_tasks.add_task(run_analysis_pipeline, input_data.session_id)
    
    return {"status": "processing", "message": "Analysis started. This may take 2-3 minutes."}

async def run_analysis_pipeline(session_id: str):
    """Execute the full intelligence pipeline with multi-signal synthesis"""
    try:
        session = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
        tier = session.get("tier", 499)
        
        resume_text = session.get("resume_text", "")
        linkedin_text = session.get("linkedin_text", "")
        linkedin_provided = session.get("linkedin_provided", False)
        target_role = session.get("target_role", "")
        
        # Initialize progress tracking
        await db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"current_step": 1, "assembly_state": "not_started"}}
        )
        
        # Step 1: Input Validation (LinkedIn is optional)
        linkedin_section = f"\n\nLINKEDIN:\n{linkedin_text}" if linkedin_provided else "\n\nLINKEDIN: Not provided"
        validation_input = f"RESUME:\n{resume_text}{linkedin_section}"
        validation_result = await call_llm(INPUT_VALIDATION_PROMPT, validation_input, "input_validation")
        
        if not validation_result.get("is_valid", False):
            await db.sessions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": "failed",
                    "error": validation_result.get("reason", "Invalid input"),
                    "failed_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            return
        
        # Step 1 complete → Move to Step 2
        await db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"current_step": 2}}
        )
        
        # Step 2: Signal Extraction (extracts Name and Current Role from resume)
        linkedin_extraction = f"\n\n=== LINKEDIN CONTENT ===\n{linkedin_text}" if linkedin_provided else "\n\n=== LINKEDIN CONTENT ===\nNot provided. Apply confidence_modifier: reduced."
        extraction_input = f"""TARGET ROLE: {target_role}
LINKEDIN PROVIDED: {linkedin_provided}

=== RESUME CONTENT ===
{resume_text}{linkedin_extraction}

EXTRACT ALL 5 SIGNAL CLASSES. Do not collapse signals. Each class must be analyzed independently.
IMPORTANT: Extract the candidate's full name and current/most recent job title from the resume for the identity_block.
If LinkedIn not provided, mark relevant fields as 'not_available' and set confidence_modifier to 'reduced'."""

        extraction_result = await call_llm(SIGNAL_EXTRACTION_PROMPT, extraction_input, "signal_extraction")
        
        # Extract name and current_role from extraction result
        identity_block = extraction_result.get("identity_block", {})
        full_name = identity_block.get("name", "Unknown")
        current_role = identity_block.get("current_role", "Unknown")
        
        # Step 2 complete → Move to Step 3
        await db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {
                "current_step": 3,
                "extraction_json": extraction_result,
                "full_name": full_name,
                "current_role": current_role
            }}
        )
        
        report = {
            "metadata": {
                "prompt_versions": PROMPT_VERSIONS,
                "schema_versions": SCHEMA_VERSIONS,
                "model": "gpt-4o",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "linkedin_provided": linkedin_provided,
                "confidence_level": "full" if linkedin_provided else "reduced"
            },
            "disclaimer": REPORT_DISCLAIMER,
            "identity_block": {
                "name": full_name,
                "current_role": current_role,
                "target_role": target_role
            }
        }
        
        # Step 3: Diagnosis
        diagnosis_input = f"""CANDIDATE NAME: {full_name}
CURRENT ROLE: {current_role}
TARGET ROLE: {target_role}
LINKEDIN PROVIDED: {linkedin_provided}

=== STRUCTURED EXTRACTION DATA (Use ALL signal classes) ===
{json.dumps(extraction_result, indent=2)}

Generate diagnosis using MULTI-SIGNAL SYNTHESIS with:
1. Identity Block at the top
2. Context Intro explaining this is market perception analysis
3. Interpretation Anchors framing findings
4. Reference AT LEAST 3 different signal classes in each section.
DO NOT collapse into single-signal analysis."""

        diagnosis_result = await generate_section_with_retry(
            DIAGNOSIS_PROMPT, 
            diagnosis_input, 
            "diagnosis",
            extraction_data=extraction_result
        )
        report["diagnosis"] = diagnosis_result
        
        # Step 3 complete → Move to Step 4
        await db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"current_step": 4}}
        )
        
        # Step 4: Risk Assessment (always included with ₹2999 tier)
        risk_input = f"""CANDIDATE NAME: {full_name}
CURRENT ROLE: {current_role}
TARGET ROLE: {target_role}

=== STRUCTURED EXTRACTION DATA ===
{json.dumps(extraction_result, indent=2)}

=== DIAGNOSIS DATA ===
{json.dumps(diagnosis_result, indent=2)}

Generate MINIMUM 4 independent risks from DIFFERENT signal classes. Each risk must have different evidence. Identify signal conflicts."""

        risk_result = await generate_section_with_retry(
            RISK_PROMPT, 
            risk_input, 
            "risk",
            extraction_data=extraction_result
        )
        report["risk"] = risk_result
        
        # Step 4 complete → Move to Step 5 (assembly phase)
        await db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"current_step": 5, "assembly_state": "in_progress"}}
        )
        
        # Step 5: Final Assembly (Execution Guardrails + Decision Intelligence for premium)
        if tier >= 4498:
            execution_input = f"""CANDIDATE NAME: {full_name}
CURRENT ROLE: {current_role}
TARGET ROLE: {target_role}

=== STRUCTURED EXTRACTION DATA ===
{json.dumps(extraction_result, indent=2)}

=== DIAGNOSIS DATA ===
{json.dumps(diagnosis_result, indent=2)}

=== RISK DATA ===
{json.dumps(report.get('risk', {}), indent=2)}

Generate guardrails for EACH signal class (identity, seniority, ownership, market positioning)."""

            execution_result = await generate_section_with_retry(
                EXECUTION_GUARDRAILS_PROMPT, 
                execution_input, 
                "execution_guardrails",
                extraction_data=extraction_result
            )
            report["execution"] = execution_result
            
            # Decision Intelligence with COMMITMENTS
            decision_input = f"""CANDIDATE NAME: {full_name}
CURRENT ROLE: {current_role}
TARGET ROLE: {target_role}

=== STRUCTURED EXTRACTION DATA ===
{json.dumps(extraction_result, indent=2)}

=== DIAGNOSIS DATA ===
{json.dumps(diagnosis_result, indent=2)}

=== RISK DATA ===
{json.dumps(report.get('risk', {}), indent=2)}

=== EXECUTION GUARDRAILS ===
{json.dumps(execution_result, indent=2)}

Generate 3-5 COMMITMENTS (not decisions) with:
1. Identity Block
2. Context Intro
3. Each commitment must have A/B options with MARKET DEFAULT
4. Include STATE SHIFT SUMMARY showing before/after states
5. No advice. Real trade-offs only."""

            decision_result = await generate_section_with_retry(
                DECISION_INTELLIGENCE_PROMPT, 
                decision_input, 
                "decision_intelligence",
                extraction_data=extraction_result
            )
            report["decisions"] = decision_result
        
        # Store immutable report in reports collection
        report_id = str(uuid.uuid4())
        report_doc = {
            "report_id": report_id,
            "user_id": session.get("user_id"),
            "session_id": session_id,
            "tier": tier,
            "report_snapshot": report,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "prompt_versions": PROMPT_VERSIONS
        }
        await db.reports.insert_one(report_doc)
        
        # Mark assembly as ready for UI finalization
        await db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": "completed",
                "assembly_state": "ready_for_ui_finalize",
                "report": report,
                "report_id": report_id,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        logger.info(f"Analysis completed for session {session_id}, report_id: {report_id}")
        
    except Exception as e:
        logger.error(f"Analysis pipeline error: {e}")
        await db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": "failed",
                "error": str(e),
                "failed_at": datetime.now(timezone.utc).isoformat()
            }}
        )

@api_router.get("/report/{session_id}/progress")
async def get_report_progress(session_id: str):
    """Get real-time analysis progress for frontend polling"""
    session = await db.sessions.find_one(
        {"session_id": session_id}, 
        {"_id": 0, "current_step": 1, "assembly_state": 1, "status": 1, "error": 1}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    status = session.get("status", "unknown")
    current_step = session.get("current_step", 0)
    assembly_state = session.get("assembly_state", "not_started")
    
    # Calculate progress percentage based on current_step
    # Steps 1-4: each step = 20% when complete (0-80%)
    # Step 5: caps at 80% until assembly_state = 'ready_for_ui_finalize'
    if status == "completed" and assembly_state == "ready_for_ui_finalize":
        progress_percent = 100
    elif current_step >= 5:
        # Step 5 (assembly phase) - cap at 80% until ready
        progress_percent = 80
    elif current_step > 0:
        # Steps 1-4: each completed step adds 20%
        progress_percent = (current_step - 1) * 20 + 10  # +10 for "in progress"
    else:
        progress_percent = 0
    
    return {
        "status": status,
        "current_step": current_step,
        "assembly_state": assembly_state,
        "progress_percent": progress_percent,
        "error": session.get("error") if status == "failed" else None
    }


@api_router.get("/report/{session_id}")
async def get_report(session_id: str):
    """Get analysis report"""
    session = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    status = session.get("status", "unknown")
    
    if status == "processing":
        return {"status": "processing", "message": "Analysis in progress. Please wait."}
    
    if status == "failed":
        return {"status": "failed", "error": session.get("error", "Unknown error")}
    
    if status == "completed":
        return {
            "status": "completed",
            "tier": session.get("tier"),
            "target_role": session.get("target_role"),
            "full_name": session.get("full_name"),
            "current_role": session.get("current_role"),
            "linkedin_provided": session.get("linkedin_provided", False),
            "report": session.get("report"),
            "closing_section": CLOSING_SECTION,  # v3.1 - Always include closing
            "created_at": session.get("created_at"),
            "completed_at": session.get("completed_at")
        }
    
    return {"status": status, "message": "Session exists but analysis not started"}

@api_router.post("/upgrade")
async def upgrade_tier(upgrade: UpgradeRequest):
    """Upgrade to higher tier (reuses existing extraction)"""
    session = await db.sessions.find_one({"session_id": upgrade.session_id}, {"_id": 0})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    current_tier = session.get("tier", 0)
    
    if upgrade.new_tier <= current_tier:
        raise HTTPException(status_code=400, detail="New tier must be higher than current tier")
    
    if upgrade.new_tier not in [2999, 4498]:
        raise HTTPException(status_code=400, detail="Invalid upgrade tier")
    
    upgrade_amount = upgrade.new_tier - current_tier
    
    razorpay_order = razorpay_client.order.create({
        "amount": upgrade_amount * 100,
        "currency": "INR",
        "payment_capture": 1,
        "notes": {
            "session_id": upgrade.session_id,
            "tier": upgrade.new_tier,
            "upgrade_from": current_tier
        }
    })
    
    await db.sessions.update_one(
        {"session_id": upgrade.session_id},
        {"$set": {
            "upgrade_order_id": razorpay_order["id"],
            "pending_upgrade_tier": upgrade.new_tier
        }}
    )
    
    return {
        "order_id": razorpay_order["id"],
        "amount": upgrade_amount * 100,
        "currency": "INR",
        "upgrade_from": current_tier,
        "upgrade_to": upgrade.new_tier
    }

@api_router.post("/verify-upgrade")
async def verify_upgrade(payment: PaymentVerify, background_tasks: BackgroundTasks):
    """Verify upgrade payment and run additional prompts"""
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payment.razorpay_order_id,
            'razorpay_payment_id': payment.razorpay_payment_id,
            'razorpay_signature': payment.razorpay_signature
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    session = await db.sessions.find_one({"session_id": payment.session_id}, {"_id": 0})
    new_tier = session.get("pending_upgrade_tier")
    
    await db.sessions.update_one(
        {"session_id": payment.session_id},
        {"$set": {
            "tier": new_tier,
            "status": "processing",
            "upgrade_payment_id": payment.razorpay_payment_id
        },
        "$unset": {"pending_upgrade_tier": ""}}
    )
    
    background_tasks.add_task(run_upgrade_pipeline, payment.session_id, new_tier)
    
    return {"status": "success", "message": "Upgrade verified. Generating additional intelligence."}

async def run_upgrade_pipeline(session_id: str, new_tier: int):
    """Run only new prompts for upgraded tier (reuses existing extraction data)"""
    try:
        session = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
        
        extraction_result = session.get("extraction_json", {})
        report = session.get("report", {})
        target_role = session.get("target_role", "")
        diagnosis_result = report.get("diagnosis", {})
        
        # Run Risk if upgrading to 2999+
        if new_tier >= 2999 and "risk" not in report:
            risk_input = f"""TARGET ROLE: {target_role}

=== STRUCTURED EXTRACTION DATA ===
{json.dumps(extraction_result, indent=2)}

=== DIAGNOSIS DATA ===
{json.dumps(diagnosis_result, indent=2)}

Generate MINIMUM 4 independent risks from DIFFERENT signal classes."""

            risk_result = await generate_section_with_retry(
                RISK_PROMPT, 
                risk_input, 
                "risk",
                extraction_data=extraction_result
            )
            report["risk"] = risk_result
        
        # Run Execution + Decisions if upgrading to 4498
        if new_tier >= 4498:
            if "execution" not in report:
                execution_input = f"""TARGET ROLE: {target_role}

=== STRUCTURED EXTRACTION DATA ===
{json.dumps(extraction_result, indent=2)}

=== DIAGNOSIS DATA ===
{json.dumps(diagnosis_result, indent=2)}

=== RISK DATA ===
{json.dumps(report.get('risk', {}), indent=2)}

Generate guardrails for EACH signal class."""

                execution_result = await generate_section_with_retry(
                    EXECUTION_GUARDRAILS_PROMPT, 
                    execution_input, 
                    "execution_guardrails",
                    extraction_data=extraction_result
                )
                report["execution"] = execution_result
            
            if "decisions" not in report:
                decision_input = f"""TARGET ROLE: {target_role}

=== STRUCTURED EXTRACTION DATA ===
{json.dumps(extraction_result, indent=2)}

=== DIAGNOSIS DATA ===
{json.dumps(diagnosis_result, indent=2)}

=== RISK DATA ===
{json.dumps(report.get('risk', {}), indent=2)}

=== EXECUTION GUARDRAILS ===
{json.dumps(report.get('execution', {}), indent=2)}

Generate 3-5 FORCED DECISIONS from DIFFERENT signal conflicts."""

                decision_result = await generate_section_with_retry(
                    DECISION_INTELLIGENCE_PROMPT, 
                    decision_input, 
                    "decision_intelligence",
                    extraction_data=extraction_result
                )
                report["decisions"] = decision_result
        
        report["metadata"]["upgraded_at"] = datetime.now(timezone.utc).isoformat()
        report["metadata"]["tier"] = new_tier
        
        await db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": "completed",
                "report": report
            }}
        )
        
    except Exception as e:
        logger.error(f"Upgrade pipeline error: {e}")
        await db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )

@api_router.post("/send-report")
async def send_report_email(request: EmailReportRequest):
    """Generate PDF and send via email"""
    session = await db.sessions.find_one({"session_id": request.session_id}, {"_id": 0})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Report not ready yet")
    
    report = session.get("report", {})
    
    pdf_content = generate_pdf_report(report, session)
    
    success = await send_email_with_pdf(request.email, pdf_content, session)
    
    if success:
        return {"status": "success", "message": f"Report sent to {request.email}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")

@api_router.get("/session/{session_id}")
async def get_session_status(session_id: str):
    """Get session status"""
    session = await db.sessions.find_one({"session_id": session_id}, {"_id": 0, "resume_text": 0, "linkedin_text": 0})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "status": session.get("status", "unknown"),
        "tier": session.get("tier"),
        "payment_status": session.get("payment_status"),
        "target_role": session.get("target_role"),
        "created_at": session.get("created_at")
    }

@api_router.get("/razorpay-key")
async def get_razorpay_key():
    """Get Razorpay public key for frontend"""
    return {"key_id": os.environ.get('RAZORPAY_KEY_ID')}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
