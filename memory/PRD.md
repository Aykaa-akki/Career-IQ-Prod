# CareerIQ - Product Requirements Document

## Original Problem Statement
Build CareerIQ - a fully automated, multi-layer career DECISION INTELLIGENCE system. NOT a content generator, NOT a resume service, NOT a coaching product. It outputs INTELLIGENCE, not advice. Forces DECISIONS, not actions.

## Architecture Overview
- **Frontend**: React + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **LLM**: OpenAI GPT-4o
- **Payments**: Razorpay
- **Email**: SendGrid with PDF attachments

## User Flow (v3.3)
```
Landing Page → Checkout (2-column) → Payment → Processing → Report
```

## Checkout Page Design (v3.2)

### Layout
- **Desktop**: 2-column (Form left, Value right)
- **Mobile**: Stacks Form → Value (CTA visible in first fold)

### Form Fields (In Order)
1. Mobile Number (country code selector, +91 default, E.164 format)
2. Target Role
3. Resume Upload (required)
4. LinkedIn Upload (optional)
5. CTA: "Get My Career Intelligence Report"
6. Consent Checkbox (auto-ticked, mandatory)

### Single Price: ₹2,999

## Processing Page Design (v3.3)

### Layout
- **Headline**: "Generating Your Career Intelligence Report"
- **Subheadline**: "This usually takes 2–3 minutes. Please don't refresh."
- **Progress Bar**: Horizontal, starts at ~6%, smooth non-linear movement, NO percentage
- **Rotating Status Text**: Below progress bar, cycles every 6 seconds
- **5 Fixed Intelligence Steps**: Sequential with idle/processing/completed states

### Fixed Intelligence Steps (Exact Wording)
1. Validating document integrity
2. Extracting multi-signal patterns
3. Mapping market interpretation signals
4. Identifying role-level risks & constraints
5. Assembling decision intelligence

### Rotating Status Texts
- "Evaluating market interpretation signals"
- "Synthesizing role-level perception patterns"
- "Identifying risk and down-leveling indicators"
- "Applying execution guardrails"
- "Finalizing decision intelligence"

### Animation Rules
- Progress Bar: Non-linear, never resets, never jumps back
- Steps: Idle (dimmed) → Processing (spinner) → Completed (green tick)
- ONE step processes at a time
- 3-second pause after Step 5 completes before redirect

### Backend-Driven Progress (v3.4 - Implemented)
- Backend tracks `current_step` (1-5) and `assembly_state` ('not_started', 'in_progress', 'ready_for_ui_finalize')
- Frontend polls `/api/report/{session_id}/progress` every 2 seconds
- UI state derives ONLY from backend response, no frontend timers for step transitions

### DUAL-PROGRESS SYSTEM (v3.5 - Implemented)

**1. Horizontal Progress Bar (Backend-Driven - Authoritative):**
- Represents total completion across 5 steps
- Each completed step = +20%
- STEP-DRIVEN, not time-driven
- Never resets, never moves backward
- Progress mapping:
  - Step 1 in progress: 0%
  - Step 2 in progress: 20%
  - Step 3 in progress: 40%
  - Step 4 in progress: 60%
  - Step 5 in progress: HOLD at 80%
  - After `assembly_state='ready_for_ui_finalize'`: animate 80%→100%→redirect

**2. Circular Progress Indicator (Time-Based - Perceptual):**
- Shows live processing inside currently active step
- Only ONE circular indicator active at a time
- Animates 0→100 over estimated step duration (perceptual, not backend-derived)
- SVG with gradient (primary #6366f1 → cyan #06b6d4)
- Once complete: replaced with ✓ tick
- Completed steps NEVER animate again

**Step States:**
- Idle: Small dot (dimmed)
- Processing: Circular progress visible with percentage
- Completed: ✓ tick only (no circle, no percentage)

**Step 5 Finalization Buffer:**
1. When `current_step == 5`: circular animates, horizontal bar stays at 80%
2. Wait for `assembly_state: "ready_for_ui_finalize"`
3. Hold UI for ~3 seconds
4. Complete Step 5 (show ✓ tick)
5. Animate horizontal bar 80%→100%
6. Immediate redirect to report page

### Strict DO-NOT Rules
- ❌ No fake progress bars / spinners / bouncing loaders
- ❌ No replaying animations
- ❌ No "AI is thinking", "Almost done", "LLM" text
- ❌ No motivational language
- ✅ Calm, deliberate, premium tone

## What's Been Implemented

### v3.7 Update (Jan 2026) - Section-by-Section Homepage Redesign
- [x] **Section 1 (Hero)**: "Stop Getting Silently Rejected" + Responsive Career Signal Flow SVG (desktop horizontal, mobile vertical)
- [x] **Section 2 (Core Pain)**: "What Recruiters Evaluate — But Never Explain" + Floating Signal Badges + 5 signal items + punchline
- [x] **Section 3 (Decision Gravity)**: "What Recruiters Decide Before Shortlisting" - CONVERGENCE VISUAL
  - **Visual Structure**: Signal cards (inputs) → Connection lines → Silent Decision card (hidden judgment) → Lock (sealed)
  - **Desktop Layout**: 3 signal cards on LEFT (stacked), connection lines converging RIGHT, Silent Decision card right-of-center
  - **Mobile Layout**: Signals stacked at TOP, lines animate downward, Silent Decision card centered below
  - **Signal Cards**: "Senior enough?" (green), "Signals match role?" (yellow), "Safe decision?" (red) - with glowing dots
  - **Silent Decision Card**: Dark, slightly elevated, "SILENT DECISION" label, large prominent lock icon below
  - **Animation Sequence** (one-time on scroll):
    1. Signal cards fade in (staggered)
    2. Connection lines draw toward Silent Decision
    3. Silent Decision card pulses once
    4. 300-500ms pause
    5. Lock icon appears ON the card (large, prominent)
    6. Everything static: card dims, lines fade
  - No CTA, no AI wording, no metrics, no hover effects
  - User feeling: "My profile was judged behind the scenes, and I never saw how"
- [x] **Section 4 (Clarity/Relief)**: "The Part Nobody Shows You — Now Visible"
  - **Purpose**: First relief moment after pressure, introduce product value + main CTA
  - **Background**: Lighter dark (#0d0d14) - charcoal/soft dark grey - contrast shift from Section 3
  - **Layout**: Two-column (desktop: Visual left, Text right) / Stacked (mobile: Headline→Subhead→Visual→Items→CTA)
  - **Visual**: "Career Intelligence Report" preview card (product-like, inspired by reference image):
    - Purple gradient header with title + "Your Name · Target Role" (natural placeholder)
    - 3 section cards: Career Diagnosis, Risk Assessment, Recommendations (with gradient icons)
    - "Full report available 🔓" footer with open lock icon + gradient bg
    - Soft glow, brighter than background
  - **Report Items** (strong title + softer description):
    1. Career Verdict
    2. Risk Signals
    3. Role Mismatch
    4. Execution Guardrails
    5. Decision Summary
  - **Mobile optimizations**: 92% card width, extra item spacing, full-width CTA (min 48px), fade-in only
  - **Copy**: Micro-reassurance + Emotional payoff ("For the first time...")
  - **CTA**: "Check Why I'm Not Getting Shortlisted" + "One-time report • ₹2,999 • No subscriptions"
- [x] **Section 5 (How It Works)**: "How CareerIQ Works" - Trust builder section
  - **Purpose**: Remove trust friction, address "How are you doing this? Can I trust it?"
  - **Background**: Dark charcoal (#0a0a0f) - slightly lighter than Section 3 for emotional relief
  - **Layout**: Single centered column, max 720-760px width, vertical flow only
  - **Copy (exact)**: 4 steps with specific wording, no rewrites allowed
    1. "You share your profile" - Upload resume, LinkedIn, target role. No calls. No long forms.
    2. "Recruiter-grade evaluation is applied" - Decision framework refined by senior recruiters. Not keyword matching. Not formatting advice.
    3. "Market interpretation happens" - Experience/positioning/narrative assessed together + 3 hiring manager questions
    4. "You receive a clear career intelligence report" - See how profile is being read. No advice. No templates. Just clarity.
  - **Reassurance Line**: "One-time report • No subscriptions • No upsells"
  - **Animation**: Subtle fade-in on scroll only
  - **CRO Rules**: No CTA buttons, no AI/tech jargon, no urgency language
  - **Mobile**: 90-94% width, ~1.3 scroll lengths, 20-25px headline, 14px body
  - **Visual Enhancement**: 3 distinct zones with color coding - Green (You), Purple (Our Intelligence System), Amber (You Receive)
- [x] **Removed "What You'll See in Your Report" section** - Content integrated into Section 4
- [x] **Section 6 (Closing)**: Decision-closing section - ONE unified close
  - **Purpose**: Reduce hesitation, reinforce value, ask for action. User mindset: "I don't want to make the wrong career move."
  - **Merged**: Combined Sample Insight + Pricing + Final CTA into ONE section (per CRO best practices)
  - **Background**: Dark charcoal (#0a0a0f) - calm and conclusive
  - **Layout**: Centered single column, max 680px width
  - **Section Order (strict)**:
    1. Headline: "If you've been second-guessing your next career move, this gives you clarity before you act."
    2. Sample Insight: Quote-style card with "Sample" badge (proof of depth)
    3. Pricing: "Complete Career Intelligence Report" + ₹2,999
    4. 3 High-impact value lines (bold, scannable):
       - Know why you're not getting shortlisted — before applying again
       - See how recruiters are *actually reading* your profile
       - Make your next career move with clarity, not guesswork
    5. Primary CTA: "Check Why I'm Not Getting Shortlisted →"
    6. Micro-reassurance: "One-time report • Instant access • No subscriptions"
  - **CRO Rules**: No testimonials, no urgency, no discounts, no extra CTAs, no content after CTA
  - **Mobile**: Full-width CTA (≥48px), 92-94% content width, ~1.5 scrolls
  - **Animation**: Optional subtle fade-in only (no animations on pricing/CTA)
- [x] **Footer**: Disclaimer + Privacy/Terms/Support links + Copyright

### v3.6 Update (Jan 2026) - Initial Homepage Redesign
- [x] **Why CareerIQ Exists**: "The Part Nobody Shows You" + Lens/X-Ray SVG
- [x] **What You Get**: 5 accordion items + Report Blueprint SVG
- [x] **How It Works**: 3-step timeline SVG
- [x] **Sample Insight**: Quote callout card
- [x] **Pricing**: ₹2,999 with decision confidence icons
- [x] **Final CTA**: "clarity before you act" message
- [x] **Footer**: Disclaimer + Privacy/Terms/Support links
- [x] **All SVG illustrations**: Abstract, no stock photos/people
- [x] **Mobile-first responsive design**: Tested at 390px
- [x] **All 37 frontend tests passed**

### v3.5 Update (Jan 2026) - Dual-Progress System
- [x] **Horizontal bar**: Backend-driven, 20% per completed step, holds at 80% during Step 5
- [x] **Circular indicator**: Time-based perceptual animation for active step only
- [x] **CircularProgress component**: SVG with gradient (#6366f1 → #06b6d4)
- [x] **Step state logic**: Idle (dot) → Processing (circular) → Completed (✓ tick)
- [x] **Finalization sequence**: 3s pause → tick → 80%→100% → redirect
- [x] **All 23 tests passed**: Backend + Frontend integration verified

### v3.4 Update (Jan 2026) - Backend-Driven Progress
- [x] **New `/api/report/{session_id}/progress` endpoint** - Returns real-time progress data
- [x] **Backend progress tracking** - `current_step` and `assembly_state` updated at each pipeline stage
- [x] **Frontend polling** - ProcessingPage polls backend every 2 seconds
- [x] **Removed timer-based step transitions** - Step states now derived from backend

### v3.3 Update - Processing Page Optimization
- [x] **Headline/Subheadline** - Per spec
- [x] **Progress Bar** - Horizontal, non-linear, shows percentage
- [x] **Rotating Status Text** - 5 analytical texts, 5-second cycle
- [x] **5 Fixed Intelligence Steps** - Exact wording from spec
- [x] **Step States** - Idle (dimmed), Processing (spinner), Completed (green tick)
- [x] **Sequential Progression** - One step at a time
- [x] **3-Second Pause** - After completion before redirect
- [x] **Mobile Optimized** - 100% responsive, no text overflow
- [x] **No Motivational Language** - Process-oriented only

### v3.2 Features - Checkout Optimization
- [x] 2-column layout (Form + Value)
- [x] Single price ₹2,999
- [x] Country code selector
- [x] Reordered fields
- [x] Trust section

### Core Features
- [x] Complete LLM intelligence pipeline
- [x] File upload (PDF/DOCX)
- [x] Razorpay payments
- [x] SendGrid email with PDF
- [x] MongoDB sessions
- [x] Quality auditor

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload files |
| `/api/create-order` | POST | Create Razorpay order |
| `/api/verify-payment` | POST | Verify payment |
| `/api/analyze` | POST | Start analysis |
| `/api/report/{session_id}/progress` | GET | **NEW** - Real-time progress for frontend polling |
| `/api/report/{session_id}` | GET | Get report |
| `/api/send-report` | POST | Email PDF |

## Prioritized Backlog

### P0 - COMPLETED
- [x] v3.3 Processing Page Optimization
- [x] v3.4 Backend-Driven Progress (Fixed "dead zone" bug)
- [x] v3.5 Dual-Progress System (Horizontal bar + Circular indicator per spec)
- [x] v3.6/v3.7 Homepage Redesign - Sections 1, 2, 3, 4, 5, 6 (Closing) complete
- [x] **Section 5: "How CareerIQ Works"** - Implemented with 3-zone visual design (Jan 2026)
- [x] **Section 6: Closing Section** - Unified decision-closing section (Jan 2026)
- [x] **Landing Page Complete** - All sections implemented per spec
- [x] **Order Page Redesign** - Visual hierarchy improvements (Jan 2026)
  - Page loads from top
  - Prominent white CTA button with glow
  - Clear left/right column separation with card borders
  - Target role placeholder: "e.g. Marketing Head or Product Manager"
  - Consent checkbox moved above CTA
  - Improved form field styling and contrast
- [x] **Google Tag Manager Integration** - GTM-MM9GFGPN installed (Jan 2026)
- [x] **UTM Parameter Tracking** - Full attribution tracking system (Jan 2026)
  - Captures: utm_source, utm_medium, utm_campaign, utm_adset, utm_adcreative
  - Persists in localStorage across navigation
  - Sent to backend with upload, order creation, and payment verification
  - Stored in MongoDB with session data
  - Compatible with Facebook Ads, GA4, and internal reporting
- [x] **V3.1 Prompt & Logic Overhaul** - Major backend intelligence upgrade (Jan 2026)
  - **Recruiter Heuristics Engine**: Pattern shortcuts (title inflation, ownership signals, seniority heuristics)
  - **10-Second Scan Simulation**: What recruiters notice, ignore, and hesitate at
  - **3 Commitments Max**: Enforced limit for decisiveness
  - **Internal Confidence Scoring**: Surface only "reduced due to missing X"
  - **Closing Section**: "What This Really Means for You" (exact copy, no modifications)
  - **Tier Pricing Updated**: ₹4,999 → ₹4,498 (₹2,999 + ₹1,499 upsell)
  - **New Upsell Section**: Premium v3.1 design with "What becomes clear immediately" list
- [x] **Report Page Upsell Reverted to Simple Design** (Jan 2026)
  - User requested simpler design over the complex "What becomes clear immediately" list
  - Simple card with lock icon, "Unlock Complete Intelligence" heading
  - Description: "Get execution guardrails, commitments with market defaults, and state shift summary"
  - CTA: "Upgrade — ₹1,499 more" button
  - Verified on desktop (1920px) and mobile (375px)

### P0 - COMPLETED
- [x] V3.1 Prompt & Logic Overhaul
- [x] Report Page Upsell Section - Reverted to simple design with ₹1,499 price (Jan 2026)
- [x] **Full E2E Test of V3.0 Flow** - 100% pass rate (Jan 2026)
  - Backend: 26/26 tests passed
  - Frontend: All UI elements verified
  - UTM tracking working
  - All integrations REAL (OpenAI, Razorpay, SendGrid)

### P1 (High Priority)
- [ ] **Admin Panel** - Dashboard, tables, CSV/JSON export (deferred to next release)
- [ ] WhatsApp report delivery

### P2 (Medium Priority)
- [ ] PDF report design improvements
- [ ] Rate limiting
- [ ] 30-day lead/data expiry background job
- [ ] Analytics dashboard for funnel metrics

## Files of Reference
- /app/frontend/src/pages/ProcessingPage.jsx - Optimized processing page
- /app/frontend/src/pages/OrderPage.jsx - 2-column checkout
- /app/frontend/src/pages/LandingPage.jsx - Single price landing
- /app/frontend/src/pages/ReportPage.jsx - Report display with v3.1 upsell & closing section
- /app/backend/server.py - Backend API with v3.1 prompts
