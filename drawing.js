function init() {
	// attach listener to the canvas
	console.log("Starting Up Version 1.49");
	canvas.addEventListener('pointermove', rectDrag, false);
	canvas.addEventListener('pointerdown', rectDrag, false);
	canvas.addEventListener('pointerup', rectDrag, false);
}

// call init on startup
window.onload = init;

function rectDrag(event) {
	// only use if marking
	if (!marking) {
		// allow scrolling
		canvas.setAttribute("style", "touch-action:auto");
		return;
	}
	// stop scrolling
	canvas.setAttribute("style", "touch-action:none");

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
	event.preventDefault(); // not sure if this doesn anything

	// get relative sizes
	scalex = display.width / canvas.scrollWidth;
	scaley = display.height / canvas.scrollHeight;

	// check for event type
	// console.log("Event Type: " + event.type);
	if (event.type === "pointerdown") {
		dragging = true;
		start = [x,y];
		console.log("Scale Width: " + scalex);
		console.log("Scale Height: " + scaley);
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
			// context.strokeRect(top_left[0] * scalex, top_left[1] * scaley, rwidth * scalex, rheight * scaley);
		}
	}
	if (event.type === "pointerup") {
		end = [x,y];
		dragging = false;
		evaluate_corners();
		// console.log("Pointer up, revealing send_button");
		send_button.style.visibility = "visible";
		send_button.disabled = false;
		send_button.innerHTML = "Send";
		// console.log("end of pointer up");
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
