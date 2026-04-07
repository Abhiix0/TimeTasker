from google.cloud import firestore
from datetime import datetime, timezone

db = firestore.Client()

MAX_WEEKLY_FOCUS = 4200   # 60 min/session × 10 sessions/day × 7 days — hard ceiling
MAX_STREAK = 3650         # 10 years


def validate_leaderboard_entry(data: dict) -> dict:
    """Clamp all numeric fields to sane ranges. Return cleaned dict."""
    return {
        "weeklyFocusMinutes": max(0, min(int(data.get("weeklyFocusMinutes", 0)), MAX_WEEKLY_FOCUS)),
        "weeklySessions":     max(0, min(int(data.get("weeklySessions", 0)), 700)),
        "streak":             max(0, min(int(data.get("streak", 0)), MAX_STREAK)),
        "displayName":        str(data.get("displayName", "Anonymous"))[:40],
        "initials":           str(data.get("initials", "?"))[:2].upper(),
        "showOnLeaderboard":  bool(data.get("showOnLeaderboard", True)),
        "updatedAt":          datetime.now(timezone.utc),
    }


def rebuild_cache():
    """Read top 50 visible leaderboard entries, write to leaderboard_cache/weekly."""
    entries_ref = db.collection("leaderboard")
    query = (
        entries_ref
        .where("showOnLeaderboard", "==", True)
        .order_by("weeklyFocusMinutes", direction=firestore.Query.DESCENDING)
        .limit(50)
    )
    docs = query.stream()
    rows = []
    for doc in docs:
        d = doc.to_dict()
        rows.append({
            "uid":                doc.id,
            "displayName":        d.get("displayName", "Anonymous"),
            "initials":           d.get("initials", "?"),
            "weeklyFocusMinutes": d.get("weeklyFocusMinutes", 0),
            "weeklySessions":     d.get("weeklySessions", 0),
            "streak":             d.get("streak", 0),
        })
    db.collection("leaderboard_cache").document("weekly").set({
        "rows": rows,
        "generatedAt": datetime.now(timezone.utc),
    })
