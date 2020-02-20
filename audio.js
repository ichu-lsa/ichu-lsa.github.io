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
	// set vars
	console.log("Alarm Called ^^^");
	let beep_time = 250; // .25 seconds
	time = new Date(); // have to do this
	let curr_time = time.getTime();
	let diff_time = curr_time - last_beep;
	console.log("Diff Time: " + diff_time);
	console.log("Curr Time: " + curr_time);
	console.log("Last Time: " + last_beep);

	// check if alarm is active
	if (alarm_active) {
		if (diff_time > beep_time * 2) {
			beep(beep_time);
			last_beep = curr_time;
		}
		// recall
		console.log("Recalling")
		setTimeout(start_alarm, beep_time * 2 - (diff_time));
	}
}