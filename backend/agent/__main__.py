from .pipeline import entrypoint
from livekit.agents import cli, WorkerOptions
from dotenv import load_dotenv

if __name__ == "__main__":
    load_dotenv()  # Ensure LIVEKIT_URL etc are loaded
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
