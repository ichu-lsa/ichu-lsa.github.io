// convert byte array to string
function toString(value) {
	let str = "";
	for (a = 0; a < value.byteLength; a++) {
		str += String.fromCharCode(value.getInt8(a));
	}
	return str;
}

// flip the button
function toggle_video() {
	if (running) {
		running = false;
		toggle_button.innerHTML = start_str;
		// console.log("Stopping Video...");
	}
	else {
		running = true;
		toggle_button.innerHTML = stop_str;
		// console.log("Starting Video...");
		request_img();
		last_light_time = getTime();
	}
}

// request image
function request_img() {
	// set up encoder and start writing
	let encoder = new TextEncoder('utf-8');
	let value = "get_image";
	writer.writeValue(encoder.encode(value))
	.then(_ => {
		// console.log("Making Image Request: " + value);
	})
	.catch(error => {
		// console.log("Request Error: " + error); // sometimes gets a "not supported" error

		// keep going // unfortunately this needs to be here
		// just deal with the console messages
		if (running && !marking) {
			request_img();
		}
	})
}

// split marking mode away from toggle
function mark_on() {
	marking = true;
	canvas.setAttribute("style", "touch_action:none");
}
function mark_off() {
	marking = false;
	canvas.setAttribute("style", "touch_action:auto");
}

// request single image
async function get_one_image() {
	// set up encoder and start writing
	let encoder = new TextEncoder('utf-8');
	let value = "get_image";
	writer.writeValue(encoder.encode(value))
	.then(_ => {
		// console.log("Making Image Request: " + value);
	})
	.catch(error => {
		// console.log("Request Error: " + error); // sometimes gets a "not supported" error
		get_one_image();
	})

	// keep waiting until image makes it into the display
	while (display.src.substring(0,5).localeCompare("blob:") != 0) {
		await sleep(100); // .1 seconds
	}
	// console.log("Drawing on Display: " + display.src);
	context.drawImage(display, 0, 0);
	// console.log("Finished Drawing on display");
}

// sleep (milliseconds)
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// send corner data
function send_corners() {
	// stop running video
	if (running) {
		toggle_video();
	}
	send_button.disabled = true;
	send_button.innerHTML = "Sending...";
	// set up encoder and start writing
	let encoder = new TextEncoder('utf-8');
	let value = "Corners: " + top_left[0] + " " + top_left[1];
	value += " " + bottom_right[0] + " " + bottom_right[1];
	writer.writeValue(encoder.encode(value))
	.then(_ => {
		console.log("Sending Corner Data: " + value);
		// disable the button and flip mark
		send_button.disabled = true;
		send_button.innerHTML = "Sent!";
		alarm_button.disabled = true;
		alarm_button.style.display = "block";
		toggle_mark();
	})
	.catch(error => {
		console.log("Send_Corners Error: " + error); // sometimes gets a "not supported" error
		// keep trying to send until it works
		send_corners();
	})
}

// light watcher
function lightWatch(num) {
	// check light color
	if (num == 1) {
		// increment time
		green_time += getTime() - last_light_time;
		if (green_time > trigger_time_ms && !alarm_active) {
			// trigger the alarm
			alarm_active = true;
			start_alarm();
			alarm_button.disabled = false;
		}
	}
	if (num == -1) {
		green_time = 0;
	}
	last_light_time = getTime();
}

// stop the alarm
function stopAlarm() {
	// check the kill_alarm state
	if (kill_alarm) {
		// unkill
		kill_alarm = false;
		alarm_active = false;
		alarm_button.innerHTML = "stop alarm";
		alarm_button.disabled = true; // allow the lightWatch to re-enable
	}
	else {
		// kill
		kill_alarm = true;
		alarm_active = false;
		alarm_button.innerHTML = "reset alarm";
	}
}