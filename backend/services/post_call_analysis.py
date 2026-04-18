import json

# Mock Gemini for post-call
class MockGemini:
    async def analyze(self, prompt: str) -> str:
        return json.dumps({
            "summary": "Patient requested cardiology appointment. Dr. Suresh Menon booked for 11 AM today.",
            "sentiment": "positive",
            "intent_handled": "booking",
            "resolution": "resolved",
            "doctor_requested": "Dr. Suresh Menon",
            "booking_successful": True,
            "key_issues": [],
            "suggested_improvement": "None"
        })

gemini = MockGemini()

def format_transcript(transcript_json):
    return str(transcript_json)

async def analyze_call(call_log) -> dict:
    """
    Runs after every call. Inspired by Retell post-call analysis.
    """
    transcript_text = format_transcript(getattr(call_log, 'transcript_json', call_log))
    
    analysis_str = await gemini.analyze(f"""
    Analyze this clinic call transcript and return JSON:
    {{
        "summary": "2 sentence summary of what happened",
        "sentiment": "positive|neutral|negative",
        "intent_handled": "booking|inquiry|cancellation|emergency|unclear",
        "resolution": "resolved|unresolved|transferred",
        "doctor_requested": "specialty or doctor name or null",
        "booking_successful": true/false,
        "key_issues": ["list of problems if any"],
        "suggested_improvement": "one suggestion for AI"
    }}
    Transcript: {transcript_text}
    """)
    
    analysis = json.loads(analysis_str)
    
    # In reality: await update_call_log(call_log.id, post_call_analysis=analysis)
    return analysis
