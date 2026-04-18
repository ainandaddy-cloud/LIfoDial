# In-memory session store
# Works identically to Redis for local testing
# Replace with real Redis only when deploying

_sessions: dict = {}

async def get_session(tenant_id: str, 
                      call_id: str) -> dict | None:
    key = f"{tenant_id}:{call_id}"
    return _sessions.get(key)

async def save_session(tenant_id: str, 
                       call_id: str, 
                       data: dict) -> None:
    key = f"{tenant_id}:{call_id}"
    _sessions[key] = data

async def delete_session(tenant_id: str, 
                         call_id: str) -> None:
    key = f"{tenant_id}:{call_id}"
    _sessions.pop(key, None)

async def append_history(tenant_id: str,
                         call_id: str,
                         role: str, 
                         text: str) -> None:
    key = f"{tenant_id}:{call_id}"
    if key in _sessions:
        if "context" not in _sessions[key]:
            _sessions[key]["context"] = {}
        history = _sessions[key].get(
            "context", {}
        ).get("history", [])
        history.append({"role": role, "text": text})
        # Keep last 6 turns only
        if len(history) > 6:
            history = history[-6:]
        _sessions[key]["context"]["history"] = history

print("[OK] Session store ready (in-memory)")
