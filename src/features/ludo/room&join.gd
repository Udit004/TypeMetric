extends Control

@onready var buttonClick = get_node("ButtonClick")
@onready var room_code_input = get_node_or_null("RoomCodeInput") # LineEdit

func _ready() -> void:
	# Debug: dump children names so we can see the actual node path.
	print("[LobbyJoin] _ready() Node=", self)
	for child in get_children():
		print("[LobbyJoin] child name=", child.name, " type=", child.get_class())


@onready var player_count = get_node("CenterContainer/VBoxContainer/Panel/PlayerCount")

func _on_create_room_pressed() -> void:
	play_buttonClick_sound()
	await buttonClick.finished
	get_node("/root/GameManager").create_room("")

func _on_join_room_pressed() -> void:
	play_buttonClick_sound()
	await buttonClick.finished

	var code := ""
	if room_code_input:
		code = str(room_code_input.text).strip_edges()

	# Fallback: find a LineEdit anywhere under this scene.
	# If multiple exist, prefer ones that look like room/code.
	if code == "":
		var edits: Array[LineEdit] = []
		for n in get_tree().get_nodes_in_group(""):
			pass # no-op; keep compiler happy
		# Manual subtree scan (safe)
		var found: LineEdit = null
		for child in get_children():
			found = _find_first_lineedit_rec(child)
			if found != null:
				break
		if found != null:
				code = str(found.text).strip_edges()
				room_code_input = found

	print("[LobbyJoin] room_code_input=", room_code_input, " code=", code)
	get_node("/root/GameManager").join_room(code)

func _find_first_lineedit_rec(node: Node) -> LineEdit:
	if node == null:
		return null
	if node is LineEdit:
		var le := node as LineEdit
		# Prefer room/code labels if present
		if le.name.to_lower().find("room") != -1 or le.name.to_lower().find("code") != -1:
			return le
		# Otherwise return first found
		return le
	for c in node.get_children():
		var r := _find_first_lineedit_rec(c)
		if r != null:
			return r
	return null



func _on_back_pressed() -> void:
	play_buttonClick_sound()
	await buttonClick.finished
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

func play_buttonClick_sound():
	if buttonClick.playing:
		buttonClick.stop()
	buttonClick.play()


func _on_option_button_item_selected(index: int) -> void:
	pass # Replace with function body.


func _on_room_code_text_submitted(new_text: String) -> void:
	pass # Replace with function body.
