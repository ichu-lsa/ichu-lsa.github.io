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
function beep(duration_ms) {
	console.log("Beep Volume: " + volume.gain.value);
	toggle_sound();
	window.setTimeout(toggle_sound, duration_ms);
}

// start alarm listener
function start_alarm() {
	// check if the alarm is active
	let beep_time = 250; // .25 seconds
	let curr_time = time.getTime();
	if (alarm_active) {
		if (curr_time - last_beep > beep_time * 2) {
			beep(beep_time);
			last_beep = curr_time;
		}
		// recall
		setTimeout(start_alarm, beep_time*2 - (curr_time - last_beep));
	}
}