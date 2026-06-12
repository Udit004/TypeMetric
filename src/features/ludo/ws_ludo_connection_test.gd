extends Node

# Godot 4 GDScript
# Simple WS connection tester to validate backend <-> Godot WebSocket connectivity.
#
# Backend endpoint (no auth for now): ws://<host>:<port>/ludo-ws-test
# Optional: you can still pass a token param if you later add auth; backend test socket ignores auth for now.

var ws: WebSocketPeer = WebSocketPeer.new()

var _sent_ping: bool = false

# Declare packet handler state explicitly to avoid Variant-typed inference warnings.


@export var ws_url: String = "ws://localhost:5000/ws?test=ludo"



func _ready() -> void:
	print("[LudoWS-Test] Connecting to: ", ws_url)
	ws = WebSocketPeer.new()

	var err := ws.connect_to_url(ws_url)
	print("[LudoWS-Test] connect_to_url returned: ", err)
	if err != OK:
		print("[LudoWS-Test] connect_to_url error: ", err)
		return


func _process(_delta: float) -> void:
	# Poll socket events
	ws.poll()

	var state := ws.get_ready_state()
	# Debug state transitions
	if state == WebSocketPeer.STATE_OPEN:

		# If open, send ping once
		if not _sent_ping:
			_sent_ping = true
			_send({"type": "ludo:test:ping"})
			print("[LudoWS-Test] WS open -> sent ping")


	# Read messages
	while ws.get_available_packet_count() > 0:
		var packet := ws.get_packet()
		var text := packet.get_string_from_utf8()
		print("[LudoWS-Test] data: ", text)
		_handle_message_text(text)

func _handle_message_text(text: String) -> void:
	# For now, keep parsing super simple: avoid inferred Variant typing issues.
	# Testing-only mode: do not parse JSON at all.
	# Only string-match the raw incoming message to avoid strict typing/parsing warnings.
	if text.find("ludo:test:pong") != -1:
		print("[LudoWS-Test] pong received -> connection OK")
		return
	if text.find("ludo:test:ready") != -1:
		print("[LudoWS-Test] ready received")
		return
	if text.find("ludo:test:error") != -1:
		print("[LudoWS-Test] server error")
		return

	print("[LudoWS-Test] unhandled message: ", text)





func _send(obj: Dictionary) -> void:
	var json := JSON.stringify(obj)
	ws.put_packet(json.to_utf8_buffer())

func _exit_tree() -> void:
	if ws:
		ws.close()

