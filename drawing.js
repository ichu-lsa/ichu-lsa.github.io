function init() {
	// attach listener to the canvas
	console.log("Starting Up Version 1.126");
	canvas.addEventListener('pointermove', rectDrag, false);
	canvas.addEventListener('pointerdown', rectDrag, false);
	canvas.addEventListener('pointerup', rectDrag, false);
	mark_off();
}

// call init on startup
window.onload = init;

function rectDrag(event) {
	// only use if marking
	if (!marking) {
		// allow scrolling
		canvas.setAttribute("style", "touch-action:auto");

		// canvas press
		if (event.type === "pointerup") {
			if (touchdown) {
				scan();
				touchdown = false;
			}
		}
		if (event.type === "pointerdown") {
			touchdown = true;
		}
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
	scalex = canvas.width / canvas.scrollWidth;
	scaley = canvas.height / canvas.scrollHeight;
	x = Math.round(x * scalex);
	y = Math.round(y * scaley);

	// check for event type
	if (event.type === "pointerdown") {
		dragging = true;
		start = [x,y];
		end = [x,y];
		active_rect = true;
	}
	if (event.type === "pointermove") {
		if (dragging) {
			// get pos and clear
			end = [x,y];
			context.drawImage(display, 0, 0);

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
		active_rect = false;
		send_corners();
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
}
