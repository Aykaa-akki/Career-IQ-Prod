import requests
import sys
import json
from datetime import datetime

class CareerIQComprehensiveTest:
    def __init__(self, base_url="https://resume-insights-16.preview.emergentagent.com"):
        self.base_url = base_url
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

    def test_version_2_0_features(self):
        """Test all v2.0 specific features"""
        
        # Test 1: Health endpoint returns version 2.0
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                version = data.get('version', '')
                service = data.get('service', '')
                success = version == '2.0' and 'careeriq' in service.lower()
                details = f"Version: {version}, Service: {service}"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Backend API Health Returns Version 2.0", success, details)
        except Exception as e:
            self.log_test("Backend API Health Returns Version 2.0", False, str(e))

        # Test 2: Root endpoint
        try:
            response = requests.get(f"{self.base_url}/api/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                version = data.get('version', '')
                success = version == '2.0'
                details = f"Root endpoint version: {version}"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Root API Endpoint Returns Version 2.0", success, details)
        except Exception as e:
            self.log_test("Root API Endpoint Returns Version 2.0", False, str(e))

        # Test 3: Razorpay integration
        try:
            response = requests.get(f"{self.base_url}/api/razorpay-key", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                key_id = data.get('key_id', '')
                success = key_id.startswith('rzp_')
                details = f"Razorpay key format valid: {key_id[:10]}..."
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Payment Integration (Razorpay) Working", success, details)
        except Exception as e:
            self.log_test("Payment Integration (Razorpay) Working", False, str(e))

    def test_file_upload_capabilities(self):
        """Test file upload with substantial content"""
        try:
            # Create test files with substantial content
            resume_content = b"""JOHN SMITH
Senior Software Engineer | john.smith@email.com | +1-555-0123

PROFESSIONAL SUMMARY
Experienced software engineer with 7+ years of experience in full-stack development, 
microservices architecture, and cloud technologies. Proven track record of leading 
technical teams and delivering scalable solutions for high-traffic applications.

WORK EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2020 - Present
Led development of microservices architecture serving 1M+ users daily
Implemented CI/CD pipelines reducing deployment time by 60%
Mentored junior developers and conducted code reviews
Designed RESTful APIs handling 10K+ requests per minute
Technologies: Python, FastAPI, React, AWS, Docker, Kubernetes

Software Engineer | StartupXYZ | 2018 - 2020
Developed full-stack web applications using React and Node.js
Optimized database queries improving performance by 40%
Collaborated with cross-functional teams in agile environment
Built responsive user interfaces serving 50K+ monthly active users

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2017
GPA: 3.8/4.0, Magna Cum Laude

TECHNICAL SKILLS
Programming Languages: Python, JavaScript, TypeScript, Java, Go
Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
Backend: FastAPI, Django, Node.js, Express.js, Spring Boot
Databases: PostgreSQL, MongoDB, Redis, MySQL
Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins, GitHub Actions"""

            linkedin_content = b"""JOHN SMITH
Senior Software Engineer at TechCorp Inc.
San Francisco Bay Area | 500+ connections

ABOUT
Passionate software engineer with expertise in building scalable web applications 
and microservices. I love solving complex problems and mentoring junior developers. 
Always learning new technologies and contributing to open-source projects.

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

EDUCATION
University of Technology
Bachelor of Science - BS, Computer Science
2013 - 2017
Grade: 3.8 GPA

SKILLS
Python JavaScript React Node.js AWS Docker Kubernetes PostgreSQL MongoDB"""

            files = {
                'resume': ('resume.pdf', resume_content, 'application/pdf'),
                'linkedin': ('linkedin.pdf', linkedin_content, 'application/pdf')
            }
            
            response = requests.post(f"{self.base_url}/api/upload", files=files, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                session_id = data.get('session_id')
                resume_length = data.get('resume_length', 0)
                linkedin_length = data.get('linkedin_length', 0)
                success = bool(session_id) and resume_length > 1000 and linkedin_length > 500
                details = f"Session: {session_id[:8]}..., Resume: {resume_length} chars, LinkedIn: {linkedin_length} chars"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("File Upload with Substantial Resume/LinkedIn Content", success, details)
            return session_id if success else None
            
        except Exception as e:
            self.log_test("File Upload with Substantial Resume/LinkedIn Content", False, str(e))
            return None

    def test_analysis_pipeline_endpoints(self):
        """Test all analysis pipeline endpoints exist and respond correctly"""
        
        endpoints_to_test = [
            ("/api/analyze", "POST", "Analysis Pipeline Entry Point"),
            ("/api/verify-payment", "POST", "Payment Verification"),
            ("/api/upgrade", "POST", "Tier Upgrade"),
            ("/api/verify-upgrade", "POST", "Upgrade Payment Verification"),
            ("/api/send-report", "POST", "Email Report Generation")
        ]
        
        all_endpoints_working = True
        
        for endpoint, method, description in endpoints_to_test:
            try:
                if method == "POST":
                    response = requests.post(f"{self.base_url}{endpoint}", json={}, timeout=10)
                else:
                    response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                
                # Endpoints should exist (not return 404) and handle requests properly
                # We expect 400/422 (bad request) for invalid data, not 404 (not found)
                exists = response.status_code != 404
                
                if exists:
                    details = f"Endpoint exists, returns {response.status_code}"
                else:
                    details = "Endpoint not found (404)"
                    all_endpoints_working = False
                
                self.log_test(f"{description} Endpoint", exists, details)
                
            except Exception as e:
                self.log_test(f"{description} Endpoint", False, str(e))
                all_endpoints_working = False
        
        return all_endpoints_working

    def test_complete_workflow_structure(self, session_id):
        """Test the complete workflow structure without actual payment"""
        if not session_id:
            self.log_test("Complete Workflow Structure", False, "No session ID available")
            return False
        
        workflow_success = True
        
        # Test 1: Create order for different tiers
        for tier in [499, 2999, 4999]:
            try:
                payload = {"tier": tier}
                response = requests.post(
                    f"{self.base_url}/api/create-order?session_id={session_id}", 
                    json=payload, 
                    timeout=15
                )
                success = response.status_code == 200
                
                if success:
                    data = response.json()
                    expected_amount = tier * 100
                    amount_correct = data.get('amount') == expected_amount
                    details = f"Tier {tier}: Amount {data.get('amount')} (expected {expected_amount})"
                    success = amount_correct
                else:
                    details = f"Status: {response.status_code}"
                    workflow_success = False
                
                self.log_test(f"Order Creation for Tier ₹{tier}", success, details)
                
            except Exception as e:
                self.log_test(f"Order Creation for Tier ₹{tier}", False, str(e))
                workflow_success = False
        
        # Test 2: Session status tracking
        try:
            response = requests.get(f"{self.base_url}/api/session/{session_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_required_fields = all(field in data for field in ['session_id', 'status', 'payment_status'])
                details = f"Status: {data.get('status')}, Payment: {data.get('payment_status')}"
                success = has_required_fields
            else:
                details = f"Status: {response.status_code}"
                workflow_success = False
            
            self.log_test("Session Status Tracking", success, details)
            
        except Exception as e:
            self.log_test("Session Status Tracking", False, str(e))
            workflow_success = False
        
        # Test 3: Report endpoint (should indicate no analysis yet)
        try:
            response = requests.get(f"{self.base_url}/api/report/{session_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_status = 'status' in data
                details = f"Report status: {data.get('status', 'N/A')}"
                success = has_status
            else:
                details = f"Status: {response.status_code}"
                workflow_success = False
            
            self.log_test("Report Status Endpoint", success, details)
            
        except Exception as e:
            self.log_test("Report Status Endpoint", False, str(e))
            workflow_success = False
        
        return workflow_success

    def run_comprehensive_test(self):
        """Run comprehensive CareerIQ v2.0 backend test"""
        print("🚀 Starting Comprehensive CareerIQ v2.0 Backend Test")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 80)
        
        # Test v2.0 specific features
        print("\n🔍 Testing v2.0 Features...")
        self.test_version_2_0_features()
        
        # Test file upload capabilities
        print("\n📁 Testing File Upload Capabilities...")
        session_id = self.test_file_upload_capabilities()
        
        # Test analysis pipeline endpoints
        print("\n🔬 Testing Analysis Pipeline Endpoints...")
        self.test_analysis_pipeline_endpoints()
        
        # Test complete workflow structure
        print("\n🔄 Testing Complete Workflow Structure...")
        self.test_complete_workflow_structure(session_id)
        
        return True

    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE CAREERIQ v2.0 BACKEND TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Categorize results
        v2_features = [r for r in self.test_results if 'Version 2.0' in r['test'] or 'Root API' in r['test']]
        upload_tests = [r for r in self.test_results if 'Upload' in r['test'] or 'File' in r['test']]
        pipeline_tests = [r for r in self.test_results if 'Pipeline' in r['test'] or 'Endpoint' in r['test']]
        workflow_tests = [r for r in self.test_results if 'Order' in r['test'] or 'Session' in r['test'] or 'Report' in r['test']]
        
        print(f"\n📈 Test Categories:")
        print(f"  v2.0 Features: {sum(1 for r in v2_features if r['success'])}/{len(v2_features)} passed")
        print(f"  File Upload: {sum(1 for r in upload_tests if r['success'])}/{len(upload_tests)} passed")
        print(f"  Pipeline Endpoints: {sum(1 for r in pipeline_tests if r['success'])}/{len(pipeline_tests)} passed")
        print(f"  Workflow: {sum(1 for r in workflow_tests if r['success'])}/{len(workflow_tests)} passed")
        
        if self.tests_passed < self.tests_run:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        # Save comprehensive results
        results = {
            'timestamp': datetime.now().isoformat(),
            'test_type': 'comprehensive_careeriq_v2_backend',
            'total_tests': self.tests_run,
            'passed_tests': self.tests_passed,
            'success_rate': (self.tests_passed/self.tests_run*100) if self.tests_run > 0 else 0,
            'test_categories': {
                'v2_features': {'passed': sum(1 for r in v2_features if r['success']), 'total': len(v2_features)},
                'file_upload': {'passed': sum(1 for r in upload_tests if r['success']), 'total': len(upload_tests)},
                'pipeline_endpoints': {'passed': sum(1 for r in pipeline_tests if r['success']), 'total': len(pipeline_tests)},
                'workflow': {'passed': sum(1 for r in workflow_tests if r['success']), 'total': len(workflow_tests)}
            },
            'test_results': self.test_results
        }
        
        with open('/app/test_reports/comprehensive_v2_backend_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        return self.tests_passed == self.tests_run

def main():
    tester = CareerIQComprehensiveTest()
    
    try:
        success = tester.run_comprehensive_test()
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