"""OpenAI client wrapper."""
from openai import OpenAI
from flask import current_app
from typing import Dict, Any, List


class OpenAIClient:
    """Wrapper for OpenAI API calls."""
    
    def __init__(self):
        self.client = OpenAI(api_key=current_app.config['OPENAI_API_KEY'])
    
    def score_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Score a lead using GPT."""
        prompt = f"""
        Analyze this lead and provide a score from 0-100 based on quality and conversion potential.
        
        Lead Data:
        - Email: {lead_data.get('email')}
        - Source: {lead_data.get('source')}
        - Company: {lead_data.get('company', 'Unknown')}
        - Engagement: {lead_data.get('engagement', 'None')}
        
        Provide response in JSON format:
        {{
            "score": <0-100>,
            "reasoning": "<brief explanation>",
            "recommended_action": "<next step>"
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a sales lead scoring expert."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            return {
                'success': True,
                'result': response.choices[0].message.content
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text (reviews, feedback, etc.)."""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Analyze sentiment and return JSON with sentiment (positive/negative/neutral) and confidence (0-1)."},
                    {"role": "user", "content": text}
                ],
                response_format={"type": "json_object"}
            )
            
            return {
                'success': True,
                'result': response.choices[0].message.content
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_follow_up(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized follow-up message."""
        prompt = f"""
        Generate a personalized follow-up email for this lead:
        
        Name: {lead_data.get('name', 'there')}
        Company: {lead_data.get('company', 'your company')}
        Source: {lead_data.get('source')}
        
        Keep it professional, brief, and engaging.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a sales communication expert."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            return {
                'success': True,
                'message': response.choices[0].message.content
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
