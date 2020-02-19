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
