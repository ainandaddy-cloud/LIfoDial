import logging
import httpx
from backend.config import settings

logger = logging.getLogger(__name__)

async def notify_booking(clinic_name: str, doctor_name: str, specialization: str, slot_time: str, patient_masked: str, appt_id: str):
    """
    Sends a formatted booking confirmation to the telegram clinic group using a Telegram Bot.
    """
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        logger.warning("Telegram token or chat ID not set. Skipping Telegram notification.")
        return

    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    
    text_content = f"""🏥 <b>New Appointment Booked</b>
    
Clinic: {clinic_name}
Doctor: Dr. {doctor_name} ({specialization})
Time: {slot_time}
Patient: {patient_masked}
ID: #{str(appt_id)[:8]}"""

    payload = {
        "chat_id": settings.telegram_chat_id,
        "text": text_content,
        "parse_mode": "HTML"
    }

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(url, json=payload, timeout=5.0)
            if res.status_code != 200:
                logger.error(f"Telegram API failed: {res.text}")
            else:
                logger.info("Successfully sent booking notification to Telegram.")
    except Exception as e:
        # Never let Telegram failure break a booking.
        logger.error(f"Error sending Telegram notification: {e}")
