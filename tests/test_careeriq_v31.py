"""
CareerIQ v3.1 Backend API Tests
Tests the SIMPLIFIED single-page order flow:
- /api/upload accepts resume (required), linkedin (optional), target_role, mobile_number
- /api/create-order accepts tier and session_id
- /api/verify-payment accepts payment details and session_id
- /api/analyze starts analysis pipeline
- /api/report returns full_name, current_role extracted from resume
- Health endpoint returns version 3.1
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
        c.drawString(100, 750, "TEST_Jane Smith - Senior Product Manager")
        c.setFont("Helvetica", 12)
        y = 720
        content = [
            "Email: jane.smith@example.com | Phone: +91-9876543210",
            "",
            "PROFESSIONAL SUMMARY",
            "Experienced product manager with 7+ years of experience in B2B SaaS products.",
            "Proven track record of launching products that generated $10M+ in revenue.",
            "Strong background in agile methodologies and cross-functional team leadership.",
            "",
            "WORK EXPERIENCE",
            "",
            "Senior Product Manager - TechStartup Inc. (2021 - Present)",
            "- Led product strategy for enterprise SaaS platform serving 500+ clients",
            "- Owned P&L for product line with $5M annual revenue",
            "- Managed team of 3 product managers and 2 designers",
            "- Drove 40% increase in user engagement through feature optimization",
            "",
            "Product Manager - BigCorp Solutions (2018 - 2021)",
            "- Launched 3 major product features that increased ARR by $2M",
            "- Collaborated with engineering teams of 15+ developers",
            "- Conducted user research with 100+ enterprise customers",
            "",
            "Associate Product Manager - StartupXYZ (2016 - 2018)",
            "- Supported product roadmap development and prioritization",
            "- Analyzed user data to identify growth opportunities",
            "",
            "EDUCATION",
            "MBA - Indian Institute of Management (2016)",
            "B.Tech Computer Science - IIT Delhi (2014)",
            "",
            "SKILLS",
            "Product Strategy, Roadmap Planning, Agile/Scrum, SQL, Data Analysis",
            "User Research, A/B Testing, Stakeholder Management"
        ]
    else:  # linkedin
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, 750, "LinkedIn Profile - Jane Smith")
        c.setFont("Helvetica", 12)
        y = 720
        content = [
            "Senior Product Manager at TechStartup Inc.",
            "",
            "About:",
            "Product leader passionate about building products that solve real problems.",
            "I specialize in B2B SaaS and have experience scaling products from 0 to $10M ARR.",
            "",
            "Experience:",
            "Senior Product Manager at TechStartup Inc.",
            "Leading product strategy for enterprise platform.",
            "",
            "Skills:",
            "Product Management, Strategy, Agile, Data Analysis, Leadership"
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


class TestHealthEndpointsV31:
    """Test health and root endpoints - v3.1 version check"""
    
    def test_health_endpoint_returns_v31(self):
        """Health endpoint should return version 3.1"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "3.1", f"Expected version 3.1, got {data['version']}"
        print(f"✓ Health endpoint returns version: {data['version']}")
    
    def test_root_endpoint_returns_v31(self):
        """Root endpoint should return version 3.1"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["version"] == "3.1", f"Expected version 3.1, got {data['version']}"
        print(f"✓ Root endpoint returns version: {data['version']}")


class TestSimplifiedUploadEndpointV31:
    """Test the SIMPLIFIED /api/upload endpoint (v3.1)
    - Accepts resume (required), linkedin (optional), target_role, mobile_number
    - NO lead_id required (removed lead capture step)
    """
    
    def test_upload_resume_with_target_role_and_mobile(self):
        """Should accept resume upload with target_role and mobile_number (v3.1 simplified flow)"""
        resume_pdf = create_test_pdf("resume")
        
        files = {
            'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')
        }
        data = {
            'target_role': 'Head of Product at Series B Startup',
            'mobile_number': '+91 9876543210'
        }
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert response.status_code == 200, f"Upload failed: {response.text}"
        result = response.json()
        assert "session_id" in result, "session_id not in response"
        assert result["status"] == "uploaded"
        assert result["linkedin_provided"] == False
        assert "resume_length" in result
        print(f"✓ Resume uploaded successfully, session_id: {result['session_id']}")
        return result["session_id"]
    
    def test_upload_resume_with_linkedin(self):
        """Should accept both resume and LinkedIn upload (v3.1)"""
        resume_pdf = create_test_pdf("resume")
        linkedin_pdf = create_test_pdf("linkedin")
        
        files = {
            'resume': ('test_resume.pdf', resume_pdf, 'application/pdf'),
            'linkedin': ('linkedin.pdf', linkedin_pdf, 'application/pdf')
        }
        data = {
            'target_role': 'VP Product at FAANG',
            'mobile_number': '+91 8765432109'
        }
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert response.status_code == 200, f"Upload failed: {response.text}"
        result = response.json()
        assert result["linkedin_provided"] == True
        assert result["linkedin_length"] > 0
        print(f"✓ Resume + LinkedIn uploaded, linkedin_provided: {result['linkedin_provided']}")
    
    def test_upload_without_resume_fails(self):
        """Should fail when resume is missing"""
        data = {
            'target_role': 'Product Manager',
            'mobile_number': '+91 9876543210'
        }
        
        response = requests.post(f"{BASE_URL}/api/upload", data=data)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("✓ Correctly rejects upload without resume")
    
    def test_upload_without_target_role_fails(self):
        """Should fail when target_role is missing"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {'mobile_number': '+91 9876543210'}
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("✓ Correctly rejects upload without target_role")
    
    def test_upload_without_mobile_number_fails(self):
        """Should fail when mobile_number is missing"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {'target_role': 'Product Manager'}
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("✓ Correctly rejects upload without mobile_number")


class TestSimplifiedCreateOrderV31:
    """Test the SIMPLIFIED /api/create-order endpoint (v3.1)
    - Accepts tier and session_id (NOT lead_id)
    """
    
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
    
    def test_create_order_tier_499(self, session_id):
        """Should create order for ₹499 tier using session_id"""
        payload = {
            "tier": 499,
            "session_id": session_id
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 200, f"Create order failed: {response.text}"
        data = response.json()
        assert "order_id" in data
        assert data["amount"] == 49900  # Amount in paise
        assert data["currency"] == "INR"
        assert data["session_id"] == session_id
        print(f"✓ Order created for ₹499 tier, order_id: {data['order_id']}")
    
    def test_create_order_tier_2999(self, session_id):
        """Should create order for ₹2999 tier"""
        payload = {
            "tier": 2999,
            "session_id": session_id
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 299900
        print(f"✓ Order created for ₹2999 tier")
    
    def test_create_order_tier_4999(self, session_id):
        """Should create order for ₹4999 tier"""
        payload = {
            "tier": 4999,
            "session_id": session_id
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 499900
        print(f"✓ Order created for ₹4999 tier")
    
    def test_create_order_invalid_tier(self, session_id):
        """Should reject invalid tier values"""
        payload = {
            "tier": 999,  # Invalid tier
            "session_id": session_id
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 400
        print("✓ Correctly rejects invalid tier value")
    
    def test_create_order_invalid_session_id(self):
        """Should reject invalid session_id"""
        payload = {
            "tier": 499,
            "session_id": "invalid-session-id"
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 404
        print("✓ Correctly rejects invalid session_id")


class TestVerifyPaymentEndpointV31:
    """Test the /api/verify-payment endpoint (v3.1)
    - Accepts payment details and session_id
    """
    
    def test_verify_payment_missing_fields(self):
        """Should reject payment verification with missing fields"""
        payload = {
            "razorpay_order_id": "order_test123",
            # Missing other required fields
        }
        response = requests.post(f"{BASE_URL}/api/verify-payment", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Correctly rejects incomplete payment verification")
    
    def test_verify_payment_requires_session_id(self):
        """Should require session_id in payment verification"""
        payload = {
            "razorpay_order_id": "order_test123",
            "razorpay_payment_id": "pay_test123",
            "razorpay_signature": "test_signature"
            # Missing session_id
        }
        response = requests.post(f"{BASE_URL}/api/verify-payment", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Correctly requires session_id in payment verification")


class TestAnalyzeEndpointV31:
    """Test the /api/analyze endpoint (v3.1)"""
    
    def test_analyze_without_payment(self):
        """Should reject analysis without completed payment"""
        # Create session via upload
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'Engineering Manager',
            'mobile_number': '+91 9876543210'
        }
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        session_id = upload_response.json()["session_id"]
        
        # Try to analyze without payment
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


class TestReportEndpointV31:
    """Test the /api/report endpoint (v3.1)
    - Should return full_name and current_role extracted from resume
    """
    
    def test_report_not_found(self):
        """Should return 404 for non-existent session"""
        response = requests.get(f"{BASE_URL}/api/report/non-existent-session-id")
        assert response.status_code == 404
        print("✓ Correctly returns 404 for non-existent session")
    
    def test_report_returns_session_status(self):
        """Should return session status for existing session"""
        # Use the test session provided
        test_session_id = "554baee6-6655-47cf-bbba-4252a87c4252"
        response = requests.get(f"{BASE_URL}/api/report/{test_session_id}")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        print(f"✓ Report endpoint returns status: {data['status']}")


class TestRazorpayKeyEndpoint:
    """Test the Razorpay key endpoint"""
    
    def test_get_razorpay_key(self):
        """Should return Razorpay key_id"""
        response = requests.get(f"{BASE_URL}/api/razorpay-key")
        assert response.status_code == 200
        data = response.json()
        assert "key_id" in data
        assert data["key_id"].startswith("rzp_test_")
        print(f"✓ Razorpay key retrieved: {data['key_id'][:15]}...")


class TestSessionEndpointV31:
    """Test the /api/session endpoint (v3.1)"""
    
    def test_session_status(self):
        """Should return session status"""
        # Create a session first
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'CTO at Startup',
            'mobile_number': '+91 9876543210'
        }
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        session_id = upload_response.json()["session_id"]
        
        # Get session status
        response = requests.get(f"{BASE_URL}/api/session/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        assert data["status"] == "uploaded"
        assert data["target_role"] == "CTO at Startup"
        print(f"✓ Session status retrieved: {data['status']}")


class TestFullSimplifiedFlowV31:
    """Integration test for the complete v3.1 SIMPLIFIED flow:
    upload (with optional LinkedIn) -> create-order -> (payment) -> analyze -> report
    """
    
    def test_complete_simplified_flow(self):
        """Test the complete simplified pre-payment flow"""
        # Step 1: Upload Resume with target_role and mobile_number (NO lead capture)
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'VP Product at Series B Startup',
            'mobile_number': '+91 9876543210'
        }
        
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        session_id = upload_data["session_id"]
        assert upload_data["status"] == "uploaded"
        print(f"✓ Step 1: Resume uploaded - session_id: {session_id}")
        
        # Step 2: Create Order using session_id (NOT lead_id)
        order_payload = {"tier": 499, "session_id": session_id}
        order_response = requests.post(f"{BASE_URL}/api/create-order", json=order_payload)
        assert order_response.status_code == 200
        order_data = order_response.json()
        assert order_data["order_id"].startswith("order_")
        assert order_data["session_id"] == session_id
        print(f"✓ Step 2: Order created - {order_data['order_id']}")
        
        # Step 3: Verify session status
        session_response = requests.get(f"{BASE_URL}/api/session/{session_id}")
        assert session_response.status_code == 200
        session_data = session_response.json()
        assert session_data["tier"] == 499
        assert session_data["target_role"] == "VP Product at Series B Startup"
        print(f"✓ Step 3: Session verified - tier: {session_data['tier']}")
        
        print("\n✓ Complete v3.1 simplified flow test passed!")
    
    def test_flow_with_linkedin(self):
        """Test flow with optional LinkedIn upload"""
        resume_pdf = create_test_pdf("resume")
        linkedin_pdf = create_test_pdf("linkedin")
        
        files = {
            'resume': ('test_resume.pdf', resume_pdf, 'application/pdf'),
            'linkedin': ('linkedin.pdf', linkedin_pdf, 'application/pdf')
        }
        data = {
            'target_role': 'Director of Product',
            'mobile_number': '+91 8765432109'
        }
        
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        assert upload_data["linkedin_provided"] == True
        print(f"✓ Flow with LinkedIn: linkedin_provided={upload_data['linkedin_provided']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
