import json
import logging
from backend.config import settings

logger = logging.getLogger(__name__)

async def extract_intent(text: str, session_context: dict) -> dict:
    """Extracts intention and entities from STT text.
    intent options: book_appointment / confirm_booking / cancel / general_query / unclear
    """
    logger.info(f"🤔 [Gemini] Analyzing: '{text}'")
    
    # In full PROD, we hit Gemini 1.5 API. Using Phase 3 structured NLP mock:
    lower_text = text.lower()
    intent = "unclear"
    specialization = None
    preferred_time = None
    
    if "cardiologist" in lower_text or "heart" in lower_text:
        intent = "book_appointment"
        specialization = "Cardiology"
    elif "dentist" in lower_text or "teeth" in lower_text:
        intent = "book_appointment"
        specialization = "Dentistry"
    elif "yes" in lower_text or "book it" in lower_text:
        intent = "confirm_booking"
        # We assume the time is chosen; hardcoded to first slot if not explicitly stated
        preferred_time = "9:00 AM" if "9" in lower_text else "11:00 AM"
    elif "cancel" in lower_text:
        intent = "cancel"
    
    return {
        "intent": intent,
        "specialization": specialization,
        "preferred_time": preferred_time,
        "language": "en"
    }

async def generate_response(intent_data: dict, session_context: dict) -> str:
    """Uses LLM to write a natural language response dynamically based on HIS data."""
    intent = intent_data.get("intent")
    
    if intent == "book_appointment":
        doc_name = session_context.get("pending_doctor_name")
        slots = session_context.get("pending_slots", [])
        if not doc_name:
            return "I'm sorry, I couldn't find a doctor for that specialization at the moment."
        
        slots_str = ", ".join(slots[:2]) + ", or " + slots[2] if len(slots) > 2 else " or ".join(slots)
        return f"I can book you with {doc_name}. They have available slots at {slots_str}. Which time works for you?"
        
    elif intent == "confirm_booking":
        booking = session_context.get("confirmed_booking")
        if booking:
            doc_name = booking.get("doctor_name", "the doctor")
            time = booking.get("slot_time", "your selected time")
            return f"Excellent. I have confirmed your appointment with {doc_name} at {time}. You will receive an SMS confirmation shortly."
        return "Excellent. I have confirmed your booking."
        
    elif intent == "cancel":
        return "Okay, I will cancel your appointment. Let me know if you need to reschedule."
        
    else:
        return "I'm sorry, could you please repeat that?"

async def quick_classify(text: str, prompt: str) -> str:
    return "en"
