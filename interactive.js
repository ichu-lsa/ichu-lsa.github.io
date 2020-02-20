// convert byte array to string
function toString(value) {
	let str = "";
	for (a = 0; a < value.byteLength; a++) {
		str += String.fromCharCode(value.getInt8(a));
	}
	return str;
}

// change toggle to on/off
function videoStart() {
	running = true;
	last_light_time = getTime();
	request_img();
}
function videoStop() {
	running = false;
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
		if (running) {
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
	// set up encoder and start writing
	let encoder = new TextEncoder('utf-8');
	let value = "Corners: " + top_left[0] + " " + top_left[1];
	value += " " + bottom_right[0] + " " + bottom_right[1];
	writer.writeValue(encoder.encode(value))
	.then(_ => {
		// console.log("Sending Corner Data: " + value);
	})
	.catch(error => {
		// console.log("Send_Corners Error: " + error); // sometimes gets a "not supported" error
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

	// modify the alarm button
	// if the alarm isn't active, and the kill_alarm is off, hide
	if (!alarm_active && !kill_alarm) {
		alarm_button.style.display = "none";
	}
	else {
		alarm_button.style.display = "block";
	}
}

// stop the alarm
function stopAlarm() {
	// check the kill_alarm state
	if (kill_alarm) {
		// unkill
		kill_alarm = false;
		alarm_active = false;
		alarm_button.innerHTML = "Acknowledge";
		alarm_button.disabled = true; // allow the lightWatch to re-enable
	}
	else {
		// kill
		kill_alarm = true;
		alarm_active = false;
		alarm_button.innerHTML = "Reset";
	}
}