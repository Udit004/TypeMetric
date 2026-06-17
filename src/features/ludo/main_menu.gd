extends Control
@onready var buttonClick = get_node("ButtonClick")


func _ready():

	var size = get_viewport().get_visible_rect().size

	print("Screen Size: ", size)

	if size.x < 700:
		setup_mobile()
	else:
		setup_desktop()


func setup_mobile():
	print("Mobile Layout")

func setup_desktop():
	print("Desktop Layout")



func _on_play_pressed():

	play_buttonClick_sound()
	GameManager.game_mode = "OFFLINE"

	await buttonClick.finished

	get_tree().change_scene_to_file(
		"res://scenes/game_mode.tscn"
	)

func _on_multiplayer_pressed():

	play_buttonClick_sound()
	GameManager.game_mode = "ONLINE"
	
	if Engine.has_singleton("NetworkManager") or has_node("/root/NetworkManager"):
		var network = get_node("/root/NetworkManager")
		network.start_connection()

	await buttonClick.finished

	get_tree().change_scene_to_file(
		"res://scenes/room&join.tscn"
	)
	
	

func _on_exit_button_pressed() -> void:
	play_buttonClick_sound()

	await buttonClick.finished

func play_buttonClick_sound():

	if buttonClick.playing:
		buttonClick.stop()

	buttonClick.play()
