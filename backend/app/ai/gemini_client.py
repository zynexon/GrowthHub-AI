"""Google Gemini client wrapper."""
import google.generativeai as genai
from flask import current_app
from typing import Dict, Any


class GeminiClient:
    """Wrapper for Google Gemini API calls."""
    
    def __init__(self):
        self.api_key = current_app.config.get('GOOGLE_GEMINI_API_KEY')
        if self.api_key:
            genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def predict_churn(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict customer churn probability."""
        prompt = f"""
        Analyze this customer data and predict churn risk:
        
        Customer: {customer_data.get('company')}
        Last Active: {customer_data.get('last_active')}
        Engagement Score: {customer_data.get('engagement_score', 'Unknown')}
        Support Tickets: {customer_data.get('support_tickets', 0)}
        Plan: {customer_data.get('plan', 'Unknown')}
        
        Provide JSON response:
        {{
            "churn_risk": "<high/medium/low>",
            "probability": <0-1>,
            "key_factors": ["factor1", "factor2"],
            "recommended_actions": ["action1", "action2"]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            return {
                'success': True,
                'result': response.text
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def match_talent_to_job(self, talent_profile: Dict, job_requirements: Dict) -> Dict[str, Any]:
        """Match talent to job requirements."""
        prompt = f"""
        Match this talent profile to job requirements:
        
        Talent Skills: {', '.join(talent_profile.get('skills', []))}
        Experience: {talent_profile.get('experience', 'Unknown')}
        
        Job Requirements: {', '.join(job_requirements.get('required_skills', []))}
        Job Type: {job_requirements.get('type')}
        
        Provide JSON response:
        {{
            "match_score": <0-100>,
            "strengths": ["strength1", "strength2"],
            "gaps": ["gap1", "gap2"],
            "recommendation": "<hire/interview/reject>"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            return {
                'success': True,
                'result': response.text
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }    
    def generate_text(self, prompt: str) -> str:
        """Generate text response from a prompt."""
        if not self.api_key:
            raise ValueError("GOOGLE_GEMINI_API_KEY not configured")
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API error: {e}")
            raise


# Create singleton instance
gemini_client = None

def get_gemini_client():
    """Get or create Gemini client instance."""
    global gemini_client
    if gemini_client is None:
        gemini_client = GeminiClient()
    return gemini_client