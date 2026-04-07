import functions_framework
from firebase_admin import initialize_app, firestore as admin_firestore
from services.leaderboard import validate_leaderboard_entry, rebuild_cache
import flask

initialize_app()


@functions_framework.cloud_event
def on_leaderboard_write(cloud_event):
    """Firestore trigger: fires when any leaderboard/{uid} document is written.
    Validates + clamps the data, then rebuilds the cache.
    """
    data = cloud_event.data
    uid = data["value"]["name"].split("/")[-1]

    db = admin_firestore.client()
    doc_ref = db.collection("leaderboard").document(uid)
    doc = doc_ref.get()
    if not doc.exists:
        return

    cleaned = validate_leaderboard_entry(doc.to_dict())
    doc_ref.set(cleaned, merge=True)
    rebuild_cache()


@functions_framework.http
def get_leaderboard(request: flask.Request) -> flask.Response:
    """HTTP GET /get_leaderboard
    Returns the cached top-50 leaderboard. Falls back to a live query if cache is empty.
    Query param: ?field=weeklyFocusMinutes|weeklySessions|streak (default: weeklyFocusMinutes)
    """
    from firebase_admin import firestore as admin_firestore

    db = admin_firestore.client()
    field = request.args.get("field", "weeklyFocusMinutes")
    if field not in ("weeklyFocusMinutes", "weeklySessions", "streak"):
        field = "weeklyFocusMinutes"

    cache_doc = db.collection("leaderboard_cache").document("weekly").get()
    if cache_doc.exists:
        rows = cache_doc.to_dict().get("rows", [])
        rows.sort(key=lambda r: r.get(field, 0), reverse=True)
        response = flask.jsonify({"rows": rows, "fromCache": True})
    else:
        rebuild_cache()
        response = flask.jsonify({"rows": [], "fromCache": False})

    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@functions_framework.http
def validate_session(request: flask.Request) -> flask.Response:
    """POST /validate_session
    Body JSON: { uid, duration_minutes, completed_at }
    Called by the frontend after each completed session.
    Returns 200 {"valid": true} or 400 {"valid": false, "reason": "..."}
    """
    from services.sessions import validate_and_record_session
    from firebase_admin import auth as admin_auth

    # Verify Firebase ID token from Authorization header
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return flask.jsonify({"valid": False, "reason": "Unauthorized"}), 401

    try:
        id_token = auth_header.split("Bearer ")[1]
        decoded = admin_auth.verify_id_token(id_token)
        uid_from_token = decoded["uid"]
    except Exception:
        return flask.jsonify({"valid": False, "reason": "Invalid token"}), 401

    body = request.get_json(silent=True) or {}
    uid = body.get("uid", "")

    # Ensure user can only validate their own sessions
    if uid != uid_from_token:
        return flask.jsonify({"valid": False, "reason": "UID mismatch"}), 403

    duration = int(body.get("duration_minutes", 0))
    completed_at = str(body.get("completed_at", ""))

    valid, reason = validate_and_record_session(uid, duration, completed_at)
    if valid:
        response = flask.jsonify({"valid": True})
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response, 200
    else:
        response = flask.jsonify({"valid": False, "reason": reason})
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response, 400


@functions_framework.cloud_event
def archive_weekly(cloud_event):
    """Cloud Scheduler trigger — runs every Sunday at midnight UTC.
    For each user doc, copies current weeklyActivity to users/{uid}/history/{weekKey}.
    Also prunes weeklyActivity entries older than 90 days.
    """
    from firebase_admin import firestore as admin_firestore
    from datetime import datetime, timezone, timedelta

    db = admin_firestore.client()
    week_key = datetime.now(timezone.utc).strftime("%Y-W%W")
    cutoff = (datetime.now(timezone.utc) - timedelta(days=90)).strftime("%Y-%m-%d")

    users = db.collection("users").stream()
    for user_doc in users:
        uid = user_doc.id
        data = user_doc.to_dict() or {}
        weekly_activity = data.get("weeklyActivity", [])

        if weekly_activity:
            # Archive current week
            db.collection("users").document(uid).collection("history").document(week_key).set({
                "weeklyActivity": weekly_activity,
                "archivedAt": datetime.now(timezone.utc),
            })

            # Prune entries older than 90 days
            pruned = [a for a in weekly_activity if a.get("date", "") >= cutoff]
            if len(pruned) != len(weekly_activity):
                db.collection("users").document(uid).set(
                    {"weeklyActivity": pruned}, merge=True
                )


@functions_framework.http
def esp32_auth_token(request: flask.Request) -> flask.Response:
    """POST /esp32_auth_token
    Body: { "device_secret": "...", "uid": "..." }
    Returns a Firebase Custom Token for the ESP32 to use with Firebase Auth.
    """
    import os
    from firebase_admin import auth as admin_auth

    body = request.get_json(silent=True) or {}
    if body.get("device_secret") != os.environ.get("ESP32_DEVICE_SECRET", "changeme"):
        return flask.jsonify({"error": "Unauthorized"}), 401

    uid = body.get("uid", "")
    if not uid:
        return flask.jsonify({"error": "Missing uid"}), 400

    custom_token = admin_auth.create_custom_token(uid)
    response = flask.jsonify({"token": custom_token.decode()})
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response, 200
