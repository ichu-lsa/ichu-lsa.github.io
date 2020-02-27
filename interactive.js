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
	// console.log("Starting Video...");
	running = true;
	request_img();
}
function videoStop() {
	running = false;
}

// request image
function request_img() {
	// check if waiting and wait for others
	if (waiting_on_corners || waiting_on_quality) {
		setTimeout(request_img, 200);
		return;
	}
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

// send packet data
function send_packet_size(packet_size) {
	console.log("Sending Packet Size: " + packet_size);
	// set up encoder and start writing
	let encoder = new TextEncoder('utf-8');
	let value = "max_size::" + packet_size;
	writer.writeValue(encoder.encode(value))
	.then(_ => {
		// start video after sending packet message
		videoStart();
		buffers = [];
		total_size = 0;
		status_message.innerHTML = status_connected;
	})
	.catch(error => {
		// console.log("Request Error: " + error); // sometimes gets a "not supported" error

		// keep going // unfortunately this needs to be here
		// just deal with the console messages
		send_packet_size(packet_size);
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
		waiting_on_corners = false;
		console.log("Sending Corner Data: " + value);
		if (!kill_alarm && !alarm_active) {
			status_message.innerHTML = status_armed;
		}
	})
	.catch(error => {
		waiting_on_corners = true;
		// console.log("Send_Corners Error: " + error); // sometimes gets a "not supported" error
		// keep trying to send until it works
		send_corners();
	})
}

// light watcher
function lightWatch(num) {
	// check the alarm message
	// obstructed
	if (num == 0) {
		if (!kill_alarm) {
			status_message.innerHTML = status_obstructed;
		}
		triggerAlarm();
	}
	// green light
	if (num == 1) {
		if (!kill_alarm) {
			status.innerHTML = status_alarm;
		}
		triggerAlarm();
	}

	// modify the alarm button
	// if the alarm isn't active, and the kill_alarm is off, hide
	if (!alarm_active && !kill_alarm) {
		alarm_button.style.display = "none";
	}
	else {
		alarm_button.style.display = "block";
	}
}

// starts the alarm and enables the button
function triggerAlarm() {
	if (!alarm_active) {
		// trigger the alarm
		alarm_active = true;
		start_alarm();
		alarm_button.disabled = false;
	}
}

// stop the alarm
function stopAlarm() {
	// check the kill_alarm state
	if (kill_alarm) {
		// unkill
		kill_alarm = false;
		alarm_active = false;
		alarm_button.disabled = true; // allow the lightWatch to re-enable
		status_message.innerHTML = status_armed;
		alarm_button.innerHTML = "Acknowledge";
	}
	else {
		// kill
		kill_alarm = true;
		alarm_active = false;
		alarm_button.innerHTML = "Reset";
		status_message.innerHTML = status_disarmed;
	}
}

// test the alarm
function testAlarm() {
	// start the audio if it needs it
	initAudio();
	// beep
	beep(500);
}

// send the video quality
function sendQuality() {
	// set up encoder and start writing
	let encoder = new TextEncoder('utf-8');
	let value = "quality::" + video_slider.value;
	writer.writeValue(encoder.encode(value))
	.then(_ => {
		waiting_on_quality = false;
		console.log("Sending Quality: " + video_slider.value);
	})
	.catch(error => {
		waiting_on_quality = true;
		sendQuality();
	})
}