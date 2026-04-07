from datetime import datetime, timezone, timedelta
from firebase_admin import firestore as admin_firestore

MAX_SESSIONS_PER_DAY = 20
MAX_DURATION_MINUTES = 60
MIN_DURATION_MINUTES = 1


def validate_and_record_session(uid: str, duration_minutes: int, completed_at_iso: str) -> tuple[bool, str]:
    """Validates a session submission. Returns (is_valid, reason).
    If valid, increments a daily session counter in users/{uid}/session_counts/{today}.
    """
    db = admin_firestore.client()

    # 1. Duration check
    if not (MIN_DURATION_MINUTES <= duration_minutes <= MAX_DURATION_MINUTES):
        return False, f"Invalid duration: {duration_minutes}min"

    # 2. Timestamp freshness check (within 10 minutes of now)
    try:
        completed_at = datetime.fromisoformat(completed_at_iso.replace("Z", "+00:00"))
        age = abs((datetime.now(timezone.utc) - completed_at).total_seconds())
        if age > 600:
            return False, "Timestamp too old or in the future"
    except Exception:
        return False, "Invalid timestamp format"

    # 3. Daily rate limit check using a counter document
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    counter_ref = (
        db.collection("users")
        .document(uid)
        .collection("session_counts")
        .document(today)
    )

    @admin_firestore.transactional
    def check_and_increment(transaction, ref):
        snap = ref.get(transaction=transaction)
        count = snap.get("count") if snap.exists else 0
        if count >= MAX_SESSIONS_PER_DAY:
            return False
        transaction.set(ref, {"count": count + 1, "date": today}, merge=True)
        return True

    allowed = check_and_increment(db.transaction(), counter_ref)
    if not allowed:
        return False, f"Daily session limit ({MAX_SESSIONS_PER_DAY}) reached"

    return True, "ok"
