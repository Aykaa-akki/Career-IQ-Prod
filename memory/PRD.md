# CareerIQ - Product Requirements Document

## Overview
CareerIQ is a premium SaaS backend service that provides career decision intelligence by analyzing users' resumes and target roles to deliver actionable insights.

## Live Production URL
- **Domain**: https://career-iq.aykaa.me
- **Admin Dashboard**: https://career-iq.aykaa.me/admin (Password: Akki#2810)
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
- Admin dashboard protected with password

## Integrations
- **OpenAI**: For AI analysis (LIVE)
- **Razorpay**: Payment processing (LIVE with production keys)
- **SendGrid**: Email delivery (LIVE)
- **Google Tag Manager**: Analytics (GTM-MM9GFGPN)
- **UptimeRobot**: Backend monitoring

## Pages & Routes
1. `/` - Landing Page (with sticky mobile CTA) - Version: CQLPV-1
2. `/checkout` - Order/Checkout Page (with testimonial carousel, instant checkout)
3. `/Intelligence_report_generation/:sessionId` - Processing screen
4. `/Intelligence_report_verdict/:sessionId` - Report display page
5. `/privacy-policy` - Privacy Policy
6. `/terms-of-use` - Terms of Use
7. `/admin` - Admin Dashboard (password protected)

## What's Been Implemented

### Session: Feb 16, 2026
- **Admin Dashboard**: Full analytics dashboard with:
  - Metrics cards (Total Leads, Paid Users, Revenue, Conversion Rate)
  - Funnel visualization (Uploaded → Payment Init → Paid → Reports)
  - UTM Performance breakdown by ad source
  - Leads table with all columns (Date, Phone, Target Role, Status, Lead Type, Resume/LinkedIn/Report links, UTM Source, LP Version)
  - Filters (Status, UTM Source, Search)
  - CSV export
  - Auto-refresh every 30 seconds
  - Password protection (Akki#2810)
  - New/Repeat lead detection based on phone number
- **Landing Page Version Tracking**: LP version now tracked in database for A/B testing
- **Trust Indicators**: Added "100% Refund Guarantee" badge and payment method icons
- **Instant Checkout Optimization**: Razorpay loads in <1 second
- **Keep-alive Background Task**: Prevents Railway cold starts

### Session: Feb 15, 2026
- **Testimonial Carousel on Order Page**: Auto-rotating carousel with 6 testimonials
- **File Upload Bug Fixes**: Fixed re-upload issues and validation messages
- **Backend Health Check Improvements**: Increased timeout to 300s, max retries to 5

### Previous Sessions
- Full application deployment to Railway
- Custom domain setup (career-iq.aykaa.me)
- Extensive landing page overhaul (hero, "Why 80% Get Rejected", "What Recruiters Evaluate")
- Sticky CTA for mobile
- Legal pages (Privacy Policy, Terms of Use)
- SEO meta tags and Open Graph
- Google Tag Manager integration with AddToCart event

## Database Schema
- **sessions**: `{ session_id, status, tier, report, mobile_number, target_role, resume_text, linkedin_text, payment_status, razorpay_payment_id, utm_tracking, lp_version, created_at, completed_at, ... }`

## Key Files
- `/app/frontend/src/pages/AdminDashboard.jsx` - Admin dashboard
- `/app/frontend/src/pages/OrderPage.jsx` - Order page with instant checkout
- `/app/frontend/src/pages/LandingPage.jsx` - Landing page (CQLPV-1)
- `/app/frontend/src/utils/utm.js` - UTM and LP version tracking
- `/app/backend/server.py` - Main backend API with admin endpoints

## Future Tasks (Backlog)

### P0 (High Priority)
- ✅ Admin Dashboard - COMPLETED
- Create new landing page variant (CQLPV-2) for A/B testing

### P1 (Medium Priority)
- Improve PDF report design
- WhatsApp integration for report delivery

### P2 (Lower Priority)
- Data expiry job (auto-delete after 30 days)
- Refactor LandingPage.jsx into smaller components

## How to Create New Landing Page Version

1. **Duplicate LandingPage.jsx** to a new file (e.g., `LandingPageV2.jsx`)
2. **Update the LP_VERSION constant** at the top:
   ```javascript
   const LP_VERSION = "CQLPV-2";  // Change this for each new version
   ```
3. **Add route in App.js**:
   ```javascript
   <Route path="/v2" element={<LandingPageV2 />} />
   ```
4. **Deploy** - Data will automatically be tracked with the new LP version
5. **View in Admin Dashboard** - Filter by LP Version to compare performance

## Technical Notes
- Frontend: React, React Router, Tailwind CSS, Framer Motion, Embla Carousel
- Backend: FastAPI with async MongoDB (Motor)
- Deployment: Railway CI/CD via GitHub (auto-deploy on push to main)
- Admin Password stored in: Environment variable ADMIN_PASSWORD (default: Akki#2810)
- The app is LIVE with real payments - test thoroughly before deploying
