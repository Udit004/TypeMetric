extends Node

# Network mode for Ludo board: keep the board logic unchanged for OFFLINE.
# In ONLINE mode, the board should:
# - send dice roll request to backend
# - receive authoritative dice result + token positions broadcast by backend
#
# NOTE: This script only provides a small API (emit signals + helper methods).
# You still need to call these methods from your board.gd.

enum Mode { OFFLINE, ONLINE }

@export var mode: Mode = Mode.ONLINE

## WebSocket url for ONLINE mode
## Change as needed (example uses the /ws endpoint with test=ludo).
# @export var ws_url: String = "ws://localhost:5000/ws"
@export var ws_url: String = "wss://type-metric-backend.onrender.com/ws"

signal dice_result_received(dice_value: int)
signal tokens_state_received(tokens_by_player)
signal room_joined(room_state)
signal room_started(room_state)
signal turn_changed(current_turn)
signal token_moved(player_color, token_index, steps)

signal connected()
signal disconnected()

var _ws: WebSocketPeer
var _sent: bool = false

func _ready() -> void:
	print("NETWORK READY")

	print("JWT = ", GameManager.jwt_token)

	print("MODE = ", mode)
	_ws = WebSocketPeer.new()
	if mode == Mode.OFFLINE:
		return

	# In ONLINE mode, connect using JWT stored by GameManager (autoload)
	# GameManager reads window.GODOT_JWT from the browser and keeps it in jwt_token.
	var token := ""
	if GameManager:
		token = GameManager.jwt_token

	if token == "":
		push_error("[LudoNetwork] Missing jwt_token in GameManager; cannot connect to authenticated /ws")
		mode = Mode.OFFLINE
		return

	_ws = WebSocketPeer.new()

	# NOTE: Don't use Uri here (export template may not provide it).
	# This assumes the token is safe to place in a query string.
	var url := ws_url + "?token=" + token

	print("WS URL =", url)

	var err := _ws.connect_to_url(url)

	print("CONNECT RESULT =", err)



func _process(_delta: float) -> void:
	if mode == Mode.OFFLINE:
		return

	_ws.poll()


	var state := _ws.get_ready_state()
	if state == WebSocketPeer.STATE_OPEN and not _sent:
		_sent = true
		emit_signal("connected")

	# Read packets
	while _ws.get_available_packet_count() > 0:
		var packet := _ws.get_packet()
		var text := packet.get_string_from_utf8()
		_handle_message(text)

	# If we queued a join while the socket wasn't open, send it now.
	if state == WebSocketPeer.STATE_OPEN:
		var pending_join = get_meta("__pending_room_join")
		if typeof(pending_join) == TYPE_STRING and pending_join != "":
			print("SEND PENDING ROOM JOIN:", pending_join)
			set_meta("__pending_room_join", "")
			room_join(pending_join)

	print("WS STATE =", state)

	if state == WebSocketPeer.STATE_OPEN:
		print("SOCKET OPEN")


func _handle_message(text: String) -> void:
	# Keep it simple and avoid strict JSON typing warnings.
	# This parser assumes backend messages use: { type: "...", payload: {...} }

	# Room joined
	if text.find("ludo:room:joined") != -1:
		var parsed0 = JSON.parse_string(text)
		if typeof(parsed0) == TYPE_DICTIONARY:
			var payload0 = (parsed0 as Dictionary).get("payload", {})
			var room_state = payload0.get("roomState")
			print("[LudoNetwork] room joined state:", str(room_state))
			emit_signal("room_joined", room_state)

		return

	# Room started
	if text.find("ludo:room:started") != -1:
		print("[LudoNetwork] room started")
		var parsed = JSON.parse_string(text)
		if typeof(parsed) == TYPE_DICTIONARY:
			var payload = (parsed as Dictionary).get("payload", {})
			var room_state = payload.get("roomState", {})
			emit_signal("room_started", room_state)
		return

	# Turn changed
	if text.find("ludo:turn:changed") != -1:
		print("[LudoNetwork] turn changed")
		var parsed = JSON.parse_string(text)
		if typeof(parsed) == TYPE_DICTIONARY:
			var payload = (parsed as Dictionary).get("payload", {})
			var current_turn = payload.get("current_turn", "")
			emit_signal("turn_changed", current_turn)
		return

	# Token moved
	if text.find("ludo:token:moved") != -1:
		var parsed = JSON.parse_string(text)
		if typeof(parsed) == TYPE_DICTIONARY:
			var payload = (parsed as Dictionary).get("payload", {})
			var player_color = payload.get("player_color", "")
			var token_index = payload.get("token_index", 0)
			var steps = payload.get("steps", 0)
			emit_signal("token_moved", player_color, int(token_index), int(steps))
		return

	if text.find("connection:ready") != -1:
		return

	if text.find("ludo:test:pong") != -1:
		return

	# Dice result
	if text.find("ludo:dice:result") != -1:
		var parsed = JSON.parse_string(text)
		if typeof(parsed) == TYPE_DICTIONARY:
			var payload = (parsed as Dictionary).get("payload", {})
			var dv_any = payload.get("dice_value", 0)
			var dv_int := int(dv_any)
			emit_signal("dice_result_received", dv_int)


		return

	# Tokens broadcast
	if text.find("ludo:tokens:state") != -1:
		var parsed2 = JSON.parse_string(text)
		if typeof(parsed2) == TYPE_DICTIONARY:
			var payload2 = (parsed2 as Dictionary).get("payload", {})
			var tokens_by_player_any = payload2.get("tokens_by_player", {})
			# tokens_by_player might be of dynamic type depending on backend payload.
			# Emit it as Variant to avoid strict type inference errors.
			emit_signal("tokens_state_received", tokens_by_player_any)

		return

func room_create(room_id: String) -> void:
	
	print("ROOM CREATE SENT:", room_id)
	if mode != Mode.ONLINE:
		return
	if _ws.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return

	var msg := {
		"type": "ludo:room:create",
		"payload": {"roomId": room_id},
	}
	_ws.put_packet(JSON.stringify(msg).to_utf8_buffer())

func room_start(room_id: String) -> void:
	print("ROOM START SENT:", room_id)
	if mode != Mode.ONLINE:
		return
	if _ws.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return

	var msg := {
		"type": "ludo:room:start",
		"payload": {"roomId": room_id},
	}
	_ws.put_packet(JSON.stringify(msg).to_utf8_buffer())

func room_join(room_id: String) -> void:
	print("ROOM JOIN SENT:", room_id)
	print("JOIN MODE=", mode, " WS_READY=", _ws.get_ready_state())

	# If called too early, queue it until the websocket becomes OPEN.
	if mode != Mode.ONLINE:
		print("ROOM JOIN ABORT: not online")
		return

	if _ws.get_ready_state() != WebSocketPeer.STATE_OPEN:
		print("ROOM JOIN QUEUED: ws not open yet")
		# store pending join
		var prev := get_meta("__pending_room_join")
		# keep simple: override latest room_id
		set_meta("__pending_room_join", room_id)
		return

	var msg := {
		"type": "ludo:room:join",
		"payload": {"roomId": room_id},
	}
	print("ROOM JOIN PACKET:", JSON.stringify(msg))
	_ws.put_packet(JSON.stringify(msg).to_utf8_buffer())



func request_dice_roll(dice_request: Dictionary) -> void:
	# Call this from board.gd when user presses dice in ONLINE mode.
	if mode != Mode.ONLINE:
		return
	if _ws.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return

	# Add roomId explicitly
	var payload = dice_request.duplicate()
	payload["roomId"] = GameManager.room_id

	var msg := {
		"type": "ludo:dice:roll",
		"payload": payload,
	}
	_ws.put_packet(JSON.stringify(msg).to_utf8_buffer())

func send_token_move(player_color: String, token_index: int, steps: int) -> void:
	if mode != Mode.ONLINE:
		return
	if _ws.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return

	var msg := {
		"type": "ludo:token:move",
		"payload": {
			"roomId": GameManager.room_id,
			"player_color": player_color,
			"token_index": token_index,
			"steps": steps
		},
	}
	_ws.put_packet(JSON.stringify(msg).to_utf8_buffer())

func send_turn_end() -> void:
	if mode != Mode.ONLINE:
		return
	if _ws.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return

	var msg := {
		"type": "ludo:turn:end",
		"payload": {
			"roomId": GameManager.room_id
		},
	}
	_ws.put_packet(JSON.stringify(msg).to_utf8_buffer())

func send_tokens_snapshot(tokens_by_player: Dictionary) -> void:
	# Not used yet; for future when you want client-side prediction / validation.
	if mode != Mode.ONLINE:
		return
	if _ws.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return

	var msg := {
		"type": "ludo:tokens:client-snapshot",
		"payload": {"tokens_by_player": tokens_by_player},
	}
	_ws.put_packet(JSON.stringify(msg).to_utf8_buffer())

func close() -> void:
	if _ws:
		_ws.close()
