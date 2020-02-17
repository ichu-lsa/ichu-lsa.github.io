
// get ref to canvas
var canvas = document.getElementById("imageView");
var context = canvas.getContext('2d');
context.strokeStyle = "#FF0000";
context.lineWidth = 2;

// get ref to text
var tlc = document.getElementById("top_left");
var brc = document.getElementById("bottom_right");
tlc.style.visibility = "hidden";
brc.style.visibility = "hidden";

// set vars
var dragging = false;
var start = [0,0];
var end = [0,0];
var top_left = [0,0];
var bottom_right = [0,0];
var rwidth = 0;
var rheight = 0;

// light status -1 = red, 0 = obstructed, 1 = green
var light_status = -2; // wait for setup

// get image
var display = document.getElementById("draw_bg");

// link to characteristics
var reader;
var writer;

// link to intermediaries
var my_device;
var my_val = "";
var my_img;

// blob stuff
var buffers = [];
var total_size = 0;

// loop
var running = false;

// DEBUG, try showing the brc text
brc.style.visibility = "visible";

// get video button elements
var toggle_button = document.getElementById("video");
toggle_button.style.visibility = "hidden";
var start_str = "Start Video";
var stop_str = "Stop Video";
toggle_button.innerHTML = start_str;

// get scan button
var scan_button = document.getElementById("scanning");
var no_connect_str = "Scan";
var connecting_str = "Connecting";
var connected_str = "Connected";
var broken_connect = "Re-Scan";
scan_button.innerHTML = no_connect_str;

// get marking button
var mark_button = document.getElementById("marking");
var mark_on_str = "Marking";
var mark_off_str = "Mark";
mark_button.style.visibility = "hidden";
mark_button.innerHTML = mark_off_str;
var marking = false;

// get corner send button
var send_button = document.getElementById("send_corners");
send_button.style.visibility = "hidden";

// uuid's
var service_uuid = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
var writer_uuid = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
var reader_uuid = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

// Uart Service: 6e400001-b5a3-f393-e0a9-e50e24dcca9e
// Rx Characteristic: 6e400002-b5a3-f393-e0a9-e50e24dcca9e
// Tx Characteristic: 6e400003-b5a3-f393-e0a9-e50e24dcca9e
// CCC: 2902 // is a descriptor of Tx

function init() {
	// attach listener to the canvas
	console.log("Starting Up...");
	canvas.addEventListener('pointermove', rectDrag, false);
	canvas.addEventListener('pointerdown', rectDrag, false);
	canvas.addEventListener('pointerup', rectDrag, false);
}

// call init on startup
window.onload = init;

function rectDrag(event) {
	// only use if marking
	if (!marking) {
		return;
	}

	// get mouse position
	var x = -1;
	var y = -1;
	// check browser specifics
	if (event.layerX || event.layerX == 0) {
		// firefox
		x = event.layerX;
		y = event.layerY;
	}
	else if (event.offsetX || event.offsetX == 0) {
		// opera
		x = event.offsetX;
		y = event.offsetY;
	}

	// check if within canvas bounds
	if (x == -1 || y == -1) {
		return;
	}
	event.preventDefault();

	// check for event type
	// console.log("Event Type: " + event.type);
	if (event.type === "pointerdown") {
		dragging = true;
		start = [x,y];
	}
	if (event.type === "pointermove") {
		if (dragging) {
			// get pos and clear
			end = [x,y];
			context.drawImage(display,0,0);

			// get corners and dims
			evaluate_corners();

			// draw
			context.strokeRect(top_left[0], top_left[1], rwidth, rheight);
		}
	}
	if (event.type === "pointerup") {
		end = [x,y];
		dragging = false;
		evaluate_corners();
		send_button.style.visibility = "visible";
		send_button.disabled = false;
		send_button.innerHTML = "Send";
	}
}

// evaluates the tl and br corners
function evaluate_corners () {
	for (a = 0; a < 2; a++) {
		if (start[a] < end[a]) {
			top_left[a] = start[a];
			bottom_right[a] = end[a];
		}
		else
		{
			top_left[a] = end[a];
			bottom_right[a] = start[a];
		}
	}
	rwidth = bottom_right[0] - top_left[0];
	rheight = bottom_right[1] - top_left[1];
	// set text
	tlc.innerHTML = "Top Left: [" + top_left[0] + "," + top_left[1] + "]";
	brc.innerHTML = "Bottom Right: [" + bottom_right[0] + "," + bottom_right[1] + "]";
}

function scan()
{
	console.log("Scanning...");
	scan_button.innerHTML = connecting_str;
	// set up options
	let options = {};
  	options.acceptAllDevices = true;
  	options.optionalServices = [service_uuid];

  	// get connection and stuff
	navigator.bluetooth.requestDevice(options)
	.then(device => {
		console.log("Name: " + device.name);
		my_device = device;
		return connect();
	})
	.catch(error => {
		// alert("Error: " + error);
		alert("An error occurred, please try again");
		scan_button.innerHTML = broken_connect;
	});
}

// connect and grab characteristic
function connect(){
	return my_device.gatt.connect()
	.then(server => {
		console.log("Getting Service...");
		return server.getPrimaryService(service_uuid);
	})
	.then(service => {
		console.log("Getting Characteristics...");
		getCharacteristics(service);
	})
}

// grab characteristics
function getCharacteristics(service) {
	service.getCharacteristic(reader_uuid)
	.then(characteristic => {
		console.log("Getting Reader");
		reader = characteristic;
		return reader.startNotifications().then(_ => {
	      console.log('Notifications started');
	      reader.addEventListener('characteristicvaluechanged',
	          handleNotifications);
	    });
	})
	service.getCharacteristic(writer_uuid)
	.then(characteristic => {
		console.log("Getting Writer");
		writer = characteristic;
		send_hello();
		// check properties // removing log for webBLE
		// console.log("Writer Properties: " + writer.properties.write);
		toggle_button.style.visibility = "visible";
		mark_button.style.visibility = "visible";
		scan_button.innerHTML = connected_str;
	})
}

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
		console.log("Making Image Request: " + value);
	})
	.catch(error => {
		console.log("Request Error: " + error); // sometimes gets a "not supported" error

		// keep going
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
	}
	else {
		marking = true;
		mark_button.innerHTML = mark_on_str;
		mark_button.disabled = true;
		tlc.style.visibility = "visible";
		brc.style.visibility = "visible";
		toggle_button.innerHTML = start_str;
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
}

// sleep (milliseconds)
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// send hello message
function send_hello() {
	// set up encoder and start writing
	let encoder = new TextEncoder('utf-8');
	let value = "I'm new";
	writer.writeValue(encoder.encode(value))
	.then(_ => {
		console.log("Sending greetings: " + value);
	})
	.catch(error => {
		console.log("Hello Error: " + error); // sometimes gets a "not supported" error
		// keep sending
		send_hello();
	})
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
function sendPush() {
	// do nothing
}

// check if the light has changed and send a push notification if it has
function lightChanged(num) {
	if (light_status != num) {
		light_status = num;
		sendPush();
		console.log("Light Change: " + num);
	}
}

// give reaction when characteristic changes
function handleNotifications(event) {
	// get value
  	let value = event.target.value;

	// convert to string
  	let bin = '';
  	if (value.byteLength <= 20) {
	  	for (a = 0; a < value.byteLength; a++)
	  	{
	  		bin += String.fromCharCode(value.getInt8(a));
	  	}
  	}

  	// check if it's the end string
  	if (bin.localeCompare("aaaaaaaaaa") == 0) {
  		// make blob
  		let bigblob = new Blob(buffers, {type: "image/jpeg"});
  		let url = URL.createObjectURL(bigblob);
  		display.src = url;

  		// check final size
  		// console.log("Total Size: " + total_size);

  		// reset
  		buffers = [];
  		total_size = 0;

  		// keep going
		if (running && !marking) {
			request_img();
		}
  	}
  	// check for color
  	else if (bin.localeCompare("light::red") == 0) {
  		lightChanged(-1);
  	}
  	else if (bin.localeCompare("light::green") == 0) {
  		lightChanged(1);
  	}
  	else if (bin.localeCompare("light::none") == 0) {
  		lightChanged(0);
  	}
  	else {
  		// push value into buffer list
  		total_size += value.byteLength;
  		buffers.push(value.buffer);
  	}

  	// draw image // the image on display doesn't actually update until the next iteration
  	// console.log("Drawing on Canvas");
	context.drawImage(display, 0, 0);
	// context.strokeRect(top_left[0], top_left[1], rwidth, rheight);
}
