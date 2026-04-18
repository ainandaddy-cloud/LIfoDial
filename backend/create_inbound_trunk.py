# create_inbound_trunk.py
import asyncio
import os
from dotenv import load_dotenv
from livekit import api

load_dotenv()

async def main():
    url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")

    if not all([url, api_key, api_secret]):
        print("❌ Missing LiveKit credentials in .env")
        return

    lk = api.LiveKitAPI(
        url=url,
        api_key=api_key,
        api_secret=api_secret,
    )

    try:
        trunk = await lk.sip.create_sip_inbound_trunk(
            api.CreateSIPInboundTrunkRequest(
                trunk=api.SIPInboundTrunkInfo(
                    name="test-trunk",
                    numbers=["+10000000000"], # Dummy testing number
                    auth_username="test_user",
                    auth_password="test_password",
                )
            )
        )
        print(f"✅ Inbound trunk created: {trunk.sip_trunk_id}")

        rule = await lk.sip.create_sip_dispatch_rule(
            api.CreateSIPDispatchRuleRequest(
                rule=api.SIPDispatchRule(
                    dispatch_rule_individual=api.SIPDispatchRuleIndividual(room_prefix="call-")
                ),
                trunk_ids=[trunk.sip_trunk_id],
                agent_name="inbound-agent", # Matches agent_name in agent.py
            )
        )
        print(f"✅ Dispatch rule created: {rule.sip_dispatch_rule_id}")
        print("\n🚀 Setup complete! Now you can test by joining a room starting with 'call-' in your LiveKit console.")

    except Exception as e:
        print(f"❌ Error during setup: {e}")

if __name__ == "__main__":
    asyncio.run(main())
