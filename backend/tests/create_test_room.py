import uuid
import httpx
import logging
import asyncio
from livekit import api
from backend.config import settings
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)

async def main():
    if not settings.livekit_url or not settings.livekit_api_key:
        logging.error("❌ LiveKit API credentials are not set in .env! Open .env and add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.")
        return

    room_name = f"test_room_{uuid.uuid4().hex[:8]}"
    participant_identity = "browser_user"
    
    # 1. Hit the webhook API
    # Since Postgres might not be running locally, we will just make the request. 
    # If it fails, we still generate the JWT token so the browser agent test can continue.
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post("http://127.0.0.1:8001/voice/incoming", json={
                "called_number": "+919000000000", # demo tenant
                "from_number": "+918888888888",
                "call_id": room_name
            })
            if res.status_code != 200:
                logging.warning(f"Failed to hit /voice/incoming: {res.text} (Is postgres/uvicorn running?)")
            else:
                logging.info(f"✅ Session created in Redis: {res.json()}")
    except Exception as e:
        logging.warning(f"⚠️ Could not connect to FastAPI server at http://127.0.0.1:8001. Error: {e}")
        
    # 2. Get LiveKit Token for the browser user
    token = api.AccessToken(settings.livekit_api_key, settings.livekit_api_secret) \
        .with_identity(participant_identity) \
        .with_name("Test Browser Patient") \
        .with_grants(api.VideoGrants(room_join=True, room=room_name)) \
        .to_jwt()
           
    # 3. Print Browser Join URL using LiveKit Meet
    meet_url = f"https://meet.livekit.io/custom?liveKitUrl={settings.livekit_url}&token={token}"
    
    print("\n" + "="*70)
    print("🚀 BROWSER TEST URL GENERATED")
    print("="*70)
    print("Join this URL in Chrome/Safari to test the Active Agent audio bridge:")
    print(f"\n{meet_url}\n")
    print("1. Allow microphone access.")
    print("2. Speak to test the agent pipeline (it will echo your voice back).")
    print("3. Ensure the agent is running (`python -m backend.agent.pipeline dev`)")
    print("="*70 + "\n")

if __name__ == "__main__":
    asyncio.run(main())
