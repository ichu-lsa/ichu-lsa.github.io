// get ref to canvas
var touchdown = false;
var canvas = document.getElementById("imageView");
var context = canvas.getContext('2d');
context.strokeStyle = "#FF0000";
context.lineWidth = 2;

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

// get scan button // the canvas replaced the scan button
var no_connect_str = "Scan";
var connecting_str = "Connecting";
var connected_str = "Connected";
var broken_connect = "Re-Scan";

// draw text on canvas
context.font = "20px Arial";
context.fillstyle = "black";
context.textAlign = "center";
writeCanvas(no_connect_str);

// get marking button // removing the marking button
var mark_on_str = "Marking";
var mark_off_str = "Mark";
var marking = false;
var active_rect = false;

// get alarm button
var alarm_button = document.getElementById("stop_alarm");
alarm_button.style.display = "none";

// make an audio thing
var AudioContext = window.AudioContext || window.webkitAudioContext;

// try setting everything inside scan
var audio_player;
var volume;
var sound1;
var sound_on = false;
var audio_started = false; // there's no method to check whether or not audio is ready

// set up alarm stuff and time keeper
var kill_alarm = false;
var alarm_active = false;
var time = new Date();
var last_beep = getTime();

// keep track of how long a green light has been on
var last_light_time = getTime();
var green_time = 0;
var trigger_time_ms = 3000;

// just a general function for retrieving the time
function getTime() {
	time = new Date();
	return time.getTime();
}

// general function for writing text to canvas
function writeCanvas(text) {
	context.clearRect(0,0,canvas.width, canvas.height);
	context.fillText(text, canvas.width/2, canvas.height/2);
}