extends Node

# Network mode for Ludo board: keep the board logic unchanged for OFFLINE.
# In ONLINE mode, the board should:
# - send dice roll request to backend
# - receive authoritative dice result + token positions broadcast by backend
#
# NOTE: This script only provides a small API (emit signals + helper methods).
# You still need to call these methods from your board.gd.

enum Mode { OFFLINE, ONLINE }

@export var mode: Mode = Mode.OFFLINE

## WebSocket url for ONLINE mode
## Change as needed (example uses the /ws endpoint with test=ludo).
@export var ws_url: String = "ws://localhost:5000/ws?test=ludo"

signal dice_result_received(dice_value: int)
signal tokens_state_received(tokens_by_player: Dictionary)
signal connected()
signal disconnected()

var _ws: WebSocketPeer
var _sent: bool = false

func _ready() -> void:
	_ws = WebSocketPeer.new()
	if mode == Mode.OFFLINE:
		return

	var err := _ws.connect_to_url(ws_url)
	if err != OK:
		push_error("Network WS connect_to_url failed: %s" % str(err))
		return

func _process(_delta: float) -> void:
	if mode == Mode.OFFLINE:
		return

	_ws.poll()

	var state := _ws.get_ready_state()
	if state == WebSocketPeer.STATE_OPEN and not _sent:
		_sent = true
		emit_signal("connected")

		# Some backends might immediately send connection:ready. We just listen.

	# Read packets
	while _ws.get_available_packet_count() > 0:
		var packet := _ws.get_packet()
		var text := packet.get_string_from_utf8()
		_handle_message(text)

func _handle_message(text: String) -> void:
	# Keep it simple and avoid strict JSON typing warnings.
	# This parser assumes backend messages use: { type: "...", payload: {...} }
	if text.find("connection:ready") != -1:
		return

	if text.find("ludo:test:pong") != -1:
		return

	# Dice result (to be defined by your backend later)
	if text.find("ludo:dice:result") != -1:
		# Fallback: try parsing JSON minimally
		var parsed := JSON.parse_string(text)
		if typeof(parsed) == TYPE_DICTIONARY:
			var payload := (parsed as Dictionary).get("payload", {})
			var dv := payload.get("dice_value", 0)
			signal_emit("dice_result_received", int(dv))
		return

	# Tokens broadcast (to be defined by your backend later)
	if text.find("ludo:tokens:state") != -1:
		var parsed2 := JSON.parse_string(text)
		if typeof(parsed2) == TYPE_DICTIONARY:
			var payload2 := (parsed2 as Dictionary).get("payload", {})
			var tokens_by_player := payload2.get("tokens_by_player", {})
			signal_emit("tokens_state_received", tokens_by_player)
		return

func signal_emit(signal_name: StringName, args) -> void:
	# Godot doesn't allow dynamic signal signature typing; keep helper.
	# args is expected to match the signal payload.
	emit_signal(signal_name, args)

func request_dice_roll(dice_request: Dictionary) -> void:
	# Call this from board.gd when user presses dice in ONLINE mode.
	if mode != Mode.ONLINE:
		return
	if _ws.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return

	# Backend contract placeholder:
	# { type: "ludo:dice:roll", payload: { player_color: "RED", ... } }
	var msg := {
		"type": "ludo:dice:roll",
		"payload": dice_request,
	}

	var json := JSON.stringify(msg)
	_ws.put_packet(json.to_utf8_buffer())

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
	var json := JSON.stringify(msg)
	_ws.put_packet(json.to_utf8_buffer())

func close() -> void:
	if _ws:
		_ws.close()


