# Paste into: res://scripts/game_manager.gd (Godot 4.6.3)
# Add this script as an Autoload single (Project Settings -> Autoload).

extends Node

var player_count := 2
var game_mode := ""
var room_id := ""


# Store JWT here for future REST calls
var jwt_token: String = ""
var local_player_color := ""

# Backend health/auth test configuration
# If your backend base url is different, adjust this.
@export var api_base_url: String = "http://localhost:5000/api/v1"
#@export var api_base_url: String = "https://type-metric-backend.onrender.com/api/v1"
@export var auth_test_path: String = "/auth/me"

func _ready() -> void:
	jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM2MGU0YWVmODA5NjE3ZmZmYzFiOTUiLCJpYXQiOjE3ODE3MTIyMjMsImV4cCI6MTc4MjMxNzAyM30.Ftwe_T0UfdUVlDQjaAa3oZbnkHXO2dzvDGhFlL0vFy8"
	#jwt_token = _read_jwt_from_browser()
	if jwt_token != "":
		print("[GameManager] JWT loaded. Length:", jwt_token.length())
		# Test backend auth immediately after token is loaded
		_test_auth_with_backend()
	else:
		print("[GameManager] JWT not found (window.GODOT_JWT is empty).")



func _read_jwt_from_browser() -> String:
	# In some Godot 4.6.x HTML5 export templates, JavaScriptBridge.get_var() is not available.
	# Use eval() instead.
	if not Engine.has_singleton("JavaScriptBridge"):
		return ""

	var token_var = JavaScriptBridge.eval("window.GODOT_JWT || ''")
	if token_var == null:
		return ""

	return str(token_var)



func get_authorization_header() -> PackedStringArray:
	if jwt_token == "":
		return PackedStringArray([])
	return PackedStringArray(["Authorization: Bearer " + jwt_token])

func clear_jwt() -> void:
	jwt_token = ""


# Make a simple authenticated request to verify the JWT works.
# Uses Godot's HTTPRequest (works in HTML5 export).
func _test_auth_with_backend() -> void:
	if jwt_token == "":
		print("[GameManager] Auth test skipped: empty jwt_token")
		return

	var http := HTTPRequest.new()
	add_child(http)

	var url := api_base_url.strip_edges() + auth_test_path
	print("[GameManager] Auth test GET:", url)

	var headers := ["Authorization: Bearer " + jwt_token]

	var err := http.request(
		url,
		headers,
		HTTPClient.METHOD_GET
	)

	if err != OK:
		print("[GameManager] HTTP request() failed. err=", err)
		http.queue_free()
		return

	http.timeout = 10.0
	http.request_completed.connect(_on_auth_test_completed.bind(http))


func _on_auth_test_completed(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray, http: HTTPRequest) -> void:
	var text := ""
	if body.size() > 0:
		text = body.get_string_from_utf8()

	print("[GameManager] Auth test completed. result=", result, " status=", response_code)
	if text != "":
		print("[GameManager] Auth test response body:", text)
	else:
		print("[GameManager] Auth test response body: <empty>")

	http.queue_free()


# --- LUDO CREATE / JOIN (REST) ---

@export var ludo_game_scene_path: String = "res://scenes/ludo_game.tscn"

var is_host: bool = false

@export var default_player_count: int = 2

# Store selected player count so your next scene can read it.
func create_room(desired_room_id: String = "", players: int = default_player_count) -> void:
	player_count = players



	if jwt_token == "":
		print("[GameManager] create_room aborted: empty jwt_token")
		return

	var http := HTTPRequest.new()
	add_child(http)

	var url := api_base_url.strip_edges() + "/ludo/rooms"
	print("[GameManager] create_room POST:", url)

	var headers := [
		"Authorization: Bearer " + jwt_token,
		"Content-Type: application/json",
	]

	var payload := {}
	if desired_room_id.strip_edges() != "":
		payload["roomId"] = desired_room_id.strip_edges()
	payload["player_count"] = players


	var body_str := JSON.stringify(payload)
	# Godot 4.6 expects argument 4 for request() to be a String.
	# Provide JSON payload as String.
	var err := http.request(
		url,
		headers,
		HTTPClient.METHOD_POST,
		body_str
	)





	if err != OK:
		print("[GameManager] create_room request() failed. err=", err)
		http.queue_free()
		return

	http.timeout = 10.0
	http.request_completed.connect(_on_create_room_completed.bind(http))


func _on_create_room_completed(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray, http: HTTPRequest) -> void:
	var text := body.get_string_from_utf8()
	print("[GameManager] create_room completed. result=", result, " status=", response_code)
	if text != "":
		print("[GameManager] create_room response:", text)

	if response_code < 200 or response_code >= 300:
		http.queue_free()
		return

	var parsed: Variant = JSON.parse_string(text)
	if typeof(parsed) != TYPE_DICTIONARY:
		http.queue_free()
		return

	var dict := parsed as Dictionary
	room_id = str(dict.get("roomId", ""))
	# backend returns hostId; we can treat creator as host
	is_host = true

	print("[GameManager] room_id set:", room_id)
	
	if Engine.has_singleton("JavaScriptBridge"):
		JavaScriptBridge.eval("if (window.onLudoRoomJoined) window.onLudoRoomJoined('" + room_id + "');")
		
	http.queue_free()
	_go_to_lobby()


func join_room(target_room_id: String) -> void:
	if jwt_token == "":
		print("[GameManager] join_room aborted: empty jwt_token")
		return

	var rid := target_room_id.strip_edges()
	if rid == "":
		print("[GameManager] join_room aborted: empty room id")
		return

	var http := HTTPRequest.new()
	add_child(http)

	var url := api_base_url.strip_edges() + "/ludo/rooms/" + rid + "/join"
	print("[GameManager] join_room POST:", url)

	var headers := [
		"Authorization: Bearer " + jwt_token,
		"Content-Type: application/json",
	]

	# backend doesn't require roomId in body for join
	var payload := {}
	var body_str := JSON.stringify(payload)

	var err := http.request(
		url,
		headers,
		HTTPClient.METHOD_POST,
		body_str
	)


	if err != OK:
		print("[GameManager] join_room request() failed. err=", err)
		http.queue_free()
		return

	http.timeout = 10.0
	http.request_completed.connect(_on_join_room_completed.bind(http))


func _on_join_room_completed(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray, http: HTTPRequest) -> void:
	var text := body.get_string_from_utf8()
	print("[GameManager] join_room completed. result=", result, " status=", response_code)
	if text != "":
		print("[GameManager] join_room response:", text)

	if response_code < 200 or response_code >= 300:
		http.queue_free()
		return

	var parsed: Variant = JSON.parse_string(text)
	if typeof(parsed) != TYPE_DICTIONARY:
		http.queue_free()
		return

	var dict := parsed as Dictionary
	room_id = str(dict.get("roomId", ""))
	is_host = false

	print("[GameManager] joined room_id:", room_id)
	
	if Engine.has_singleton("JavaScriptBridge"):
		JavaScriptBridge.eval("if (window.onLudoRoomJoined) window.onLudoRoomJoined('" + room_id + "');")
		
	http.queue_free()
	_go_to_lobby()


func _go_to_lobby() -> void:
	if room_id == "":
		print("[GameManager] _go_to_ludo_game aborted: room_id empty")
		return

	# After switching to the ludo scene, the Network node will be ready and
	# board.gd will connect its signals. We still need to tell the backend
	# which ludo room this websocket belongs to.
	# We do that from a deferred call so the scene tree is available.
	get_tree().change_scene_to_file("res://scenes/Lobby.tscn")
