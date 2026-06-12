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

# ----------------------------
# Online/Offline enum
# ----------------------------
enum Mode { OFFLINE, ONLINE }

@export var mode: Mode = Mode.OFFLINE

# Assign this in Inspector (drag your Network manager node), or leave null and set via %NetworkName.
@export var network_path: NodePath
var network: Node = null

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

func _ready():
	randomize()

	network = null
	if network_path != NodePath("") and has_node(network_path):
		network = get_node(network_path)
	elif has_node("Network"):
		network = %Network

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
	var player_colors = ["RED", "GREEN", "YELLOW", "BLUE"]
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
				"home_positions": home_positions
			}
			active_turn_order.append(color)
			print("Active player registered: ", color)

	# Set up initial player
	if active_turn_order.size() > 0:
		current_player = active_turn_order[0]
	else:
		push_error("No players found in scene!")

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

func _on_roll_dice_button_pressed():
	roll_dice()

func roll_dice():
	if is_game_over:
		print("Game is over")
		return

	if is_processing_turn:
		print("Dice roll ignored: turn is currently processing")
		return

	if waiting_for_player_choice:
		print("Choose a token first")
		return

	if is_token_moving:
		print("Token is moving")
		return

	is_processing_turn = true

	# OFFLINE: keep your logic unchanged
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
	await animate_dice()
	dice_value = randi_range(1, 6)
	$UI/DiceValueLabel.text = str(dice_value)
	$UI/DiceImage.texture_normal = dice_faces[dice_value - 1]
	print("Dice Rolled for ", current_player, ": ", dice_value)

	# Handle consecutive sixes rule
	if dice_value == 6:
		consecutive_sixes += 1
		print("Consecutive sixes: ", consecutive_sixes)
		if consecutive_sixes == 3:
			print("Three consecutive sixes! Turn cancelled.")
			await get_tree().create_timer(1.0).timeout
			switch_turn()
			is_processing_turn = false
			dice_value = 0
			$UI/DiceValueLabel.text = "-"
			return
	else:
		consecutive_sixes = 0

	calculate_valid_tokens()

func _on_online_dice_result_received(server_dice_value: int) -> void:
	# Called when backend sends authoritative dice.
	_online_waiting_for_server = false
	is_processing_turn = false
	dice_value = int(server_dice_value)
	$UI/DiceValueLabel.text = str(dice_value)
	$UI/DiceImage.texture_normal = dice_faces[dice_value - 1]

	# Apply consecutive sixes rule locally (server also should broadcast tokens state; for now keep same rule)
	if dice_value == 6:
		consecutive_sixes += 1
		if consecutive_sixes == 3:
			await get_tree().create_timer(1.0).timeout
			switch_turn()
			is_processing_turn = false
			dice_value = 0
			$UI/DiceValueLabel.text = "-"
			return
	else:
		consecutive_sixes = 0

	# Continue using your existing local move-resolution logic.
	# IMPORTANT: In a real multiplayer you would also validate/authoritatively move on server.
	calculate_valid_tokens()

func _on_online_tokens_state_received(tokens_by_player: Dictionary) -> void:
	# tokens_by_player expected shape (placeholder):
	# { "RED": [ {"token_index":0,"is_in_home":bool,"current_cell":int,"steps_travelled":int,"completed":bool,"pos":Vector2}, ... ], ... }
	# Since your backend broadcast is not implemented in this repo yet, this method currently just logs.
	print("[ONLINE] tokens_state_received: ", tokens_by_player)
	# TODO: apply positions when backend contract is finalized.

func _dice_ui_reset() -> void:
	dice_value = 0
	$UI/DiceValueLabel.text = "-"

func animate_dice():
	for i in range(15):
		var random_face = randi_range(0, 5)
		$UI/DiceImage.texture_normal = dice_faces[random_face]
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
		else:
			# Exact finish check
			var max_steps = PATH_LENGTH + final_cells.size()
			if token.steps_travelled + dice_value <= max_steps:
				valid_tokens.append(token)

	if valid_tokens.size() == 0:
		print("No valid move")
		await get_tree().create_timer(1.0).timeout

		dice_value = 0
		$UI/DiceValueLabel.text = "-"

		switch_turn()
		is_processing_turn = false
		return

	if valid_tokens.size() == 1:
		await perform_move(valid_tokens[0])
		return

	waiting_for_player_choice = true
	print("Choose a token")

func _on_token_clicked(token):
	if token.player_color != current_player:
		return

	if not waiting_for_player_choice:
		return

	if not valid_tokens.has(token):
		return

	await perform_move(token)

func perform_move(token):
	waiting_for_player_choice = false

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

	# In online mode, after local resolution you would send the final token state to backend.
	# For now, we only clear local UI.
	dice_value = 0
	$UI/DiceValueLabel.text = "-"
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
			$UI/CurrentPlayerLabel.text = color + " WINS!"
			$UI/RollDiceButton.disabled = true
			break

func switch_turn():
	print("SWITCHING TURN")

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

func update_turn_ui():
	$UI/CurrentPlayerLabel.text = current_player + " TURN"
	print("UI Updated")

func _on_dice_image_pressed() -> void:
	roll_dice()

