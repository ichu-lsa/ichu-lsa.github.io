
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
