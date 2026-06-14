extends Control

@onready var room_id_label = $CenterContainer/Panel/RoomPanel/VBoxContainer/RoomIdLabel
@onready var host_label = $CenterContainer/Panel/RoomPanel/VBoxContainer/HostLabel
@onready var player_count_label = $CenterContainer/Panel/RoomPanel/VBoxContainer/PlayerCountLabel

@onready var player1 = $CenterContainer/Panel/PlayersPanel/VBoxContainer/Player1
@onready var player2 = $CenterContainer/Panel/PlayersPanel/VBoxContainer/Player2
@onready var player3 = $CenterContainer/Panel/PlayersPanel/VBoxContainer/Player3
@onready var player4 = $CenterContainer/Panel/PlayersPanel/VBoxContainer/Player4

@onready var start_button = $CenterContainer/Panel/StartGame


func _ready():

	print("LOBBY READY")


	print("ROOM ID =", GameManager.room_id)
	print("IS HOST =", GameManager.is_host)
	print("PLAYER COUNT =", GameManager.player_count)

	room_id_label.text = "Room ID : " + GameManager.room_id

	if GameManager.is_host:
		host_label.text = "Host"
	else:
		host_label.text = "Player"

	player_count_label.text = "Players : " + str(GameManager.player_count)

	# Autoloaded websocket manager (no scene node named 'Network' required)
	var net := get_node_or_null("/root/NetworkManager")
	if net == null:
		push_error("[Lobby] Autoload '/root/NetworkManager' not found. Add network_manager.gd to Autoload with the name NetworkManager.")
		return

	# Connect websocket signals
	if not net.connected.is_connected(_on_network_connected):
		net.connected.connect(_on_network_connected)

	if not net.disconnected.is_connected(_on_network_disconnected):
		net.disconnected.connect(_on_network_disconnected)

	if net.has_signal("room_joined") and not net.room_joined.is_connected(_on_room_joined):
		net.room_joined.connect(_on_room_joined)

	if net.has_signal("room_started") and not net.room_started.is_connected(_on_room_started):
		net.room_started.connect(_on_room_started)


	# If socket is already open by the time _ready runs, call immediately.

	# (prevents missing the connected signal)
	if net._ws and net._ws.get_ready_state() == WebSocketPeer.STATE_OPEN:
		print("[Lobby] WS already OPEN; running _on_network_connected now")
		_on_network_connected()

	# Initially disable start button
	if GameManager.is_host:
		start_button.disabled = true
		start_button.visible = true
	else:
		start_button.disabled = true
		start_button.visible = false





func _on_network_connected() -> void:

	var net := get_node_or_null("/root/NetworkManager")
	if net == null:
		push_error("[Lobby] Cannot handle network connected: missing /root/NetworkManager")
		return

	print("[Lobby] WebSocket Connected")

	if GameManager.is_host:

		print("[Lobby] Creating room via WS:", GameManager.room_id)
		net.room_create(GameManager.room_id)

	else:

		print("[Lobby] Joining room via WS:", GameManager.room_id)
		net.room_join(GameManager.room_id)




func _on_room_joined(room_state: Variant) -> void:
	print("[Lobby] room_joined signal:", room_state)

	# Update basic lobby fields
	if typeof(room_state) == TYPE_DICTIONARY:
		var dict := room_state as Dictionary
		var roomId = dict.get("roomId", GameManager.room_id)
		var hostId = dict.get("hostId", null)
		var participants = dict.get("participants", [])

		# Ensure both labels are populated even if backend sends only current player's name
		# room_state provides hostId and participants[] (may be partial at join-time).
		var names: Array[String] = []
		for p_any in participants:
			if typeof(p_any) == TYPE_DICTIONARY:
				var p_dict := p_any as Dictionary
				var n := (p_dict as Dictionary).get("name", "")
				if str(n) != "":
					names.append(str(n))

		# If host is NOT the current player, show host in player1 slot (best-effort)
		# We only have names[] from participants, so fallback display:
		# - current user name (participants[0]) goes to first slot
		# - second slot stays hidden until participants includes both players.
		# This avoids incorrect blank states and will automatically fill once backend includes both.

		print("[Lobby] participants.size=", participants.size(), " participants=", participants)

		room_id_label.text = "Room ID : " + str(roomId)



		# Update host/player label (rely on GameManager.is_host for correctness)
		if GameManager.is_host:
			host_label.text = "Host"
			# Enable Start Game button if lobby is full
			if participants.size() >= GameManager.player_count:
				start_button.disabled = false
			else:
				start_button.disabled = true
		else:
			host_label.text = "Player"
			start_button.visible = false


		player_count_label.text = "Players : " + str(participants.size())


		# Populate player slots (best-effort)
		var labels = [player1, player2, player3, player4]
		for i in range(labels.size()):
			if i < participants.size():
				var p = participants[i]
				if typeof(p) == TYPE_DICTIONARY:
					var name = (p as Dictionary).get("name", "")
					labels[i].text = str(name)
					labels[i].visible = true
				else:
					labels[i].text = ""
					labels[i].visible = false
			else:
				labels[i].text = ""
				labels[i].visible = false

func _on_network_disconnected() -> void:

	print("[Lobby] WebSocket Disconnected")


func _on_start_game_pressed() -> void:

	print("[Lobby] Start Game pressed")

	var net := get_node_or_null("/root/NetworkManager")
	if net != null:
		net.room_start(GameManager.room_id)

func _on_room_started(room_state: Dictionary = {}) -> void:
	print("[Lobby] Room started by host, loading ludo_game.tscn")
	
	if GameManager.is_host:
		GameManager.local_player_color = "RED"
	else:
		GameManager.local_player_color = "GREEN"
	
	get_tree().change_scene_to_file(
		"res://scenes/ludo_game.tscn"
	)


func _on_exit_pressed() -> void:

	var net := get_node_or_null("/root/NetworkManager")
	if net != null:
		net.close()



	get_tree().change_scene_to_file(
		"res://scenes/MainMenu.tscn"
	)
