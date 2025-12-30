"""Google Gemini client wrapper."""
import google.generativeai as genai
from flask import current_app
from typing import Dict, Any


class GeminiClient:
    """Wrapper for Google Gemini API calls."""
    
    def __init__(self):
        genai.configure(api_key=current_app.config['GOOGLE_GEMINI_API_KEY'])
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
