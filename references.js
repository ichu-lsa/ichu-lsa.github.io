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
var connected_str = "Prepping Video";
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

// get recording and power button
var record_button = document.getElementById("record_button");
var power_button = document.getElementById("power_button");
var power_on = true;

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

// the client is no longer responsible for keeping track of 
// how long a light has been on and triggering an alarm,
// but now the client has to send awknowledge and reset
// messages to the server to reset alarm timers

// keep track of how long a green light has been on
// var last_light_time = getTime();
// var green_time = 0;
// var trigger_time_ms = 3000;
// var blue_time = 0;
// var obstruction_trigger_ms = 15000;

// get ref to alarm volume slider and button
var volume_slider = document.getElementById("volume_slider");
volume_slider.oninput = function () {
	initAudio();
	volume.gain.value = this.value / 100.0;
	console.log("Slider Volume: " + volume.gain.value);
}

// get ref to brightness slider and debug button
var brightness_slider = document.getElementById("brightness_slider");
var debug_button = document.getElementById("debug_button");
brightness_slider.oninput = function () {
	console.log("Brightness value: " + this.value);
	setBrightness();
}

// establish packet size with device
var sent_packet_size = false;

// get ref to quality slider
var video_slider = document.getElementById("video_slider");
video_slider.oninput = function () {
	console.log("Video Quality: " + this.value);
	sendQuality();
}

// traffic controllers // should turn this into a queue or something
var waiting_on_corners = false;
var waiting_on_quality = false;
var waiting_on_brightness = false;
var waiting_on_button = false;
var waiting_on_record = false;
var waiting_on_power = false;

// status messages
var status_message = document.getElementById("status_message");
var status_base = "Status: ";
var status_none = status_base + "Not Connected";
var status_connected = status_base + "Connected";
var status_armed = status_base + "Armed";
var status_alarm = status_base + "Green Light Alarm";
var status_obstructed = status_base + "Lost Target";
var status_disarmed = status_base + "Disarmed";
var status_error = status_base + "Error";
status_message.innerHTML = status_none;

// send settings
var settings_message = "settings::";
var green_band = "35 80";
var red_band = "15 160";
var light_str = "230";

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

// general function to start the audio
function initAudio() {
	// start the audio if it needs it
	if (!audio_started){
		// initialize all audio things
		audio_player = new AudioContext();
		volume = audio_player.createGain();
		volume.gain.value = 0.3;
		volume.connect(audio_player.destination);
		sound1 = audio_player.createOscillator();
		sound1.type = "triangle";
		sound1.frequency.value = 880; // A5

		// start audio
		sound1.start(); // must start on gesture
		audio_started = true;
		// have to resume for ios
		if (audio_player.state === 'suspended') {
			audio_player.resume();
		}
	}
}