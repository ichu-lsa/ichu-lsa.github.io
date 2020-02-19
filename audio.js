// audio context vars are declared in references

// start sound
function toggle_sound() {
	// switch between modes
	if (sound_on) {
		sound_on = false;
		sound1.disconnect(volume);
	}
	else {
		sound_on = true;
		sound1.connect(volume);
	}
}

// 1 second beep
function beep() {
	console.log("Beep Audio: " + audio_player.state)
	toggle_sound();
	window.setTimeout(toggle_sound, 1000);
}
