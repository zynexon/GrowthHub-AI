"""Google Gemini client wrapper."""
import google.generativeai as genai
from flask import current_app
from typing import Dict, Any, List
import os


class GeminiClient:
    """Wrapper for Google Gemini API calls."""
    
    def __init__(self):
        # Try to get from Flask config first, fallback to os.getenv
        try:
            self.api_key = current_app.config.get('GOOGLE_GEMINI_API_KEY')
            print("[GeminiClient] Loaded API key from Flask config")
        except RuntimeError:
            # No app context, fallback to environment variable
            self.api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
            print("[GeminiClient] Loaded API key from os.getenv")
        
        # Also try direct os.getenv if Flask config was empty
        if not self.api_key:
            self.api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
            print("[GeminiClient] Fallback: Loaded API key from os.getenv")
            
        print(f"[GeminiClient] Initializing with API key: {'SET' if self.api_key else 'NOT SET'}")
        print(f"[GeminiClient] API key length: {len(self.api_key) if self.api_key else 0}")
        
        if not self.api_key:
            print("[GeminiClient] ERROR: GOOGLE_GEMINI_API_KEY environment variable not set!")
            # Don't raise here, let's see what happens
            # raise ValueError("GOOGLE_GEMINI_API_KEY not configured")
            
        if self.api_key:
            # Set as environment variable for the deprecated package
            os.environ['GOOGLE_API_KEY'] = self.api_key
            genai.configure(api_key=self.api_key)
            print("[GeminiClient] Gemini API configured successfully")
        
        # List available models and use the first one that supports generateContent
        try:
            print("[GeminiClient] Attempting to list available models...")
            available_models = genai.list_models()
            print("[GeminiClient] Available models:")
            suitable_model = None
            for model in available_models:
                print(f"  - {model.name} (supports: {model.supported_generation_methods})")
                if 'generateContent' in model.supported_generation_methods and suitable_model is None:
                    suitable_model = model.name
            
            if suitable_model:
                print(f"[GeminiClient] Using model: {suitable_model}")
                self.model = genai.GenerativeModel(suitable_model)
            else:
                print("[GeminiClient] No suitable model found, trying gemini-1.5-flash")
                self.model = genai.GenerativeModel('gemini-1.5-flash')
        except Exception as e:
            print(f"[GeminiClient] Error listing models: {type(e).__name__}: {e}")
            print("[GeminiClient] Defaulting to gemini-1.5-flash")
            try:
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e2:
                print(f"[GeminiClient] Failed to load gemini-1.5-flash: {e2}")
                print("[GeminiClient] Trying gemini-1.5-pro as last resort")
                self.model = genai.GenerativeModel('gemini-1.5-pro')
        
        self.chat_sessions = {}  # Store chat sessions by user ID
    
    def chat_with_data(self, user_id: str, message: str, data_context: Dict[str, Any], conversation_history: List[Dict] = None, data_type: str = 'leads') -> Dict[str, Any]:
        """Chat with AI about the provided data."""
        try:
            print(f"[chat_with_data] Starting chat for user {user_id}, data_type={data_type}")
            print(f"[chat_with_data] API key configured: {bool(self.api_key)}")
            
            # Build context based on data type
            if data_type == 'customers':
                all_customers = data_context.get('all_customers', [])
                print(f"[chat_with_data] Including {len(all_customers)} customers in context")
                
                # Build a structured table of customers
                customers_table = "COMPANY | EMAIL | PLAN | MRR | HEALTH_SCORE | STATUS | CHURN_RISK | EXPANSION\n"
                customers_table += "-" * 90 + "\n"
                for customer in all_customers:
                    customers_table += f"{customer.get('company')} | {customer.get('email')} | {customer.get('plan')} | ${customer.get('mrr', 0):,.2f} | {customer.get('health_score', 0)}/100 | {customer.get('health_status')} | {customer.get('churn_risk_level')} | {'Yes' if customer.get('expansion_opportunity') else 'No'}\n"
                
                context = f"""CRITICAL INSTRUCTION: You are analyzing a specific company's customer health data. You MUST answer questions using ONLY the exact customer data provided in the table below. DO NOT provide general customer success advice.

DATABASE OF CUSTOMERS:
{customers_table}

SUMMARY:
- Total Customers: {data_context.get('total_customers', 0)}
- Healthy: {data_context.get('healthy_count', 0)} | At Risk: {data_context.get('at_risk_count', 0)}
- Expansion Opportunities: {data_context.get('expansion_count', 0)}
- Total MRR: ${data_context.get('total_mrr', 0):,.2f}
- Average Health Score: {data_context.get('avg_health_score', 0):.1f}/100

STRICT RULES:
1. ONLY mention customers that appear in the table above
2. ALWAYS use the exact company names and emails as they appear
3. When asked about "at-risk customers", look at the STATUS and CHURN_RISK columns
4. When asked about expansion opportunities, filter by the EXPANSION column
5. DO NOT say things like "typically" or "usually" - only use the actual data
6. If you mention a health score or MRR, it MUST come from the table above
7. Start your answer by mentioning specific company names from the table

Example:
Question: "Which customers are at risk of churning?"
GOOD Answer: "Based on your data, Acme Corp (acme@example.com) has a health score of 45/100 and high churn risk. TechStart (tech@startup.com) also shows at-risk status with a score of 52/100."
BAD Answer: "To prevent churn, you should focus on improving customer engagement and conducting regular check-ins."

Now answer the user's question using ONLY the customers in the table."""
            
            elif data_type == 'campaigns':
                all_campaigns = data_context.get('all_campaigns', [])
                print(f"[chat_with_data] Including {len(all_campaigns)} campaigns in context")
                
                # Build a structured table of campaigns
                campaigns_table = "CAMPAIGN_NAME | CHANNEL | PERIOD | SPEND | REVENUE | ROI | PERFORMANCE\n"
                campaigns_table += "-" * 80 + "\n"
                for campaign in all_campaigns:
                    campaigns_table += f"{campaign.get('name')} | {campaign.get('channel')} | {campaign.get('period')} | ${campaign.get('spend', 0):,.2f} | ${campaign.get('revenue', 0):,.2f} | {campaign.get('roi_percentage', '0%')} | {campaign.get('performance', 'unknown')}\n"
                
                context = f"""CRITICAL INSTRUCTION: You are analyzing a specific company's marketing campaigns. You MUST answer questions using ONLY the exact campaign data provided in the table below. DO NOT provide general marketing advice.

DATABASE OF CAMPAIGNS:
{campaigns_table}

SUMMARY:
- Total Campaigns: {data_context.get('total_campaigns', 0)}
- Total Spend: ${data_context.get('total_spend', 0):,.2f}
- Total Revenue: ${data_context.get('total_revenue', 0):,.2f}

STRICT RULES:
1. ONLY mention campaigns that appear in the table above
2. ALWAYS use the exact campaign names as they appear (e.g., "Summer Sale Email", "Referral Program")
3. When asked about "best ROI", look at the ROI column and list those specific campaigns
4. When asked about channels, filter by the CHANNEL column
5. DO NOT say things like "typically" or "usually" - only use the actual data
6. If you mention a number, it MUST come from the table above
7. Start your answer by mentioning specific campaign names from the table

Example:
Question: "Which campaigns have the best ROI?"
GOOD Answer: "Based on your data, Summer Sale Email has 933.0% ROI with $3,100 revenue from $300 spend. Referral Program also performs well at 420.0% ROI."
BAD Answer: "To improve ROI, you should focus on email marketing and optimize your campaigns."

Now answer the user's question using ONLY the campaigns in the table."""
            
            else:  # leads
                all_leads = data_context.get('all_leads', [])
                print(f"[chat_with_data] Including {len(all_leads)} leads in context")
                
                # Build a structured table of leads
                leads_table = "LEAD_NAME | EMAIL | COMPANY | SCORE | TEMPERATURE | SOURCE | STATUS\n"
                leads_table += "-" * 80 + "\n"
                for lead in all_leads:
                    leads_table += f"{lead.get('name')} | {lead.get('email')} | {lead.get('company')} | {lead.get('score')} | {lead.get('temperature')} | {lead.get('source')} | {lead.get('status')}\n"
                
                context = f"""CRITICAL INSTRUCTION: You are analyzing a specific company's leads database. You MUST answer questions using ONLY the exact lead data provided in the table below. DO NOT provide general sales advice.

DATABASE OF LEADS:
{leads_table}

SUMMARY:
- Total Leads: {data_context.get('total_leads', 0)}
- Average Score: {data_context.get('avg_score', 0):.1f}
- Hot Leads (80-100): {data_context.get('hot_leads', 0)}
- Warm Leads (50-79): {data_context.get('warm_leads', 0)}
- Cold Leads (0-49): {data_context.get('cold_leads', 0)}

STRICT RULES:
1. ONLY mention leads that appear in the table above
2. ALWAYS use exact names and emails as they appear in the table
3. When asked about "top leads", look at the SCORE column and list those specific people
4. When asked about sources, filter by the SOURCE column
5. DO NOT say things like "typically" or "usually" - only use the actual data
6. If you mention a person or score, it MUST come from the table above
7. Start your answer by mentioning specific lead names from the table

Example:
Question: "Who are my top leads?"
GOOD Answer: "Your top leads are John Smith (john@example.com) with a score of 95, and Jane Doe (jane@company.com) with 88."
BAD Answer: "You should prioritize leads with high engagement scores and focus on warm leads first."

Now answer the user's question using ONLY the leads in the table."""
            
            # Always start fresh session to ensure context is always included
            session_key = f"{user_id}_{data_type}"
            print(f"[chat_with_data] Creating fresh chat session with context for {session_key}")
            
            # ALWAYS include full context with every message to ensure AI uses the data
            full_message = f"{context}\n\nUser Question: {message}"
            print(f"[chat_with_data] Including full data context with message")
            
            print(f"[chat_with_data] Sending message to Gemini...")
            # Use generate_content directly instead of chat to avoid authentication issues
            response = self.model.generate_content(full_message)
            print(f"[chat_with_data] Got response: {response.text[:100]}...")
            
            return {
                'success': True,
                'response': response.text,
                'conversation_id': user_id
            }
            
        except Exception as e:
            print(f"[chat_with_data] ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            error_details = f"{type(e).__name__}: {str(e)}"
            return {
                'success': False,
                'error': error_details,
                'response': f"I'm having trouble analyzing the data right now. Error details: {error_details}"
            }
    
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
        try:
            print("[get_gemini_client] Creating new GeminiClient instance...")
            gemini_client = GeminiClient()
            print("[get_gemini_client] GeminiClient instance created successfully")
        except Exception as e:
            print(f"[get_gemini_client] Failed to create GeminiClient: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    return gemini_client