from enum import Enum

class CallState(Enum):
    GREETING = "greeting"
    INTENT_DETECTION = "intent_detection"
    SPECIALIZATION = "specialization"
    SLOT_SELECTION = "slot_selection"
    CONFIRMATION = "confirmation"
    BOOKING = "booking"
    FAREWELL = "farewell"
    FALLBACK = "fallback"
    TRANSFER = "transfer"  # emergency cases

TRANSITIONS = {
    CallState.GREETING: [CallState.INTENT_DETECTION, CallState.FALLBACK],
    CallState.INTENT_DETECTION: [CallState.SPECIALIZATION, CallState.TRANSFER, CallState.FALLBACK],
    CallState.SPECIALIZATION: [CallState.SLOT_SELECTION, CallState.FALLBACK],
    CallState.SLOT_SELECTION: [CallState.CONFIRMATION, CallState.FALLBACK],
    CallState.CONFIRMATION: [CallState.BOOKING, CallState.SLOT_SELECTION],
    CallState.BOOKING: [CallState.FAREWELL],
}

STATE_TIMEOUTS = {
    CallState.INTENT_DETECTION: 10,  # seconds before asking again
    CallState.SLOT_SELECTION: 15,
    CallState.CONFIRMATION: 10,
}

MAX_RETRIES_PER_STATE = 2  # after 2 failed attempts -> fallback
