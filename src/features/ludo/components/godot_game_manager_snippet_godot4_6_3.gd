# Paste into: res://scripts/game_manager.gd (Godot 4.6.3)
# Add this script as an Autoload single (Project Settings -> Autoload).

extends Node

var player_count := 2
var game_mode := ""
var room_id := ""

# Store JWT here for future REST calls
var jwt_token: String = ""

func _ready() -> void:
	jwt_token = _read_jwt_from_browser()
	if jwt_token != "":
		print("[GameManager] JWT loaded. Length:", jwt_token.length())
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

