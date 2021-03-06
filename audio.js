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
	toggle_sound();
	window.setTimeout(toggle_sound, duration_ms);
}

// start alarm listener
function start_alarm() {
	// set vars
	let beep_time = 200; // .20 seconds
	let curr_time = getTime();
	let diff_time = curr_time - last_beep;

	// check if alarm is active
	if (alarm_active && !kill_alarm) {
		if (diff_time > beep_time * 2) {
			beep(beep_time);
			last_beep = curr_time;
		}
		// recall
		setTimeout(start_alarm, beep_time * 2 - (diff_time));
	}
}