extends Node2D

const PATH_LENGTH = 50
const SAFE_CELLS = [7, 12, 20, 25, 33, 38, 46, 51]

# Start cell indices for each player color
const START_CELLS = {
	"RED": 38,
	"BLUE": 25,
	"GREEN": 51,
	"YELLOW": 12
}

const DICE_HOME_PANEL_OFFSETS = {
	"RED": Vector2(-140, 70),
	"GREEN": Vector2(-140, -110),
	"YELLOW": Vector2(40, -110),
	"BLUE": Vector2(40, 70)
}


# ----------------------------
# Online/Offline enum
# ----------------------------
enum Mode { OFFLINE, ONLINE }

@export var mode: Mode = Mode.ONLINE

# Assign this in Inspector (drag your Network manager node), or leave null and set via %NetworkName.
@export var network_path: NodePath
var network: Node = null

@onready var dice_panel = _find_first_existing_node([
	"../DicePanel",
	"../dicePanel",
	"DicePanel",
	"dicePanel"
]) as Control
@onready var dice_panel_container = _find_first_existing_node([
	"../DicePanel/VBoxContainer",
	"../dicePanel/VBoxContainer",
	"DicePanel/VBoxContainer",
	"dicePanel/VBoxContainer"
])
@onready var turn_label_panel = _find_first_existing_node([
	"../TurnLabel",
	"../LabelPanel",
	"../labelPanel",
	"TurnLabel",
	"LabelPanel",
	"labelPanel"
]) as Control

@onready var current_player_label = _find_child_by_name(turn_label_panel, "CurrentPlayerLabel") as Label
@onready var dice_value_label = _find_child_by_name(dice_panel, "DiceValueLabel") as Label
@onready var dice_image = _find_child_by_name(dice_panel, "DiceImage")
@onready var roll_dice_button = _find_child_by_name(dice_panel, "RollDiceButton")
@onready var status_label = _find_child_by_name(dice_panel, "StatusLabel") as Label
@onready var dice_audio = get_parent().get_node("DiceAudio")
@onready var move_audio = get_parent().get_node("MoveAudio")

var players = {}
var active_turn_order = []
var current_player = ""

var dice_value = 0
var dice_faces = []
var waiting_for_player_choice = false
var is_token_moving = false
var is_processing_turn = false
var consecutive_sixes = 0
var is_game_over = false

var valid_tokens = []
var cells = []

# ONLINE mode state
var _online_waiting_for_server: bool = false

func _find_first_existing_node(paths: Array[String]) -> Node:
	for path in paths:
		var node = get_node_or_null(path)
		if node != null:
			return node
	return null

func _find_child_by_name(root: Node, child_name: String) -> Node:
	if root == null:
		return null
	if root.has_node(child_name):
		return root.get_node(child_name)
	for child in root.get_children():
		if child.name == child_name:
			return child
		var nested_child = _find_child_by_name(child, child_name)
		if nested_child != null:
			return nested_child
	return null

func _get_home_center(home_positions: Array) -> Vector2:
	if home_positions.is_empty():
		return global_position

	var center := Vector2.ZERO
	for home_position in home_positions:
		center += home_position
	return center / float(home_positions.size())

func _set_dice_face(face_index: int) -> void:
	if dice_image == null:
		return
	if face_index < 0 or face_index >= dice_faces.size():
		return

	if dice_image is TextureButton:
		dice_image.texture_normal = dice_faces[face_index]
	elif dice_image is TextureRect:
		dice_image.texture = dice_faces[face_index]

func _set_dice_interaction_enabled(enabled: bool) -> void:
	var alpha := 1.0 if enabled else 0.5

	if dice_image != null:
		dice_image.modulate.a = alpha
		if dice_image is BaseButton:
			dice_image.disabled = not enabled

	if roll_dice_button != null:
		roll_dice_button.modulate.a = alpha
		if roll_dice_button is BaseButton:
			roll_dice_button.disabled = not enabled

func get_selected_players() -> Array:
	match GameManager.player_count:
		2:
			return ["RED", "GREEN"]

		3:
			return ["RED", "GREEN", "YELLOW"]

		4:
			return ["RED", "GREEN", "YELLOW", "BLUE"]

		_:
			return ["RED", "GREEN"]




func _ready():
	randomize()
	
	print(
		"Players:",
		GameManager.player_count
	)

	network = get_node_or_null("/root/NetworkManager")
	if network == null:
		push_error("NetworkManager Autoload not found!")

	if GameManager.game_mode == "ONLINE":
		mode = Mode.ONLINE
	else:
		mode = Mode.OFFLINE

	if mode == Mode.ONLINE:
		_init_online()

	for i in range(1, 7):
		dice_faces.append(
			load("res://assets/dice/dice_" + str(i) + ".png")
		)

	# Build main path cells
	for child in $PathCells.get_children():
		cells.append(child)
	cells.sort_custom(
		func(a, b):
			return a.name.naturalnocasecmp_to(b.name) < 0
	)

	# Configure players dynamically based on the nodes present in the scene
	var player_colors = get_selected_players()
	var token_prefixes = {
		"RED": "RedToken_",
		"BLUE": "BlueToken_",
		"GREEN": "GreenToken_",
		"YELLOW": "YellowToken_"
	}
	var home_paths = {
		"RED": "HomeCells/RedHomeCells/RedHome_",
		"BLUE": "HomeCells/BlueHomeCells/BlueHome_",
		"GREEN": "HomeCells/GreenHomeCells/GreenHome_",
		"YELLOW": "HomeCells/YellowHomeCells/YellowHome_"
	}
	var final_paths = {
		"RED": "FinalLanes/RedFinalLane",
		"BLUE": "FinalLanes/BlueFinalLane",
		"GREEN": "FinalLanes/GreenFinalLane",
		"YELLOW": "FinalLanes/YellowFinalLane"
	}
	var texture_paths = {
		"RED": "res://assets/token/redToken.png",
		"BLUE": "res://assets/token/blueToken.png",
		"GREEN": "res://assets/token/greenToken.png",
		"YELLOW": "res://assets/token/yellowToken.png"
	}

	for color in player_colors:
		var prefix = token_prefixes[color]
		# Check if the player tokens exist in the scene tree (using index 0 as indicator)
		if has_node(prefix + "0"):
			var tokens = []
			var home_positions = []

			# Load texture
			var texture = null
			if ResourceLoader.exists(texture_paths[color]):
				texture = load(texture_paths[color])

			# Initialize tokens & homes
			for i in range(4):
				var token_node = get_node(prefix + str(i))
				tokens.append(token_node)

				token_node.player_color = color
				token_node.token_index = i
				token_node.is_in_home = true
				token_node.current_cell = -1
				token_node.steps_travelled = 0
				token_node.completed = false

				if texture:
					token_node.set_texture(texture)

				# Get home marker position
				var home_node = get_node(home_paths[color] + str(i))
				home_positions.append(home_node.global_position)
				token_node.global_position = home_node.global_position

				# Connect clicked signal
				if not token_node.token_clicked.is_connected(_on_token_clicked):
					token_node.token_clicked.connect(_on_token_clicked)

			# Initialize final lane cells
			var final_cells = []
			var final_lane_node = get_node_or_null(final_paths[color])
			if final_lane_node:
				for child in final_lane_node.get_children():
					final_cells.append(child)
				final_cells.sort_custom(
					func(a, b):
						return a.name.naturalnocasecmp_to(b.name) < 0
				)

			players[color] = {
				"start_cell": START_CELLS[color],
				"tokens": tokens,
				"final_lane": final_cells,
				"home_positions": home_positions,
				"ui_anchor": _get_home_center(home_positions)
			}
			active_turn_order.append(color)
			print("Active player registered: ", color)

	# Set up initial player
	if active_turn_order.size() > 0:
		current_player = active_turn_order[0]
	else:
		push_error("No players found in scene!")

	# Dynamically add a label to show the local player's color
	if mode == Mode.ONLINE and GameManager.local_player_color != "":
		var color_label = Label.new()
		color_label.text = "You are: " + GameManager.local_player_color
		color_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		match GameManager.local_player_color:
			"RED":
				color_label.modulate = Color.RED
			"GREEN":
				color_label.modulate = Color.GREEN
			"BLUE":
				color_label.modulate = Color.DODGER_BLUE
			"YELLOW":
				color_label.modulate = Color.GOLD
		if dice_panel_container != null:
			dice_panel_container.add_child(color_label)
		elif dice_panel != null:
			dice_panel.add_child(color_label)

	if roll_dice_button != null and roll_dice_button.has_signal("pressed"):
		if not roll_dice_button.pressed.is_connected(_on_roll_dice_button_pressed):
			roll_dice_button.pressed.connect(_on_roll_dice_button_pressed)

	if dice_image != null and dice_image.has_signal("pressed"):
		if not dice_image.pressed.is_connected(_on_dice_image_pressed):
			dice_image.pressed.connect(_on_dice_image_pressed)

	update_turn_ui()



func _init_online() -> void:
	if network == null:
		push_error("ONLINE mode selected but Network node not found.")
		mode = Mode.OFFLINE
		return

	# Connect signals if available
	if network.has_signal("dice_result_received"):
		network.dice_result_received.connect(_on_online_dice_result_received)
	if network.has_signal("tokens_state_received"):
		network.tokens_state_received.connect(_on_online_tokens_state_received)
	if network.has_signal("token_moved"):
		network.token_moved.connect(_on_online_token_moved)
	if network.has_signal("turn_changed"):
		network.turn_changed.connect(_on_online_turn_changed)

func _on_roll_dice_button_pressed():
	roll_dice()

func roll_dice():
	if is_game_over:
		print("Game is over")
		return

	if is_processing_turn:
		print("Dice roll ignored: turn is currently processing")
		return

	if mode == Mode.ONLINE and current_player != GameManager.local_player_color:
		print("Not your turn to roll! Waiting for ", current_player)
		set_status("Waiting for " + current_player)
		return

	if waiting_for_player_choice:
		print("Choose a token first")
		set_status("Choose a token")
		return
	
	
	
	if is_token_moving:
		print("Token is moving")
		set_status("token is moving")
		return

	is_processing_turn = true

	# OFFLINE: keep your logic unchanged
	play_dice_sound()
	if mode == Mode.OFFLINE:
		do_offline_dice_roll()
		return

	# ONLINE: ask server for dice value (authoritative)
	if mode == Mode.ONLINE:
		_online_waiting_for_server = true
		_dice_ui_reset()
		# Do not run local animate_dice / randi. Server decides.
		if network != null and network.has_method("request_dice_roll"):
			network.request_dice_roll({
				"player_color": current_player
			})
		else:
			push_error("Network.request_dice_roll not available")
		# prevent further local actions until server responds
		return

func do_offline_dice_roll() -> void:
	# Your original offline flow
	set_status("Dice is rolling")
	await animate_dice()
	dice_value = randi_range(1, 6)
	if dice_value_label != null:
		dice_value_label.text = str(dice_value)
	_set_dice_face(dice_value - 1)
	print("Dice Rolled for ", current_player, ": ", dice_value)

	# Handle consecutive sixes rule
	if dice_value == 6:
		consecutive_sixes += 1
		print("Consecutive sixes: ", consecutive_sixes)
		if consecutive_sixes == 3:
			print("Three consecutive sixes! Turn cancelled.")
			set_status("Turn cancelled")
			await get_tree().create_timer(1.0).timeout
			switch_turn()
			is_processing_turn = false
			dice_value = 0
			if dice_value_label != null:
				dice_value_label.text = "-"
			return
	else:
		consecutive_sixes = 0

	calculate_valid_tokens()

func _on_online_dice_result_received(server_dice_value: int) -> void:
	# Called when backend sends authoritative dice.
	_online_waiting_for_server = false
	is_processing_turn = false
	dice_value = int(server_dice_value)
	if dice_value_label != null:
		dice_value_label.text = str(dice_value)
	_set_dice_face(dice_value - 1)

	# Apply consecutive sixes rule locally
	if dice_value == 6:
		consecutive_sixes += 1
		if consecutive_sixes == 3:
			await get_tree().create_timer(1.0).timeout
			if current_player == GameManager.local_player_color:
				switch_turn()
			is_processing_turn = false
			dice_value = 0
			if dice_value_label != null:
				dice_value_label.text = "-"
			return
	else:
		consecutive_sixes = 0

	if current_player == GameManager.local_player_color:
		calculate_valid_tokens()

func play_dice_sound():

	if dice_audio.playing:
		dice_audio.stop()

	dice_audio.play()

func play_move_sound():

	if move_audio.playing:
		move_audio.stop()

	move_audio.play()

func _on_online_tokens_state_received(tokens_by_player: Dictionary) -> void:
	# tokens_by_player expected shape (placeholder):
	# { "RED": [ {"token_index":0,"is_in_home":bool,"current_cell":int,"steps_travelled":int,"completed":bool,"pos":Vector2}, ... ], ... }
	# Since your backend broadcast is not implemented in this repo yet, this method currently just logs.
	print("[ONLINE] tokens_state_received: ", tokens_by_player)

func _on_online_token_moved(player_color: String, token_index: int, steps: int) -> void:
	if player_color == GameManager.local_player_color:
		return # We already moved this locally

	print("[ONLINE] Token moved: ", player_color, " index ", token_index, " steps ", steps)
	if players.has(player_color):
		var token = players[player_color]["tokens"][token_index]
		
		# Set dice_value temporarily for the animation
		var original_dice = dice_value
		dice_value = steps
		
		await perform_move(token, false)
		
		dice_value = original_dice

func _on_online_turn_changed(new_turn: String) -> void:
	print("[ONLINE] Turn changed to: ", new_turn)
	current_player = new_turn
	consecutive_sixes = 0
	is_processing_turn = false
	update_turn_ui()

func _dice_ui_reset() -> void:
	dice_value = 0
	if dice_value_label != null:
		dice_value_label.text = "-"

func animate_dice():
	for i in range(15):
		var random_face = randi_range(0, 5)
		_set_dice_face(random_face)
		await get_tree().create_timer(0.05).timeout

func calculate_valid_tokens():
	valid_tokens.clear()

	if not players.has(current_player):
		is_processing_turn = false
		return

	var player_info = players[current_player]
	var all_tokens = player_info["tokens"]
	var final_cells = player_info["final_lane"]

	for token in all_tokens:
		if token.completed:
			continue

		if token.is_in_home:
			if dice_value == 6:
				valid_tokens.append(token)
				set_status("chose token")
			else:
				set_status("Invalid")
		else:
			# Exact finish check
			var max_steps = PATH_LENGTH + final_cells.size()
			if token.steps_travelled + dice_value <= max_steps:
				valid_tokens.append(token)

	if valid_tokens.size() == 0:
		print("No valid move")
		await get_tree().create_timer(1.0).timeout

		dice_value = 0
		if dice_value_label != null:
			dice_value_label.text = "-"

		switch_turn()
		is_processing_turn = false
		return

	if valid_tokens.size() == 1:
		set_status("token moving")
		play_move_sound()
		await perform_move(valid_tokens[0])
		return

	waiting_for_player_choice = true
	print("Choose a token")
	set_status("choose a token")

func _on_token_clicked(token):
	if token.player_color != current_player:
		return

	if mode == Mode.ONLINE and current_player != GameManager.local_player_color:
		return

	if not waiting_for_player_choice:
		return

	if not valid_tokens.has(token):
		return

	await perform_move(token)

func perform_move(token, is_local_action: bool = true):
	play_move_sound()
	waiting_for_player_choice = false

	if is_local_action and mode == Mode.ONLINE and network != null:
		network.send_token_move(token.player_color, token.token_index, dice_value)

	var rolled_six = (dice_value == 6)
	var was_completed_before = token.completed

	if token.is_in_home:
		await release_token_from_home(token)
	else:
		await move_token(token, dice_value)

	var just_completed = (not was_completed_before) and token.completed

	# Check capture
	var captured = await check_and_perform_capture(token)


	# Check win conditions
	check_win_conditions()

	if is_game_over:
		is_processing_turn = false
		return

	# If it's not local player's action, we don't calculate turns
	if not is_local_action:
		return

	# Extra turn rules
	var has_extra_turn = false
	if rolled_six:
		print("Extra turn: Rolled a 6!")
		has_extra_turn = true
	elif captured:
		print("Extra turn: Captured an opponent!")
		has_extra_turn = true
	elif just_completed:
		print("Extra turn: Token reached the final cell of the final lane!")
		has_extra_turn = true

	if has_extra_turn:
		print("Extra turn granted!")
		if not rolled_six:
			consecutive_sixes = 0
		is_processing_turn = false
	else:
		switch_turn()
		is_processing_turn = false

	# Clear local UI
	dice_value = 0
	if dice_value_label != null:
		dice_value_label.text = "-"
	valid_tokens.clear()

func release_token_from_home(token):
	token.is_in_home = false
	var start_cell = players[token.player_color]["start_cell"]
	token.current_cell = start_cell
	token.steps_travelled = 0

	var target_cell_node = cells[start_cell]
	var tween = create_tween()
	tween.tween_property(
		token,
		"global_position",
		target_cell_node.global_position,
		0.20
	)
	await tween.finished

func move_token(token, steps):
	if token.completed:
		return

	is_token_moving = true
	var player_info = players[token.player_color]
	var final_cells = player_info["final_lane"]

	for i in range(steps):
		token.steps_travelled += 1

		# FINAL LANE
		if token.steps_travelled > PATH_LENGTH:
			var final_index = token.steps_travelled - PATH_LENGTH - 1

			if final_index < final_cells.size():
				var target_final_cell = final_cells[final_index]

				var tween = create_tween()
				tween.tween_property(
					token,
					"global_position",
					target_final_cell.global_position,
					0.20
				)
				await tween.finished

				# Reached destination
				if final_index == final_cells.size() - 1:
					token.completed = true
				continue

		# NORMAL PATH
		token.current_cell += 1
		if token.current_cell >= cells.size():
			token.current_cell = 0

		var target_cell_node = cells[token.current_cell]
		var tween = create_tween()
		tween.tween_property(
			token,
			"global_position",
			target_cell_node.global_position,
			0.20
		)
		await tween.finished

	is_token_moving = false

func check_and_perform_capture(moved_token) -> bool:
	if moved_token.completed or moved_token.is_in_home or moved_token.steps_travelled > PATH_LENGTH:
		return false

	if SAFE_CELLS.has(moved_token.current_cell):
		return false

	var captured_anyone = false
	for other_color in players:
		if other_color == moved_token.player_color:
			continue

		for opponent_token in players[other_color]["tokens"]:
			if opponent_token.completed or opponent_token.is_in_home or opponent_token.steps_travelled > PATH_LENGTH:
				continue

			if opponent_token.current_cell == moved_token.current_cell:
				opponent_token.is_in_home = true
				opponent_token.current_cell = -1
				opponent_token.steps_travelled = 0

				var home_pos = players[other_color]["home_positions"][opponent_token.token_index]
				var tween = create_tween()
				tween.tween_property(opponent_token, "global_position", home_pos, 0.3)
				await tween.finished
				captured_anyone = true

	return captured_anyone

func check_win_conditions():
	for color in players:
		var all_completed = true
		for token in players[color]["tokens"]:
			if not token.completed:
				all_completed = false
				break
		if all_completed:
			is_game_over = true
			if current_player_label != null:
				current_player_label.text = color + " WINS!"
			_set_dice_interaction_enabled(false)
			break

func switch_turn():
	print("SWITCHING TURN")
	set_status("Turn Change")

	if mode == Mode.ONLINE:
		if network != null:
			network.send_turn_end()
		return

	var active_players = []
	for color in ["RED", "GREEN", "YELLOW", "BLUE"]:
		if players.has(color):
			active_players.append(color)

	if active_players.size() == 0:
		return

	var current_index = active_players.find(current_player)

	for i in range(1, active_players.size() + 1):
		var next_index = (current_index + i) % active_players.size()
		var next_player = active_players[next_index]
		if not is_player_completed(next_player):
			current_player = next_player
			break

	consecutive_sixes = 0
	update_turn_ui()
	print("Current Player:", current_player)

func is_player_completed(player_color: String) -> bool:
	if not players.has(player_color):
		return true
	for token in players[player_color]["tokens"]:
		if not token.completed:
			return false
	return true

func update_ui_position() -> void:
	if dice_panel == null:
		return
	if not players.has(current_player):
		return

	var anchor: Vector2 = players[current_player].get("ui_anchor", global_position)
	var offset: Vector2 = DICE_HOME_PANEL_OFFSETS.get(current_player, Vector2.ZERO)
	dice_panel.global_position = anchor + offset



func update_turn_ui():
	if current_player_label != null:
		current_player_label.text = current_player + " TURN"
	set_status("Roll Dice")

	var is_my_turn = (
		mode == Mode.OFFLINE
		or current_player == GameManager.local_player_color
	)

	_set_dice_interaction_enabled(is_my_turn)

	match current_player:
		"RED":
			if current_player_label != null:
				current_player_label.modulate = Color.RED
		"GREEN":
			if current_player_label != null:
				current_player_label.modulate = Color.GREEN
		"BLUE":
			if current_player_label != null:
				current_player_label.modulate = Color.DODGER_BLUE
		"YELLOW":
			if current_player_label != null:
				current_player_label.modulate = Color.GOLD

	update_ui_position()

	print("UI Updated")

func _on_dice_image_pressed() -> void:
	roll_dice()
	
func set_status(message:String):
	if status_label != null:
		status_label.text = message
