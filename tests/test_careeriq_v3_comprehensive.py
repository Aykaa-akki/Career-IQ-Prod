"""
CareerIQ v3.0 Comprehensive Backend API Tests
Tests all features for the V3.0 flow:
- Landing Page API health
- Order Page: Form submission with resume upload, target role, mobile number
- Razorpay payment flow initiation (test mode)
- Processing Page: Backend-driven progress with 5 steps, status polling
- Report Page: Career Diagnosis, Risk Assessment for ₹2,999 tier
- Report Page: Upsell section with ₹1,499 price for upgrade to ₹4,498
- Email functionality: Send report via email
- UTM parameter tracking through the flow

Pricing: ₹2,999 entry tier, ₹1,499 upsell to complete intelligence (₹4,498 total)
"""
import pytest
import requests
import os
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://resume-insights-16.preview.emergentagent.com')


def create_test_pdf(content_type="resume"):
    """Create a valid PDF with extractable text content"""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    if content_type == "resume":
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, 750, "TEST_John Doe - Senior Software Engineer")
        c.setFont("Helvetica", 12)
        y = 720
        content = [
            "Email: john.doe@example.com | Phone: +91-9876543210",
            "",
            "PROFESSIONAL SUMMARY",
            "Experienced software engineer with 8+ years of experience in full-stack development.",
            "Proven track record of building scalable systems serving millions of users.",
            "Strong background in agile methodologies and technical leadership.",
            "",
            "WORK EXPERIENCE",
            "",
            "Senior Software Engineer - TechCorp Inc. (2020 - Present)",
            "- Led architecture design for microservices platform serving 5M+ users",
            "- Owned technical roadmap for core platform with $10M annual impact",
            "- Managed team of 5 engineers and 2 QA specialists",
            "- Drove 50% improvement in system performance through optimization",
            "",
            "Software Engineer - StartupXYZ (2017 - 2020)",
            "- Built 3 major product features that increased user engagement by 40%",
            "- Collaborated with cross-functional teams of 20+ members",
            "- Conducted code reviews and mentored junior developers",
            "",
            "Junior Developer - SmallCo (2015 - 2017)",
            "- Developed frontend components using React and TypeScript",
            "- Participated in agile sprints and daily standups",
            "",
            "EDUCATION",
            "B.Tech Computer Science - IIT Bombay (2015)",
            "",
            "SKILLS",
            "Python, JavaScript, React, Node.js, AWS, Docker, Kubernetes, SQL"
        ]
    else:  # linkedin
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, 750, "LinkedIn Profile - John Doe")
        c.setFont("Helvetica", 12)
        y = 720
        content = [
            "Senior Software Engineer at TechCorp Inc.",
            "",
            "About:",
            "Tech leader passionate about building scalable systems.",
            "I specialize in distributed systems and have experience scaling platforms to millions of users.",
            "",
            "Experience:",
            "Senior Software Engineer at TechCorp Inc.",
            "Leading platform architecture for enterprise systems.",
            "",
            "Skills:",
            "Software Engineering, Architecture, Leadership, Python, AWS"
        ]
    
    for line in content:
        c.drawString(100, y, line)
        y -= 18
        if y < 50:
            c.showPage()
            y = 750
    
    c.save()
    buffer.seek(0)
    return buffer.getvalue()


class TestHealthEndpoints:
    """Test health and root endpoints - v3.1 version check"""
    
    def test_health_endpoint(self):
        """Health endpoint should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "careeriq-backend"
        assert "version" in data
        print(f"✓ Health endpoint: status={data['status']}, version={data['version']}")
    
    def test_root_endpoint(self):
        """Root endpoint should return API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        print(f"✓ Root endpoint: {data['message']}")


class TestUploadEndpoint:
    """Test /api/upload endpoint - Resume upload with target role and mobile"""
    
    def test_upload_resume_only(self):
        """Should accept resume upload with target_role and mobile_number"""
        resume_pdf = create_test_pdf("resume")
        
        files = {
            'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')
        }
        data = {
            'target_role': 'Engineering Manager at Series B Startup',
            'mobile_number': '+91 9876543210'
        }
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert response.status_code == 200, f"Upload failed: {response.text}"
        result = response.json()
        
        assert "session_id" in result
        assert result["status"] == "uploaded"
        assert result["linkedin_provided"] == False
        assert "resume_length" in result
        assert result["resume_length"] > 100
        print(f"✓ Resume uploaded: session_id={result['session_id'][:8]}..., length={result['resume_length']}")
    
    def test_upload_resume_with_linkedin(self):
        """Should accept both resume and LinkedIn upload"""
        resume_pdf = create_test_pdf("resume")
        linkedin_pdf = create_test_pdf("linkedin")
        
        files = {
            'resume': ('test_resume.pdf', resume_pdf, 'application/pdf'),
            'linkedin': ('linkedin.pdf', linkedin_pdf, 'application/pdf')
        }
        data = {
            'target_role': 'VP Engineering at FAANG',
            'mobile_number': '+91 8765432109'
        }
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert response.status_code == 200, f"Upload failed: {response.text}"
        result = response.json()
        
        assert result["linkedin_provided"] == True
        assert result["linkedin_length"] > 0
        print(f"✓ Resume + LinkedIn uploaded: linkedin_provided={result['linkedin_provided']}")
    
    def test_upload_with_utm_params(self):
        """Should accept UTM parameters for attribution tracking"""
        resume_pdf = create_test_pdf("resume")
        
        files = {
            'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')
        }
        data = {
            'target_role': 'Product Manager',
            'mobile_number': '+91 9876543210',
            'utm_source': 'google',
            'utm_medium': 'cpc',
            'utm_campaign': 'career_test'
        }
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert response.status_code == 200
        result = response.json()
        assert "session_id" in result
        print(f"✓ Upload with UTM params successful")
    
    def test_upload_without_resume_fails(self):
        """Should fail when resume is missing"""
        data = {
            'target_role': 'Product Manager',
            'mobile_number': '+91 9876543210'
        }
        
        response = requests.post(f"{BASE_URL}/api/upload", data=data)
        assert response.status_code == 422
        print("✓ Correctly rejects upload without resume")
    
    def test_upload_without_target_role_fails(self):
        """Should fail when target_role is missing"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {'mobile_number': '+91 9876543210'}
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert response.status_code == 422
        print("✓ Correctly rejects upload without target_role")


class TestCreateOrderEndpoint:
    """Test /api/create-order endpoint - Razorpay order creation"""
    
    @pytest.fixture
    def session_id(self):
        """Create a session via upload for order tests"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'Senior Product Manager',
            'mobile_number': '+91 9876543210'
        }
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        return response.json()["session_id"]
    
    def test_create_order_tier_2999(self, session_id):
        """Should create order for ₹2,999 entry tier"""
        payload = {
            "tier": 2999,
            "session_id": session_id
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 200, f"Create order failed: {response.text}"
        data = response.json()
        
        assert "order_id" in data
        assert data["order_id"].startswith("order_")
        assert data["amount"] == 299900  # Amount in paise
        assert data["currency"] == "INR"
        assert data["session_id"] == session_id
        print(f"✓ Order created for ₹2,999: order_id={data['order_id']}")
    
    def test_create_order_tier_4498(self, session_id):
        """Should create order for ₹4,498 complete tier"""
        payload = {
            "tier": 4498,
            "session_id": session_id
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["amount"] == 449800  # Amount in paise
        print(f"✓ Order created for ₹4,498: order_id={data['order_id']}")
    
    def test_create_order_invalid_tier(self, session_id):
        """Should reject invalid tier values"""
        payload = {
            "tier": 1000,  # Invalid tier
            "session_id": session_id
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 400
        print("✓ Correctly rejects invalid tier value")
    
    def test_create_order_invalid_session(self):
        """Should reject invalid session_id"""
        payload = {
            "tier": 2999,
            "session_id": "invalid-session-id"
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 404
        print("✓ Correctly rejects invalid session_id")


class TestRazorpayKeyEndpoint:
    """Test /api/razorpay-key endpoint"""
    
    def test_get_razorpay_key(self):
        """Should return Razorpay test key_id"""
        response = requests.get(f"{BASE_URL}/api/razorpay-key")
        assert response.status_code == 200
        data = response.json()
        
        assert "key_id" in data
        assert data["key_id"].startswith("rzp_test_")  # Test mode key
        print(f"✓ Razorpay key retrieved: {data['key_id'][:15]}...")


class TestVerifyPaymentEndpoint:
    """Test /api/verify-payment endpoint"""
    
    def test_verify_payment_missing_fields(self):
        """Should reject payment verification with missing fields"""
        payload = {
            "razorpay_order_id": "order_test123"
        }
        response = requests.post(f"{BASE_URL}/api/verify-payment", json=payload)
        assert response.status_code == 422
        print("✓ Correctly rejects incomplete payment verification")
    
    def test_verify_payment_requires_session_id(self):
        """Should require session_id in payment verification"""
        payload = {
            "razorpay_order_id": "order_test123",
            "razorpay_payment_id": "pay_test123",
            "razorpay_signature": "test_signature"
        }
        response = requests.post(f"{BASE_URL}/api/verify-payment", json=payload)
        assert response.status_code == 422
        print("✓ Correctly requires session_id in payment verification")


class TestAnalyzeEndpoint:
    """Test /api/analyze endpoint"""
    
    def test_analyze_without_payment(self):
        """Should reject analysis without completed payment"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'Engineering Manager',
            'mobile_number': '+91 9876543210'
        }
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        session_id = upload_response.json()["session_id"]
        
        analyze_payload = {"session_id": session_id}
        response = requests.post(f"{BASE_URL}/api/analyze", json=analyze_payload)
        assert response.status_code == 402  # Payment required
        print("✓ Correctly requires payment before analysis")
    
    def test_analyze_invalid_session(self):
        """Should reject analysis for non-existent session"""
        payload = {"session_id": "invalid-session-id"}
        response = requests.post(f"{BASE_URL}/api/analyze", json=payload)
        assert response.status_code == 404
        print("✓ Correctly rejects invalid session_id")


class TestProgressEndpoint:
    """Test /api/report/{session_id}/progress endpoint - Backend-driven progress"""
    
    def test_progress_for_completed_session(self):
        """Should return progress for completed session"""
        # Use the existing completed session
        test_session_id = "f1c5ba1b-d360-49e6-b84c-31e4e467540e"
        response = requests.get(f"{BASE_URL}/api/report/{test_session_id}/progress")
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "current_step" in data
        assert "assembly_state" in data
        assert "progress_percent" in data
        print(f"✓ Progress endpoint: status={data['status']}, progress={data['progress_percent']}%")
    
    def test_progress_for_invalid_session(self):
        """Should return 404 for non-existent session"""
        response = requests.get(f"{BASE_URL}/api/report/invalid-session-id/progress")
        assert response.status_code == 404
        print("✓ Correctly returns 404 for invalid session")


class TestReportEndpoint:
    """Test /api/report/{session_id} endpoint - Report retrieval"""
    
    def test_report_for_completed_session(self):
        """Should return full report for completed session with tier 2999"""
        test_session_id = "f1c5ba1b-d360-49e6-b84c-31e4e467540e"
        response = requests.get(f"{BASE_URL}/api/report/{test_session_id}")
        assert response.status_code == 200
        data = response.json()
        
        # Check status
        assert data["status"] == "completed"
        
        # Check tier
        assert data["tier"] == 2999
        
        # Check identity fields (v3.0)
        assert "full_name" in data
        assert "current_role" in data
        assert "target_role" in data
        assert "linkedin_provided" in data
        
        # Check report structure
        assert "report" in data
        report = data["report"]
        
        # Check diagnosis section (included in ₹2,999)
        assert "diagnosis" in report
        diagnosis = report["diagnosis"]
        assert "career_verdict" in diagnosis
        assert "market_reading" in diagnosis
        assert "diagnostic_summary" in diagnosis
        
        # Check risk section (included in ₹2,999)
        assert "risk" in report
        risk = report["risk"]
        assert "independent_risks" in risk
        assert "risk_compounding_analysis" in risk
        
        # Check closing section (v3.1)
        assert "closing_section" in data
        closing = data["closing_section"]
        assert closing["title"] == "What This Really Means for You"
        assert len(closing["paragraphs"]) == 4
        
        print(f"✓ Report retrieved: name={data['full_name']}, tier={data['tier']}")
        print(f"  - Diagnosis: career_verdict present")
        print(f"  - Risk: {len(risk['independent_risks'])} independent risks")
        print(f"  - Closing section present")
    
    def test_report_not_found(self):
        """Should return 404 for non-existent session"""
        response = requests.get(f"{BASE_URL}/api/report/non-existent-session-id")
        assert response.status_code == 404
        print("✓ Correctly returns 404 for non-existent session")


class TestUpgradeEndpoint:
    """Test /api/upgrade endpoint - Tier upgrade for upsell"""
    
    def test_upgrade_from_2999_to_4498(self):
        """Should create upgrade order from ₹2,999 to ₹4,498 (₹1,499 difference)"""
        # Use the existing session with tier 2999
        test_session_id = "f1c5ba1b-d360-49e6-b84c-31e4e467540e"
        
        payload = {
            "session_id": test_session_id,
            "new_tier": 4498
        }
        response = requests.post(f"{BASE_URL}/api/upgrade", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "order_id" in data
        assert data["amount"] == 149900  # ₹1,499 in paise (4498 - 2999 = 1499)
        assert data["currency"] == "INR"
        assert data["upgrade_from"] == 2999
        assert data["upgrade_to"] == 4498
        print(f"✓ Upgrade order created: ₹{data['amount']//100} (from ₹{data['upgrade_from']} to ₹{data['upgrade_to']})")
    
    def test_upgrade_invalid_session(self):
        """Should reject upgrade for invalid session"""
        payload = {
            "session_id": "invalid-session-id",
            "new_tier": 4498
        }
        response = requests.post(f"{BASE_URL}/api/upgrade", json=payload)
        assert response.status_code == 404
        print("✓ Correctly rejects upgrade for invalid session")


class TestSendReportEndpoint:
    """Test /api/send-report endpoint - Email functionality"""
    
    def test_send_report_missing_email(self):
        """Should reject send request without email"""
        payload = {
            "session_id": "f1c5ba1b-d360-49e6-b84c-31e4e467540e"
        }
        response = requests.post(f"{BASE_URL}/api/send-report", json=payload)
        assert response.status_code == 422
        print("✓ Correctly rejects send request without email")
    
    def test_send_report_invalid_email(self):
        """Should reject send request with invalid email format"""
        payload = {
            "session_id": "f1c5ba1b-d360-49e6-b84c-31e4e467540e",
            "email": "invalid-email"
        }
        response = requests.post(f"{BASE_URL}/api/send-report", json=payload)
        assert response.status_code == 422
        print("✓ Correctly rejects invalid email format")


class TestSessionEndpoint:
    """Test /api/session/{session_id} endpoint"""
    
    def test_session_status(self):
        """Should return session status"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'CTO at Startup',
            'mobile_number': '+91 9876543210'
        }
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        session_id = upload_response.json()["session_id"]
        
        response = requests.get(f"{BASE_URL}/api/session/{session_id}")
        assert response.status_code == 200
        data = response.json()
        
        assert data["session_id"] == session_id
        assert data["status"] == "uploaded"
        assert data["target_role"] == "CTO at Startup"
        print(f"✓ Session status: {data['status']}")


class TestFullE2EFlow:
    """Integration test for complete E2E flow (pre-payment)"""
    
    def test_complete_flow_pre_payment(self):
        """Test complete flow: upload -> create-order -> verify session"""
        # Step 1: Upload Resume
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'VP Engineering at Series B Startup',
            'mobile_number': '+91 9876543210',
            'utm_source': 'test',
            'utm_medium': 'pytest'
        }
        
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        session_id = upload_data["session_id"]
        print(f"✓ Step 1: Resume uploaded - session_id: {session_id[:8]}...")
        
        # Step 2: Create Order (₹2,999 entry tier)
        order_payload = {"tier": 2999, "session_id": session_id}
        order_response = requests.post(f"{BASE_URL}/api/create-order", json=order_payload)
        assert order_response.status_code == 200
        order_data = order_response.json()
        assert order_data["amount"] == 299900
        print(f"✓ Step 2: Order created - {order_data['order_id']}")
        
        # Step 3: Verify session has tier set
        session_response = requests.get(f"{BASE_URL}/api/session/{session_id}")
        assert session_response.status_code == 200
        session_data = session_response.json()
        assert session_data["tier"] == 2999
        print(f"✓ Step 3: Session verified - tier: ₹{session_data['tier']}")
        
        # Step 4: Verify Razorpay key is available
        key_response = requests.get(f"{BASE_URL}/api/razorpay-key")
        assert key_response.status_code == 200
        key_data = key_response.json()
        assert key_data["key_id"].startswith("rzp_test_")
        print(f"✓ Step 4: Razorpay key available (test mode)")
        
        print("\n✓ Complete E2E flow (pre-payment) passed!")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
