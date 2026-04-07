import asyncio
import json
import os

import websockets
from firebase_admin import firestore as admin_firestore, auth as admin_auth

DEVICE_SECRET = os.environ.get("ESP32_DEVICE_SECRET", "changeme")

connected_devices: dict[str, websockets.WebSocketServerProtocol] = {}


async def handle_esp32(websocket, path):
    """Handle a new ESP32 WebSocket connection."""
    db = admin_firestore.client()
    uid = None
    try:
        # Step 1: Expect auth message {"secret": "...", "uid": "..."}
        auth_msg = json.loads(await asyncio.wait_for(websocket.recv(), timeout=10))
        if auth_msg.get("secret") != DEVICE_SECRET:
            await websocket.send(json.dumps({"error": "Unauthorized"}))
            return

        uid = auth_msg.get("uid")
        if not uid:
            await websocket.send(json.dumps({"error": "Missing uid"}))
            return

        connected_devices[uid] = websocket
        await websocket.send(json.dumps({"status": "connected"}))

        # Step 2: Listen for commands from ESP32
        async for raw in websocket:
            try:
                msg = json.loads(raw)
                action = msg.get("action")

                if action == "session_complete":
                    duration = int(msg.get("duration", 25))
                    duration = max(1, min(duration, 60))
                    # Write session to Firestore — let Cloud Function handle validation
                    db.collection("esp32_sessions").add({
                        "uid": uid,
                        "duration_minutes": duration,
                        "completed_at": admin_firestore.SERVER_TIMESTAMP,
                    })
                elif action == "ping":
                    await websocket.send(json.dumps({"pong": True}))
            except json.JSONDecodeError:
                pass

    except (websockets.exceptions.ConnectionClosed, asyncio.TimeoutError):
        pass
    finally:
        if uid and uid in connected_devices:
            del connected_devices[uid]


async def push_timer_state(uid: str, timer_state: dict):
    """Called when Firestore timer state changes — push to connected ESP32."""
    ws = connected_devices.get(uid)
    if ws:
        try:
            await ws.send(json.dumps(timer_state))
        except Exception:
            pass


def start_bridge(host="0.0.0.0", port=8765):
    start_server = websockets.serve(handle_esp32, host, port)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
