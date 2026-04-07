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
