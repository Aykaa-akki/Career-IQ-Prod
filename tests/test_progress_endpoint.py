"""
CareerIQ Progress Endpoint Tests (v3.1)
Tests the NEW /api/report/{session_id}/progress endpoint for real-time progress tracking.

Key features being tested:
- Progress endpoint returns correct data structure: {status, current_step, assembly_state, progress_percent, error}
- Progress endpoint returns 404 for non-existent sessions
- Progress percent calculation: Steps 1-4 = 20% each (max 80%), Step 5 caps at 80% until assembly_state='ready_for_ui_finalize'
- Progress endpoint returns current_step and assembly_state from MongoDB
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
        c.drawString(100, 750, "TEST_Progress_User - Senior Product Manager")
        c.setFont("Helvetica", 12)
        y = 720
        content = [
            "Email: test.progress@example.com | Phone: +91-9876543210",
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
            "",
            "EDUCATION",
            "MBA - Indian Institute of Management (2016)",
            "B.Tech Computer Science - IIT Delhi (2014)",
            "",
            "SKILLS",
            "Product Strategy, Roadmap Planning, Agile/Scrum, SQL, Data Analysis",
        ]
    else:
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, 750, "LinkedIn Profile - Test Progress User")
        c.setFont("Helvetica", 12)
        y = 720
        content = [
            "Senior Product Manager at TechStartup Inc.",
            "",
            "About:",
            "Product leader passionate about building products that solve real problems.",
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


class TestProgressEndpointStructure:
    """Test the /api/report/{session_id}/progress endpoint response structure"""
    
    @pytest.fixture
    def session_id(self):
        """Create a session via upload for progress tests"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'Head of Product',
            'mobile_number': '+91 9876543210'
        }
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        return response.json()["session_id"]
    
    def test_progress_endpoint_returns_correct_structure(self, session_id):
        """Progress endpoint should return {status, current_step, assembly_state, progress_percent, error}"""
        response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify all required fields are present
        assert "status" in data, "Missing 'status' field"
        assert "current_step" in data, "Missing 'current_step' field"
        assert "assembly_state" in data, "Missing 'assembly_state' field"
        assert "progress_percent" in data, "Missing 'progress_percent' field"
        assert "error" in data, "Missing 'error' field"
        
        print(f"✓ Progress endpoint returns correct structure: {data}")
    
    def test_progress_endpoint_returns_404_for_nonexistent_session(self):
        """Progress endpoint should return 404 for non-existent sessions"""
        response = requests.get(f"{BASE_URL}/api/report/non-existent-session-id/progress")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
        
        print("✓ Progress endpoint returns 404 for non-existent session")
    
    def test_progress_endpoint_initial_state(self, session_id):
        """Progress endpoint should return initial state for newly uploaded session"""
        response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
        assert response.status_code == 200
        
        data = response.json()
        
        # For a newly uploaded session (before analysis starts)
        assert data["status"] == "uploaded", f"Expected 'uploaded', got {data['status']}"
        assert data["current_step"] == 0, f"Expected current_step=0, got {data['current_step']}"
        assert data["assembly_state"] == "not_started", f"Expected 'not_started', got {data['assembly_state']}"
        assert data["progress_percent"] == 0, f"Expected progress_percent=0, got {data['progress_percent']}"
        assert data["error"] is None, f"Expected error=None, got {data['error']}"
        
        print(f"✓ Progress endpoint returns correct initial state: {data}")


class TestProgressEndpointDataTypes:
    """Test the data types returned by the progress endpoint"""
    
    @pytest.fixture
    def session_id(self):
        """Create a session via upload for progress tests"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'VP Product',
            'mobile_number': '+91 9876543210'
        }
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        return response.json()["session_id"]
    
    def test_progress_percent_is_integer(self, session_id):
        """progress_percent should be an integer"""
        response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
        data = response.json()
        
        assert isinstance(data["progress_percent"], int), f"progress_percent should be int, got {type(data['progress_percent'])}"
        assert 0 <= data["progress_percent"] <= 100, f"progress_percent should be 0-100, got {data['progress_percent']}"
        
        print(f"✓ progress_percent is valid integer: {data['progress_percent']}")
    
    def test_current_step_is_integer(self, session_id):
        """current_step should be an integer"""
        response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
        data = response.json()
        
        assert isinstance(data["current_step"], int), f"current_step should be int, got {type(data['current_step'])}"
        assert 0 <= data["current_step"] <= 5, f"current_step should be 0-5, got {data['current_step']}"
        
        print(f"✓ current_step is valid integer: {data['current_step']}")
    
    def test_assembly_state_is_valid_string(self, session_id):
        """assembly_state should be a valid string value"""
        response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
        data = response.json()
        
        valid_states = ["not_started", "in_progress", "ready_for_ui_finalize"]
        assert data["assembly_state"] in valid_states, f"assembly_state should be one of {valid_states}, got {data['assembly_state']}"
        
        print(f"✓ assembly_state is valid: {data['assembly_state']}")
    
    def test_status_is_valid_string(self, session_id):
        """status should be a valid string value"""
        response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
        data = response.json()
        
        valid_statuses = ["uploaded", "processing", "completed", "failed"]
        assert data["status"] in valid_statuses, f"status should be one of {valid_statuses}, got {data['status']}"
        
        print(f"✓ status is valid: {data['status']}")


class TestProgressEndpointWithExistingSessions:
    """Test progress endpoint with sessions in various states"""
    
    def test_progress_for_uploaded_session(self):
        """Test progress for a session that has been uploaded but not started analysis"""
        # Create a new session
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'Engineering Manager',
            'mobile_number': '+91 9876543210'
        }
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        session_id = upload_response.json()["session_id"]
        
        # Check progress
        progress_response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
        assert progress_response.status_code == 200
        
        data = progress_response.json()
        assert data["status"] == "uploaded"
        assert data["current_step"] == 0
        assert data["assembly_state"] == "not_started"
        assert data["progress_percent"] == 0
        
        print(f"✓ Progress for uploaded session: {data}")
    
    def test_progress_endpoint_multiple_calls(self):
        """Test that progress endpoint can be called multiple times (polling behavior)"""
        # Create a session
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'Product Lead',
            'mobile_number': '+91 9876543210'
        }
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        session_id = upload_response.json()["session_id"]
        
        # Poll multiple times
        for i in range(3):
            response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
            assert response.status_code == 200, f"Poll {i+1} failed with status {response.status_code}"
            data = response.json()
            assert "status" in data
            assert "current_step" in data
            assert "progress_percent" in data
        
        print("✓ Progress endpoint handles multiple polling calls correctly")


class TestProgressPercentCalculation:
    """Test the progress percent calculation logic
    
    Expected behavior:
    - Steps 1-4: each step = 20% when complete (0-80%)
    - Step 5: caps at 80% until assembly_state = 'ready_for_ui_finalize'
    - When completed and ready_for_ui_finalize: 100%
    """
    
    def test_progress_percent_initial_is_zero(self):
        """Initial progress should be 0%"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'CTO',
            'mobile_number': '+91 9876543210'
        }
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        session_id = upload_response.json()["session_id"]
        
        progress_response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
        data = progress_response.json()
        
        assert data["progress_percent"] == 0, f"Initial progress should be 0%, got {data['progress_percent']}%"
        print(f"✓ Initial progress is 0%")
    
    def test_progress_percent_bounds(self):
        """Progress percent should always be between 0 and 100"""
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'Director of Engineering',
            'mobile_number': '+91 9876543210'
        }
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        session_id = upload_response.json()["session_id"]
        
        progress_response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
        data = progress_response.json()
        
        assert 0 <= data["progress_percent"] <= 100, f"Progress should be 0-100, got {data['progress_percent']}"
        print(f"✓ Progress percent is within bounds: {data['progress_percent']}%")


class TestProgressEndpointIntegration:
    """Integration tests for progress endpoint with other endpoints"""
    
    def test_progress_after_order_creation(self):
        """Progress should still work after order is created"""
        # Create session
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'VP Engineering',
            'mobile_number': '+91 9876543210'
        }
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        session_id = upload_response.json()["session_id"]
        
        # Create order
        order_payload = {"tier": 2999, "session_id": session_id}
        order_response = requests.post(f"{BASE_URL}/api/create-order", json=order_payload)
        assert order_response.status_code == 200
        
        # Check progress - should still work
        progress_response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
        assert progress_response.status_code == 200
        
        data = progress_response.json()
        assert data["status"] == "uploaded"  # Still uploaded, not processing yet
        assert data["current_step"] == 0
        
        print(f"✓ Progress endpoint works after order creation: {data}")
    
    def test_progress_and_report_endpoints_consistency(self):
        """Progress endpoint and report endpoint should return consistent status"""
        # Create session
        resume_pdf = create_test_pdf("resume")
        files = {'resume': ('test_resume.pdf', resume_pdf, 'application/pdf')}
        data = {
            'target_role': 'Chief Product Officer',
            'mobile_number': '+91 9876543210'
        }
        upload_response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        session_id = upload_response.json()["session_id"]
        
        # Get progress
        progress_response = requests.get(f"{BASE_URL}/api/report/{session_id}/progress")
        progress_data = progress_response.json()
        
        # Get report
        report_response = requests.get(f"{BASE_URL}/api/report/{session_id}")
        report_data = report_response.json()
        
        # Status should be consistent
        assert progress_data["status"] == report_data["status"], \
            f"Status mismatch: progress={progress_data['status']}, report={report_data['status']}"
        
        print(f"✓ Progress and report endpoints return consistent status: {progress_data['status']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
