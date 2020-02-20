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
		console.log("Stopping Video...");
	}
	else {
		running = true;
		toggle_button.innerHTML = stop_str;
		console.log("Starting Video...");
		request_img();
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
		console.log("Request Error: " + error); // sometimes gets a "not supported" error

		// keep going // unfortunately this needs to be here
		// just deal with the console messages
		if (running && !marking) {
			request_img();
		}
	})
}

// start marking mode
function toggle_mark() {
	// switch between modes
	if (marking) {
		marking = false;
		mark_button.innerHTML = mark_off_str;
		mark_button.disabled = false;
		canvas.setAttribute("style", "touch-action:auto");
	}
	else {
		marking = true;
		mark_button.innerHTML = mark_on_str;
		mark_button.disabled = true;
		tlc.style.visibility = "visible";
		brc.style.visibility = "visible";
		toggle_button.innerHTML = start_str;
		canvas.setAttribute("style", "touch-action:none");
		get_one_image();
	}
}

// request single image
async function get_one_image() {
	// set up encoder and start writing
	let encoder = new TextEncoder('utf-8');
	let value = "get_image";
	writer.writeValue(encoder.encode(value))
	.then(_ => {
		console.log("Making Image Request: " + value);
	})
	.catch(error => {
		console.log("Request Error: " + error); // sometimes gets a "not supported" error
		get_one_image();
	})

	// keep waiting until image makes it into the display
	while (display.src.substring(0,5).localeCompare("blob:") != 0) {
		await sleep(100); // .1 seconds
	}
	console.log("Drawing on Display: " + display.src);
	context.drawImage(display, 0, 0);
	console.log("Finished Drawing on display");
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
		toggle_mark();
	})
	.catch(error => {
		console.log("Send_Corners Error: " + error); // sometimes gets a "not supported" error
		// keep trying to send until it works
		send_corners();
	})
}

// send a push notification // TODO: actually implement this (just activates a beep for now)
// push notifications are not available for iOS, just use an alarm
function sendPush() {
	// if green, start alarm
	if (light_status == 1) {
		alarm_active = true;
		start_alarm();
	}
	else {
		alarm_active = false;
	}
}

// check if the light has changed and send a push notification if it has
function lightChanged(num) {
	if (light_status != num) {
		light_status = num;
		sendPush();
		console.log("Light Change: " + num);
	}
}
