# CareerIQ - Product Requirements Document

## Overview
CareerIQ is a premium SaaS backend service that provides career decision intelligence by analyzing users' resumes and target roles to deliver actionable insights.

## Live Production URL
- **Domain**: https://career-iq.aykaa.me
- **Hosted on**: Railway
- **Database**: MongoDB Atlas

## Core Features

### Input
- Resume file upload (PDF/DOCX)
- LinkedIn PDF upload (optional)
- Target role string
- Mobile number for report delivery

### Pipeline
- Multi-stage LLM analysis (v3.0)
- Tiered pricing at ₹2,999
- Quality auditing

### Authentication
- No user login required
- Reports accessed via unique session links

## Integrations
- **OpenAI**: For AI analysis (LIVE)
- **Razorpay**: Payment processing (LIVE with production keys)
- **SendGrid**: Email delivery (LIVE)
- **Google Tag Manager**: Analytics (GTM-MM9GFGPN)

## Pages & Routes
1. `/` - Landing Page (with sticky mobile CTA)
2. `/order` - Order/Checkout Page (with testimonial carousel)
3. `/Intelligence_report_generation/:sessionId` - Processing screen
4. `/report/:sessionId` - Report display page
5. `/privacy` - Privacy Policy
6. `/terms` - Terms of Use

## What's Been Implemented

### Session: Feb 13, 2026
- **Testimonial Carousel on Order Page**: Added auto-rotating carousel with 6 testimonials
  - 3 Rate-style testimonials (Mrinal Malhotra, Sonali Thankur, Rhoit Sharma)
  - 3 WhatsApp feedback screenshots
  - Features: Auto-rotate (4s), swipe on mobile, navigation arrows, dot indicators
  - Placed between "What You'll Get" and "Secure & Confidential" sections

### Previous Sessions
- Full application deployment to Railway
- Custom domain setup (career-iq.aykaa.me)
- Extensive landing page overhaul (hero, "Why 80% Get Rejected", "What Recruiters Evaluate")
- Sticky CTA for mobile
- Legal pages (Privacy Policy, Terms of Use)
- SEO meta tags and Open Graph
- Google Tag Manager integration with AddToCart event
- Duplicate Meta Pixel fix guidance

## Database Schema
- **sessions**: `{ session_id, status, tier, report, utm_source, utm_medium, utm_campaign, utm_adset, utm_adcreative, ... }`

## Key Files
- `/app/frontend/src/pages/OrderPage.jsx` - Order page with testimonial carousel
- `/app/frontend/src/pages/LandingPage.jsx` - Main landing page (2000+ lines, needs refactoring)
- `/app/frontend/public/index.html` - SEO meta tags
- `/app/backend/server.py` - Main backend API

## Future Tasks (Backlog)

### P0 (High Priority)
- Admin Dashboard for tracking leads, conversions, revenue, UTM data

### P1 (Medium Priority)
- Improve PDF report design
- WhatsApp integration for report delivery

### P2 (Lower Priority)
- Data expiry job (auto-delete after 30 days)
- Refactor LandingPage.jsx into smaller components

## Technical Notes
- Frontend: React, React Router, Tailwind CSS, Framer Motion, Embla Carousel
- Backend: FastAPI
- Deployment: Railway CI/CD via GitHub
- The app is LIVE with real payments - test thoroughly before deploying
