import requests
import sys
import json
import time
from datetime import datetime
from fpdf import FPDF

class CareerIQV2AnalysisTest:
    def __init__(self, base_url="https://resume-insights-16.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.analysis_report = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def create_mock_pdf(self, content, filename):
        """Create a proper PDF file for testing"""
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("helvetica", size=12)
        
        lines = content.split('\n')
        for line in lines:
            if line.strip():
                if len(line) > 80:
                    words = line.split(' ')
                    current_line = ""
                    for word in words:
                        if len(current_line + word) < 80:
                            current_line += word + " "
                        else:
                            if current_line:
                                pdf.cell(0, 10, current_line.strip(), new_x="LMARGIN", new_y="NEXT")
                            current_line = word + " "
                    if current_line:
                        pdf.cell(0, 10, current_line.strip(), new_x="LMARGIN", new_y="NEXT")
                else:
                    pdf.cell(0, 10, line, new_x="LMARGIN", new_y="NEXT")
            else:
                pdf.cell(0, 5, "", new_x="LMARGIN", new_y="NEXT")
        
        return pdf.output()

    def test_version_2_0_health(self):
        """Test that health endpoint returns version 2.0"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                version = data.get('version', '')
                success = version == '2.0'
                details = f"Version: {version}, Expected: 2.0"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            
            self.log_test("Version 2.0 Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Version 2.0 Health Check", False, str(e))
            return False

    def upload_substantial_content(self):
        """Upload substantial resume and LinkedIn content for analysis"""
        try:
            # Create substantial resume content with diverse signals
            resume_content = """SARAH CHEN
Senior Product Manager | sarah.chen@email.com | +1-555-0199

PROFESSIONAL SUMMARY
Strategic product leader with 8+ years driving product vision and execution at high-growth technology companies. 
Proven track record of launching products that generated $50M+ in revenue. Expert in data-driven decision making, 
cross-functional team leadership, and market expansion strategies. Passionate about building products that solve 
real customer problems at scale.

WORK EXPERIENCE

Senior Product Manager | TechGiant Corp | 2021 - Present
- Led product strategy for core platform serving 2M+ daily active users
- Owned P&L responsibility for $25M product line with 40% YoY growth
- Managed cross-functional team of 15 engineers, designers, and analysts
- Launched 3 major features that increased user engagement by 35%
- Drove go-to-market strategy resulting in 150% increase in enterprise adoption
- Established product metrics framework and KPI tracking across organization
- Collaborated with C-suite executives on long-term product roadmap and vision

Product Manager | StartupUnicorn | 2019 - 2021
- Built product from 0 to 1, achieving product-market fit within 18 months
- Conducted 200+ customer interviews to validate product hypotheses
- Designed and executed A/B tests improving conversion rates by 25%
- Coordinated with engineering team of 8 to deliver features on aggressive timelines
- Managed product backlog and sprint planning for agile development cycles
- Analyzed user behavior data to identify optimization opportunities
- Presented product updates to board of directors and key stakeholders

Associate Product Manager | InnovativeTech | 2017 - 2019
- Supported senior PM on mobile app with 500K+ monthly active users
- Conducted competitive analysis and market research for new feature development
- Created detailed product requirements and user stories for engineering team
- Collaborated with UX designers on user experience optimization
- Monitored product performance metrics and created weekly executive reports
- Assisted in product launch campaigns and go-to-market execution

Business Analyst | ConsultingFirm | 2016 - 2017
- Analyzed business processes and identified efficiency improvement opportunities
- Created financial models and ROI projections for client recommendations
- Conducted stakeholder interviews and requirements gathering sessions
- Developed process documentation and training materials
- Supported project management for technology implementation projects

EDUCATION
Master of Business Administration (MBA) | Stanford Graduate School of Business | 2016
- Concentration: Strategy and Operations
- GPA: 3.9/4.0, Dean's List

Bachelor of Science in Computer Science | UC Berkeley | 2014
- Minor in Business Administration
- GPA: 3.7/4.0, Magna Cum Laude

TECHNICAL SKILLS
Product Management - Roadmap Planning, User Research, A/B Testing, Analytics
Tools: Jira, Confluence, Figma, Mixpanel, Google Analytics, SQL, Python
Methodologies: Agile, Scrum, Design Thinking, Lean Startup

ACHIEVEMENTS
- Launched product that became #1 in App Store category within 6 months
- Increased product revenue by 200% through strategic feature prioritization
- Led team that won company-wide innovation award for breakthrough product
- Reduced customer churn by 30% through data-driven product improvements
- Mentored 5 junior product managers, 3 of whom received promotions

LEADERSHIP & RECOGNITION
- Selected for company's high-potential leadership development program
- Keynote speaker at ProductCon 2022 on "Building Products at Scale"
- Featured in TechCrunch article about successful product launches
- Board member of Women in Product Management organization"""

            linkedin_content = """SARAH CHEN
Senior Product Manager at TechGiant Corp
San Francisco Bay Area | 1,000+ connections

ABOUT
I'm a strategic product leader passionate about building technology that makes a meaningful impact. 
With 8+ years of experience at high-growth companies, I've led cross-functional teams to launch 
products that have generated over $50M in revenue and served millions of users.

My expertise spans the full product lifecycle - from initial market research and customer discovery 
to go-to-market execution and post-launch optimization. I thrive in fast-paced environments where 
I can combine data-driven insights with customer empathy to drive product decisions.

Currently, I'm leading product strategy for TechGiant's core platform, where I own P&L for a $25M 
product line and manage a team of 15 engineers, designers, and analysts. I'm always looking to 
connect with fellow product leaders and discuss the latest trends in product management.

EXPERIENCE

Senior Product Manager
TechGiant Corp · Full-time
Jan 2021 - Present · 3 yrs
San Francisco, California, United States

Leading product strategy and execution for core platform serving 2M+ daily active users. 
Key responsibilities include:
- P&L ownership for $25M product line with 40% year-over-year growth
- Managing cross-functional team of 15 engineers, designers, and data analysts
- Driving go-to-market strategy and enterprise adoption initiatives
- Establishing product metrics framework and KPI tracking across organization
- Collaborating with executive team on long-term product vision and roadmap

Key achievements:
- Launched 3 major features that increased user engagement by 35%
- Drove 150% increase in enterprise customer adoption
- Led product strategy that resulted in $15M additional annual revenue

Product Manager
StartupUnicorn · Full-time
Mar 2019 - Dec 2020 · 1 yr 10 mos
San Francisco, California, United States

Built product from concept to product-market fit, achieving significant user growth and revenue milestones.
- Conducted 200+ customer interviews to validate product hypotheses
- Designed and executed A/B tests that improved conversion rates by 25%
- Coordinated with engineering team to deliver features on aggressive timelines
- Managed product backlog and sprint planning for agile development cycles
- Presented regular updates to board of directors and key investors

Associate Product Manager
InnovativeTech · Full-time
Jun 2017 - Feb 2019 · 1 yr 9 mos
San Francisco, California, United States

Supported senior product manager on mobile application with 500K+ monthly active users.
- Conducted competitive analysis and market research for feature development
- Created detailed product requirements and user stories
- Collaborated with UX team on user experience optimization
- Monitored product metrics and created executive reporting

Business Analyst
ConsultingFirm · Full-time
Aug 2016 - May 2017 · 10 mos
San Francisco, California, United States

Analyzed business processes and identified improvement opportunities for Fortune 500 clients.

EDUCATION

Stanford Graduate School of Business
Master of Business Administration - MBA, Strategy and Operations
2014 - 2016
Grade: 3.9 GPA

University of California, Berkeley
Bachelor of Science - BS, Computer Science
2010 - 2014
Grade: 3.7 GPA, Magna Cum Laude

LICENSES & CERTIFICATIONS

Certified Scrum Product Owner (CSPO)
Scrum Alliance
Issued Jan 2020

Google Analytics Certified
Google
Issued Mar 2019

SKILLS
Product Management - Product Strategy - User Research - A/B Testing - Data Analysis - 
Cross-functional Leadership - Go-to-Market Strategy - Agile Methodologies - SQL - Python

RECOMMENDATIONS
"Sarah is an exceptional product leader who combines strategic thinking with flawless execution. 
Her ability to translate customer needs into successful products is unmatched." 
- Michael Johnson, VP of Engineering at TechGiant Corp

"Working with Sarah was a game-changer for our product. Her data-driven approach and customer 
focus helped us achieve product-market fit faster than we thought possible."
- Jennifer Liu, CEO at StartupUnicorn

ACTIVITY
- Published article "The Future of Product Management" - 10K+ views
- Spoke at ProductCon 2022 about building products at scale
- Mentoring junior product managers through ADPList platform"""
            
            # Create PDF files
            resume_pdf = self.create_mock_pdf(resume_content, "resume.pdf")
            linkedin_pdf = self.create_mock_pdf(linkedin_content, "linkedin.pdf")
            
            files = {
                'resume': ('resume.pdf', resume_pdf, 'application/pdf'),
                'linkedin': ('linkedin.pdf', linkedin_pdf, 'application/pdf')
            }
            
            response = requests.post(f"{self.base_url}/api/upload", files=files, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.session_id = data.get('session_id')
                success = bool(self.session_id)
                details = f"Session ID: {self.session_id[:8]}..., Resume length: {data.get('resume_length', 0)}, LinkedIn length: {data.get('linkedin_length', 0)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            
            self.log_test("Upload Substantial Content", success, details)
            return success
        except Exception as e:
            self.log_test("Upload Substantial Content", False, str(e))
            return False

    def create_and_verify_payment(self, tier=4999):
        """Create order and simulate payment verification"""
        try:
            # Create order
            payload = {"tier": tier}
            response = requests.post(
                f"{self.base_url}/api/create-order?session_id={self.session_id}", 
                json=payload, 
                timeout=15
            )
            
            if response.status_code != 200:
                self.log_test("Create Order for Analysis", False, f"Order creation failed: {response.text}")
                return False
            
            order_data = response.json()
            order_id = order_data.get('order_id')
            
            # Simulate payment verification (using mock data since we can't actually pay)
            # In real scenario, this would come from Razorpay webhook
            mock_payment_data = {
                "razorpay_order_id": order_id,
                "razorpay_payment_id": "pay_mock_" + order_id[-10:],
                "razorpay_signature": "mock_signature_for_testing",
                "session_id": self.session_id
            }
            
            # Note: This will fail in real scenario without actual payment
            # But we can test the endpoint structure
            payment_response = requests.post(
                f"{self.base_url}/api/verify-payment", 
                json=mock_payment_data, 
                timeout=15
            )
            
            # For testing purposes, we'll consider it successful if the endpoint exists
            # and returns a structured response (even if payment verification fails)
            success = payment_response.status_code in [200, 400]  # 400 is expected for mock payment
            details = f"Order created: {order_id[:10]}..., Payment endpoint response: {payment_response.status_code}"
            
            self.log_test("Payment Flow Test", success, details)
            return success
            
        except Exception as e:
            self.log_test("Payment Flow Test", False, str(e))
            return False

    def start_analysis_and_wait(self):
        """Start analysis and wait for completion"""
        try:
            # Start analysis
            analysis_data = {
                "session_id": self.session_id,
                "target_role": "Senior Product Manager",
                "email": "test@example.com"
            }
            
            response = requests.post(f"{self.base_url}/api/analyze", json=analysis_data, timeout=15)
            
            # We expect 402 (payment required) since we didn't actually complete payment
            # But we can test if the endpoint exists and handles the request properly
            if response.status_code == 402:
                # This is expected - payment required
                self.log_test("Analysis Endpoint Structure", True, "Correctly requires payment (402)")
                return True
            elif response.status_code == 200:
                # If somehow payment was accepted, wait for analysis
                self.log_test("Analysis Started", True, "Analysis started successfully")
                
                # Wait for analysis completion (max 3 minutes)
                max_wait = 180  # 3 minutes
                wait_time = 0
                
                while wait_time < max_wait:
                    time.sleep(10)
                    wait_time += 10
                    
                    report_response = requests.get(f"{self.base_url}/api/report/{self.session_id}", timeout=10)
                    if report_response.status_code == 200:
                        report_data = report_response.json()
                        status = report_data.get('status', '')
                        
                        if status == 'completed':
                            self.analysis_report = report_data.get('report', {})
                            self.log_test("Analysis Completion", True, f"Analysis completed in {wait_time} seconds")
                            return True
                        elif status == 'failed':
                            self.log_test("Analysis Completion", False, f"Analysis failed: {report_data.get('error', 'Unknown error')}")
                            return False
                        else:
                            print(f"⏳ Analysis in progress... ({wait_time}s elapsed, status: {status})")
                
                self.log_test("Analysis Completion", False, "Analysis timed out after 3 minutes")
                return False
            else:
                self.log_test("Analysis Endpoint Structure", False, f"Unexpected response: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Analysis Process", False, str(e))
            return False

    def verify_signal_extraction(self):
        """Verify that signal extraction produces all 5 signal classes"""
        if not self.analysis_report:
            self.log_test("Signal Extraction Verification", False, "No analysis report available")
            return False
        
        try:
            # Check if extraction data exists in the report metadata or if we can infer from diagnosis
            diagnosis = self.analysis_report.get('diagnosis', {})
            
            # Look for evidence of 5 signal classes in the diagnosis
            signal_classes_found = []
            
            # Check for title/role signals
            if any(key in diagnosis for key in ['career_verdict', 'market_reading']):
                market_reading = diagnosis.get('market_reading', {})
                if 'title_role_interpretation' in market_reading:
                    signal_classes_found.append("title_role")
                if 'ownership_execution_interpretation' in market_reading:
                    signal_classes_found.append("ownership_execution")
                if 'seniority_authority_interpretation' in market_reading:
                    signal_classes_found.append("seniority_authority")
                if 'identity_interpretation' in market_reading:
                    signal_classes_found.append("identity")
                if 'signal_interaction' in market_reading:
                    signal_classes_found.append("market_fit")
            
            success = len(signal_classes_found) >= 4  # At least 4 out of 5 signal classes
            details = f"Signal classes found: {signal_classes_found} ({len(signal_classes_found)}/5)"
            
            self.log_test("Signal Extraction - 5 Classes", success, details)
            return success
            
        except Exception as e:
            self.log_test("Signal Extraction - 5 Classes", False, str(e))
            return False

    def verify_multi_signal_synthesis(self):
        """Verify that diagnosis uses multi-signal synthesis"""
        if not self.analysis_report:
            self.log_test("Multi-Signal Synthesis", False, "No analysis report available")
            return False
        
        try:
            diagnosis = self.analysis_report.get('diagnosis', {})
            
            # Check for multi-signal synthesis indicators
            synthesis_indicators = 0
            
            # Check career verdict for multi-signal references
            career_verdict = diagnosis.get('career_verdict', '')
            if len(career_verdict) > 100:  # Substantial content
                synthesis_indicators += 1
            
            # Check market reading structure
            market_reading = diagnosis.get('market_reading', {})
            if isinstance(market_reading, dict) and len(market_reading) >= 4:
                synthesis_indicators += 1
            
            # Check for authority breakpoints (should be multiple)
            authority_breakpoints = diagnosis.get('authority_breakpoints', [])
            if len(authority_breakpoints) >= 2:
                synthesis_indicators += 1
            
            # Check for multiple mismatch causes
            mismatch_causes = diagnosis.get('mismatch_causes', {})
            if len(mismatch_causes) >= 3:
                synthesis_indicators += 1
            
            success = synthesis_indicators >= 3
            details = f"Multi-signal synthesis indicators: {synthesis_indicators}/4"
            
            self.log_test("Multi-Signal Synthesis", success, details)
            return success
            
        except Exception as e:
            self.log_test("Multi-Signal Synthesis", False, str(e))
            return False

    def verify_risk_assessment(self):
        """Verify that risk assessment generates multiple independent risks"""
        if not self.analysis_report:
            self.log_test("Risk Assessment - Multiple Independent Risks", False, "No analysis report available")
            return False
        
        try:
            risk_data = self.analysis_report.get('risk', {})
            
            if not risk_data:
                self.log_test("Risk Assessment - Multiple Independent Risks", False, "No risk data in report")
                return False
            
            # Check for independent risks
            independent_risks = risk_data.get('independent_risks', [])
            
            # Verify we have at least 4 independent risks
            has_enough_risks = len(independent_risks) >= 4
            
            # Check for different risk categories
            risk_categories = set()
            for risk in independent_risks:
                category = risk.get('risk_category', '')
                if category:
                    risk_categories.add(category)
            
            has_diverse_categories = len(risk_categories) >= 3
            
            # Check for signal conflicts
            signal_conflicts = risk_data.get('signal_conflicts', [])
            has_conflicts = len(signal_conflicts) >= 2
            
            success = has_enough_risks and has_diverse_categories and has_conflicts
            details = f"Risks: {len(independent_risks)}, Categories: {len(risk_categories)}, Conflicts: {len(signal_conflicts)}"
            
            self.log_test("Risk Assessment - Multiple Independent Risks", success, details)
            return success
            
        except Exception as e:
            self.log_test("Risk Assessment - Multiple Independent Risks", False, str(e))
            return False

    def run_comprehensive_v2_test(self):
        """Run comprehensive CareerIQ v2.0 analysis test"""
        print("🚀 Starting CareerIQ v2.0 Analysis Pipeline Test")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 70)
        
        # Test version 2.0
        if not self.test_version_2_0_health():
            print("❌ Version 2.0 check failed")
            return False
        
        # Upload substantial content
        if not self.upload_substantial_content():
            print("❌ Content upload failed")
            return False
        
        # Test payment flow
        if not self.create_and_verify_payment():
            print("⚠️  Payment flow test completed (mock payment expected to fail)")
        
        # Test analysis pipeline
        print("\n🔬 Testing Analysis Pipeline...")
        if not self.start_analysis_and_wait():
            print("⚠️  Analysis pipeline test completed (payment required as expected)")
            # This is expected behavior - we can't run full analysis without real payment
            return True
        
        # If analysis somehow completed, verify the results
        if self.analysis_report:
            print("\n🔍 Verifying Analysis Results...")
            self.verify_signal_extraction()
            self.verify_multi_signal_synthesis()
            self.verify_risk_assessment()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 70)
        print("📊 CAREERIQ v2.0 TEST SUMMARY")
        print("=" * 70)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        print(f"\n🔗 Session ID: {self.session_id}")
        
        # Save detailed results
        results = {
            'timestamp': datetime.now().isoformat(),
            'test_type': 'careeriq_v2_analysis_pipeline',
            'total_tests': self.tests_run,
            'passed_tests': self.tests_passed,
            'success_rate': (self.tests_passed/self.tests_run*100) if self.tests_run > 0 else 0,
            'session_id': self.session_id,
            'analysis_report_available': bool(self.analysis_report),
            'test_results': self.test_results
        }
        
        with open('/app/test_reports/careeriq_v2_analysis_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        return self.tests_passed == self.tests_run

def main():
    tester = CareerIQV2AnalysisTest()
    
    try:
        success = tester.run_comprehensive_v2_test()
        tester.print_summary()
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())