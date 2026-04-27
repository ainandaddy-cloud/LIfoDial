
import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.getcwd())

from backend.db import init_db, engine, Base
from sqlalchemy import text

async def check_db():
    print("Checking database connection...")
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            print("Connection successful.")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    print("Running init_db()...")
    try:
        await init_db()
        print("init_db() completed.")
    except Exception as e:
        print(f"init_db() failed: {e}")

    print("Checking tables...")
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'"))
        tables = [row[0] for row in result.fetchall()]
        print(f"Tables in public schema: {tables}")

if __name__ == "__main__":
    asyncio.run(check_db())
