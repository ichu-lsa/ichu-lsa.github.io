// audio context vars are declared in references

// start sound
function toggle_sound() {
	// switch between modes
	if (sound_on) {
		console.log("Sound Off...");
		sound_on = false;
		sound1.disconnect(volume);
	}
	else {
		console.log("Sound On!");
		sound_on = true;
		sound1.connect(volume);
	}
}

// 1 second beep
function beep() {
	toggle_sound();
	window.setTimeout(toggle_sound, 1000);
}
