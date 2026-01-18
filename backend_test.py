import requests
import sys
import json
import tempfile
import os
from datetime import datetime
from fpdf import FPDF

class CareerIQAPITester:
    def __init__(self, base_url="https://resume-insights-16.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_id = None
        self.razorpay_key = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

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
        
        # Split content into lines and add to PDF
        lines = content.split('\n')
        for line in lines:
            if line.strip():
                # Handle long lines by wrapping them
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
                pdf.cell(0, 5, "", new_x="LMARGIN", new_y="NEXT")  # Empty line
        
        # Return bytes
        return pdf.output()

    def test_health_endpoint(self):
        """Test GET /api/health"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Response: {response.json() if success else response.text}"
            self.log_test("Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check", False, str(e))
            return False

    def test_razorpay_key_endpoint(self):
        """Test GET /api/razorpay-key"""
        try:
            response = requests.get(f"{self.base_url}/api/razorpay-key", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                self.razorpay_key = data.get('key_id')
                success = bool(self.razorpay_key)
                details = f"Key ID: {self.razorpay_key[:10]}..." if self.razorpay_key else "No key_id in response"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            
            self.log_test("Razorpay Key Retrieval", success, details)
            return success
        except Exception as e:
            self.log_test("Razorpay Key Retrieval", False, str(e))
            return False

    def test_upload_endpoint(self):
        """Test POST /api/upload with mock files"""
        try:
            # Create substantial text content for resume
            resume_content = """JOHN DOE
Senior Software Engineer | john.doe@email.com | +1-555-0123

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development.
Proven track record of delivering high-quality applications using modern technologies.
Strong background in Python, JavaScript, React, and cloud technologies.

WORK EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2020 - Present
Led development of microservices architecture serving 1M+ users daily
Implemented CI/CD pipelines reducing deployment time by 60%
Mentored junior developers and conducted code reviews
Designed and built RESTful APIs handling 10K+ requests per minute
Technologies: Python, FastAPI, React, AWS, Docker, Kubernetes

Software Engineer | StartupXYZ | 2018 - 2020
Developed full-stack web applications using React and Node.js
Optimized database queries improving performance by 40%
Collaborated with cross-functional teams in agile environment
Built responsive user interfaces serving 50K+ monthly active users
Technologies: JavaScript, React, Node.js, MongoDB, PostgreSQL

Junior Developer | DevCorp | 2017 - 2018
Contributed to legacy system modernization project
Fixed bugs and implemented new features in Java applications
Participated in code reviews and testing processes
Technologies: Java, Spring Boot, MySQL, Jenkins

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2017
GPA: 3.8/4.0, Magna Cum Laude

TECHNICAL SKILLS
Programming Languages: Python, JavaScript, TypeScript, Java, Go
Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
Backend: FastAPI, Django, Node.js, Express.js, Spring Boot
Databases: PostgreSQL, MongoDB, Redis, MySQL
Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins, GitHub Actions
Tools: Git, Jira, Slack, VS Code, IntelliJ

PROJECTS
E-commerce Platform (2021)
Built scalable e-commerce platform handling 100K+ products
Implemented payment integration with Stripe and PayPal
Achieved 99.9% uptime with proper monitoring and alerting

Task Management App (2020)
Developed real-time collaborative task management application
Used WebSocket for real-time updates and notifications
Deployed on AWS with auto-scaling capabilities

ACHIEVEMENTS
Increased system performance by 50% through code optimization
Led team of 4 developers on critical project delivery
Contributed to open-source projects with 1000+ GitHub stars
Received Employee of the Year award in 2021
Published technical blog posts with 10K+ views

CERTIFICATIONS
AWS Certified Solutions Architect (2021)
Certified Kubernetes Administrator (2020)"""

            linkedin_content = """JOHN DOE
Senior Software Engineer at TechCorp Inc.
San Francisco Bay Area | 500+ connections

ABOUT
Passionate software engineer with expertise in building scalable web applications and microservices. 
I love solving complex problems and mentoring junior developers. Always learning new technologies 
and contributing to open-source projects.

EXPERIENCE

Senior Software Engineer
TechCorp Inc. Full-time
Jan 2020 - Present 4 yrs
San Francisco, California, United States

Leading development of microservices architecture serving over 1 million users
Implementing DevOps best practices and CI/CD pipelines
Mentoring junior developers and conducting technical interviews
Working with cutting-edge technologies including Python, React, and AWS

Software Engineer
StartupXYZ Full-time
Jun 2018 - Dec 2019 1 yr 7 mos
San Francisco, California, United States

Developed full-stack web applications using modern JavaScript frameworks
Collaborated with product managers and designers in agile environment
Optimized application performance and database queries
Built RESTful APIs and integrated third-party services

Junior Developer
DevCorp Full-time
Aug 2017 - May 2018 10 mos
San Francisco, California, United States

Contributed to legacy system modernization projects
Fixed bugs and implemented new features in Java applications
Participated in code reviews and testing processes

EDUCATION

University of Technology
Bachelor of Science - BS, Computer Science
2013 - 2017
Grade: 3.8 GPA

LICENSES & CERTIFICATIONS
AWS Certified Solutions Architect - Associate
Amazon Web Services (AWS)
Issued Jan 2021

Certified Kubernetes Administrator (CKA)
Cloud Native Computing Foundation
Issued Mar 2020

SKILLS
Python JavaScript React Node.js AWS Docker Kubernetes PostgreSQL MongoDB

RECOMMENDATIONS
John is an exceptional engineer who consistently delivers high-quality code - Sarah Johnson, Product Manager

ACTIVITY
Contributed to open-source project ReactJS with 50+ commits
Published article Building Scalable APIs with FastAPI - 5,000 views
Spoke at SF Tech Meetup about Microservices Best Practices"""
            
            # Create proper PDF files
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
                details = f"Session ID: {self.session_id[:8]}..." if self.session_id else "No session_id in response"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            
            self.log_test("File Upload", success, details)
            return success
        except Exception as e:
            self.log_test("File Upload", False, str(e))
            return False

    def test_create_order_endpoint(self):
        """Test POST /api/create-order"""
        if not self.session_id:
            self.log_test("Create Order", False, "No session_id available")
            return False
        
        try:
            payload = {"tier": 499}
            response = requests.post(
                f"{self.base_url}/api/create-order?session_id={self.session_id}", 
                json=payload, 
                timeout=15
            )
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ['order_id', 'amount', 'currency', 'session_id']
                has_all_fields = all(field in data for field in required_fields)
                success = has_all_fields and data['amount'] == 49900  # ₹499 in paise
                details = f"Order ID: {data.get('order_id', 'N/A')[:10]}..., Amount: {data.get('amount', 'N/A')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            
            self.log_test("Create Order", success, details)
            return success
        except Exception as e:
            self.log_test("Create Order", False, str(e))
            return False

    def test_session_status_endpoint(self):
        """Test GET /api/session/{session_id}"""
        if not self.session_id:
            self.log_test("Session Status", False, "No session_id available")
            return False
        
        try:
            response = requests.get(f"{self.base_url}/api/session/{self.session_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_fields = ['session_id', 'status', 'payment_status']
                has_fields = all(field in data for field in expected_fields)
                success = has_fields
                details = f"Status: {data.get('status', 'N/A')}, Payment: {data.get('payment_status', 'N/A')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            
            self.log_test("Session Status", success, details)
            return success
        except Exception as e:
            self.log_test("Session Status", False, str(e))
            return False

    def test_llm_pipeline_endpoints_exist(self):
        """Test that LLM pipeline endpoints exist (without triggering analysis)"""
        endpoints_to_check = [
            "/api/analyze",
            "/api/verify-payment", 
            "/api/upgrade",
            "/api/verify-upgrade",
            "/api/send-report"
        ]
        
        all_exist = True
        details_list = []
        
        for endpoint in endpoints_to_check:
            try:
                # Use HEAD request or POST with invalid data to check if endpoint exists
                response = requests.post(f"{self.base_url}{endpoint}", json={}, timeout=5)
                # We expect 400/422 (bad request) or 404 (not found)
                # 404 means endpoint doesn't exist, others mean it exists but we sent bad data
                exists = response.status_code != 404
                status_text = "EXISTS" if exists else "NOT FOUND"
                details_list.append(f"{endpoint}: {status_text}")
                if not exists:
                    all_exist = False
            except Exception as e:
                details_list.append(f"{endpoint}: ERROR - {str(e)}")
                all_exist = False
        
        details = "; ".join(details_list)
        self.log_test("LLM Pipeline Endpoints Exist", all_exist, details)
        return all_exist

    def test_report_endpoint_without_analysis(self):
        """Test GET /api/report/{session_id} (should return processing/pending status)"""
        if not self.session_id:
            self.log_test("Report Endpoint", False, "No session_id available")
            return False
        
        try:
            response = requests.get(f"{self.base_url}/api/report/{self.session_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # Should return status indicating no analysis yet
                has_status = 'status' in data
                details = f"Status: {data.get('status', 'N/A')}, Message: {data.get('message', 'N/A')}"
                success = has_status
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            
            self.log_test("Report Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Report Endpoint", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting CareerIQ Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic endpoints first
        if not self.test_health_endpoint():
            print("❌ Health check failed - backend may be down")
            return False
        
        if not self.test_razorpay_key_endpoint():
            print("⚠️  Razorpay key retrieval failed - payment integration may not work")
        
        # Test file upload and session creation
        if not self.test_upload_endpoint():
            print("❌ File upload failed - core functionality broken")
            return False
        
        # Test order creation
        self.test_create_order_endpoint()
        
        # Test session status
        self.test_session_status_endpoint()
        
        # Test report endpoint
        self.test_report_endpoint_without_analysis()
        
        # Test LLM pipeline endpoints exist
        self.test_llm_pipeline_endpoints_exist()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['details']}")
        
        print(f"\n🔗 Session ID for frontend testing: {self.session_id}")
        return self.tests_passed == self.tests_run

def main():
    tester = CareerIQAPITester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        # Save test results
        with open('/app/test_reports/backend_test_results.json', 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0,
                'session_id': tester.session_id,
                'test_results': tester.test_results
            }, f, indent=2)
        
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())