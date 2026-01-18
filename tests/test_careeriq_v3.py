"""
CareerIQ v3.0 Backend API Tests
Tests the new lead capture flow, optional LinkedIn upload, and tiered analysis endpoints.
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
        c.drawString(100, 750, "John Doe - Software Engineer")
        c.setFont("Helvetica", 12)
        y = 720
        content = [
            "Email: john.doe@example.com | Phone: +1-555-123-4567",
            "",
            "PROFESSIONAL SUMMARY",
            "Experienced software engineer with 5+ years of experience in full-stack development.",
            "Proficient in Python, JavaScript, React, Node.js, and cloud technologies.",
            "Strong background in building scalable web applications and microservices.",
            "",
            "WORK EXPERIENCE",
            "",
            "Senior Software Engineer - TechCorp Inc. (2021 - Present)",
            "- Led development of customer-facing web applications serving 1M+ users",
            "- Designed and implemented RESTful APIs using Python FastAPI",
            "- Mentored junior developers and conducted code reviews",
            "",
            "Software Engineer - StartupXYZ (2019 - 2021)",
            "- Developed React-based frontend applications",
            "- Built backend services using Node.js and Express",
            "",
            "EDUCATION",
            "Bachelor of Science in Computer Science - State University (2019)",
            "",
            "SKILLS",
            "Languages: Python, JavaScript, TypeScript, SQL",
            "Frameworks: React, FastAPI, Node.js, Django"
        ]
    else:  # linkedin
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, 750, "LinkedIn Profile - John Doe")
        c.setFont("Helvetica", 12)
        y = 720
        content = [
            "Software Engineer at TechCorp Inc.",
            "",
            "About:",
            "Passionate software engineer with expertise in building scalable applications.",
            "I love solving complex problems and mentoring junior developers.",
            "",
            "Experience:",
            "Senior Software Engineer at TechCorp Inc.",
            "Leading development of enterprise applications.",
            "",
            "Skills:",
            "Python, JavaScript, React, Node.js, AWS, Docker"
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
    """Test health and root endpoints - v3.0 version check"""
    
    def test_health_endpoint_returns_v3(self):
        """Health endpoint should return version 3.0"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "3.0"
        print(f"✓ Health endpoint returns version: {data['version']}")
    
    def test_root_endpoint_returns_v3(self):
        """Root endpoint should return version 3.0"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["version"] == "3.0"
        print(f"✓ Root endpoint returns version: {data['version']}")


class TestLeadCaptureEndpoint:
    """Test the new /api/capture-lead endpoint (v3.0)"""
    
    def test_capture_lead_success(self):
        """Should capture lead with all required fields"""
        payload = {
            "full_name": "TEST_John Doe",
            "phone": "+919876543210",
            "email": "test_john@example.com",
            "current_role": "Software Engineer at TechCorp",
            "target_role": "Senior Software Engineer at FAANG",
            "linkedin_provided": False,
            "consent_communication": True
        }
        response = requests.post(f"{BASE_URL}/api/capture-lead", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "lead_id" in data
        assert data["status"] == "captured"
        assert "message" in data
        print(f"✓ Lead captured successfully with lead_id: {data['lead_id']}")
    
    def test_capture_lead_missing_name(self):
        """Should fail when full_name is missing"""
        payload = {
            "phone": "+919876543210",
            "email": "test@example.com",
            "current_role": "Engineer",
            "target_role": "Senior Engineer"
        }
        response = requests.post(f"{BASE_URL}/api/capture-lead", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Correctly rejects missing full_name")
    
    def test_capture_lead_invalid_email(self):
        """Should fail with invalid email format"""
        payload = {
            "full_name": "TEST_Invalid Email",
            "phone": "+919876543210",
            "email": "invalid-email",
            "current_role": "Engineer",
            "target_role": "Senior Engineer"
        }
        response = requests.post(f"{BASE_URL}/api/capture-lead", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Correctly rejects invalid email format")
    
    def test_capture_lead_short_name(self):
        """Should fail when name is too short"""
        payload = {
            "full_name": "A",  # Too short
            "phone": "+919876543210",
            "email": "test@example.com",
            "current_role": "Engineer",
            "target_role": "Senior Engineer"
        }
        response = requests.post(f"{BASE_URL}/api/capture-lead", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Correctly rejects name that is too short")


class TestUploadEndpoint:
    """Test the updated /api/upload endpoint (v3.0 - requires lead_id, optional LinkedIn)"""
    
    @pytest.fixture
    def lead_id(self):
        """Create a lead for upload tests"""
        payload = {
            "full_name": "TEST_Upload User",
            "phone": "+919876543210",
            "email": "test_upload@example.com",
            "current_role": "Product Manager",
            "target_role": "Senior Product Manager",
            "linkedin_provided": False,
            "consent_communication": False
        }
        response = requests.post(f"{BASE_URL}/api/capture-lead", json=payload)
        return response.json()["lead_id"]
    
    def test_upload_resume_only(self, lead_id):
        """Should accept resume upload without LinkedIn (v3.0 - LinkedIn optional)"""
        resume_pdf = create_test_pdf("resume")
        
        files = {
            'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')
        }
        data = {'lead_id': lead_id}
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert response.status_code == 200
        result = response.json()
        assert "session_id" in result
        assert result["lead_id"] == lead_id
        assert result["linkedin_provided"] == False
        print(f"✓ Resume uploaded successfully, session_id: {result['session_id']}")
    
    def test_upload_resume_with_linkedin(self, lead_id):
        """Should accept both resume and LinkedIn upload"""
        resume_pdf = create_test_pdf("resume")
        linkedin_pdf = create_test_pdf("linkedin")
        
        files = {
            'resume': ('test_resume.pdf', resume_pdf, 'application/pdf'),
            'linkedin': ('linkedin.pdf', linkedin_pdf, 'application/pdf')
        }
        data = {'lead_id': lead_id}
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert response.status_code == 200
        result = response.json()
        assert result["linkedin_provided"] == True
        print(f"✓ Resume + LinkedIn uploaded, linkedin_provided: {result['linkedin_provided']}")
    
    def test_upload_without_lead_id(self):
        """Should fail when lead_id is missing"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
        assert response.status_code == 422  # Missing required field
        print("✓ Correctly rejects upload without lead_id")
    
    def test_upload_invalid_lead_id(self):
        """Should fail with invalid lead_id"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {'lead_id': 'invalid-lead-id-12345'}
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert response.status_code == 404
        print("✓ Correctly rejects invalid lead_id")


class TestCreateOrderEndpoint:
    """Test the updated /api/create-order endpoint (v3.0 - uses lead_id)"""
    
    @pytest.fixture
    def session_with_lead(self):
        """Create lead and upload files to get session_id"""
        # Create lead
        lead_payload = {
            "full_name": "TEST_Order User",
            "phone": "+919876543210",
            "email": "test_order@example.com",
            "current_role": "Data Analyst",
            "target_role": "Data Scientist",
            "linkedin_provided": False,
            "consent_communication": True
        }
        lead_response = requests.post(f"{BASE_URL}/api/capture-lead", json=lead_payload)
        lead_id = lead_response.json()["lead_id"]
        
        # Upload resume with proper PDF
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {'lead_id': lead_id}
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        session_id = upload_response.json()["session_id"]
        
        return {"lead_id": lead_id, "session_id": session_id}
    
    def test_create_order_tier_499(self, session_with_lead):
        """Should create order for ₹499 tier"""
        payload = {
            "tier": 499,
            "lead_id": session_with_lead["lead_id"]
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "order_id" in data
        assert data["amount"] == 49900  # Amount in paise
        assert data["currency"] == "INR"
        assert data["lead_id"] == session_with_lead["lead_id"]
        print(f"✓ Order created for ₹499 tier, order_id: {data['order_id']}")
    
    def test_create_order_tier_2999(self, session_with_lead):
        """Should create order for ₹2999 tier"""
        payload = {
            "tier": 2999,
            "lead_id": session_with_lead["lead_id"]
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 299900
        print(f"✓ Order created for ₹2999 tier")
    
    def test_create_order_tier_4999(self, session_with_lead):
        """Should create order for ₹4999 tier"""
        payload = {
            "tier": 4999,
            "lead_id": session_with_lead["lead_id"]
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 499900
        print(f"✓ Order created for ₹4999 tier")
    
    def test_create_order_invalid_tier(self, session_with_lead):
        """Should reject invalid tier values"""
        payload = {
            "tier": 999,  # Invalid tier
            "lead_id": session_with_lead["lead_id"]
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 400
        print("✓ Correctly rejects invalid tier value")
    
    def test_create_order_invalid_lead_id(self):
        """Should reject invalid lead_id"""
        payload = {
            "tier": 499,
            "lead_id": "invalid-lead-id"
        }
        response = requests.post(f"{BASE_URL}/api/create-order", json=payload)
        assert response.status_code == 404
        print("✓ Correctly rejects invalid lead_id")


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


class TestReportEndpoint:
    """Test the /api/report endpoint"""
    
    def test_report_not_found(self):
        """Should return 404 for non-existent session"""
        response = requests.get(f"{BASE_URL}/api/report/non-existent-session-id")
        assert response.status_code == 404
        print("✓ Correctly returns 404 for non-existent session")


class TestFullLeadToOrderFlow:
    """Integration test for the complete v3.0 flow: capture-lead -> upload -> create-order"""
    
    def test_complete_flow(self):
        """Test the complete pre-payment flow"""
        # Step 1: Capture Lead
        lead_payload = {
            "full_name": "TEST_Integration User",
            "phone": "+919876543210",
            "email": "test_integration@example.com",
            "current_role": "Marketing Manager at StartupXYZ",
            "target_role": "VP Marketing at Series B Startup",
            "linkedin_provided": False,
            "consent_communication": True
        }
        lead_response = requests.post(f"{BASE_URL}/api/capture-lead", json=lead_payload)
        assert lead_response.status_code == 200
        lead_id = lead_response.json()["lead_id"]
        print(f"✓ Step 1: Lead captured - {lead_id}")
        
        # Step 2: Upload Resume (LinkedIn optional)
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('resume.pdf', resume_pdf, 'application/pdf')}
        data = {'lead_id': lead_id}
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        assert upload_response.status_code == 200
        session_id = upload_response.json()["session_id"]
        assert upload_response.json()["linkedin_provided"] == False
        print(f"✓ Step 2: Resume uploaded - session_id: {session_id}")
        
        # Step 3: Create Order
        order_payload = {"tier": 499, "lead_id": lead_id}
        order_response = requests.post(f"{BASE_URL}/api/create-order", json=order_payload)
        assert order_response.status_code == 200
        order_data = order_response.json()
        assert order_data["order_id"].startswith("order_")
        assert order_data["session_id"] == session_id
        print(f"✓ Step 3: Order created - {order_data['order_id']}")
        
        print("\n✓ Complete v3.0 flow test passed!")


class TestVerifyPaymentEndpoint:
    """Test the /api/verify-payment endpoint structure (cannot test actual payment)"""
    
    def test_verify_payment_missing_fields(self):
        """Should reject payment verification with missing fields"""
        payload = {
            "razorpay_order_id": "order_test123",
            # Missing other required fields
        }
        response = requests.post(f"{BASE_URL}/api/verify-payment", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Correctly rejects incomplete payment verification")


class TestAnalyzeEndpoint:
    """Test the /api/analyze endpoint"""
    
    def test_analyze_without_payment(self):
        """Should reject analysis without completed payment"""
        # Create lead and upload
        lead_payload = {
            "full_name": "TEST_Analyze User",
            "phone": "+919876543210",
            "email": "test_analyze@example.com",
            "current_role": "Engineer",
            "target_role": "Senior Engineer",
            "linkedin_provided": False,
            "consent_communication": False
        }
        lead_response = requests.post(f"{BASE_URL}/api/capture-lead", json=lead_payload)
        lead_id = lead_response.json()["lead_id"]
        
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('resume.pdf', resume_pdf, 'application/pdf')}
        data = {'lead_id': lead_id}
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


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
