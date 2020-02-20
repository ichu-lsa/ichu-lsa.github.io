// uuid's
var service_uuid = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
var writer_uuid = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
var reader_uuid = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

// Uart Service: 6e400001-b5a3-f393-e0a9-e50e24dcca9e
// Rx Characteristic: 6e400002-b5a3-f393-e0a9-e50e24dcca9e
// Tx Characteristic: 6e400003-b5a3-f393-e0a9-e50e24dcca9e
// CCC: 2902 // is a descriptor of Tx

function scan()
{
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

	// start scan
	console.log("Scanning...");
	writeCanvas(connecting_str);
	mark_off();

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
		alert("An error occurred, please scan again");
		writeCanvas(broken_connect);
	});
}

// connect and grab characteristic
function connect(){
	return my_device.gatt.connect()
	.then(server => {
		// console.log("Getting Service...");
		return server.getPrimaryService(service_uuid);
	})
	.then(service => {
		// console.log("Getting Characteristics...");
		getCharacteristics(service);
	})
}

// grab characteristics
function getCharacteristics(service) {
	service.getCharacteristic(reader_uuid)
	.then(characteristic => {
		// console.log("Getting Reader");
		reader = characteristic;
		return reader.startNotifications().then(_ => {
	      // console.log('Notifications started');
	      reader.addEventListener('characteristicvaluechanged',
	          handleNotifications);
	    });
	})
	service.getCharacteristic(writer_uuid)
	.then(characteristic => {
		// console.log("Getting Writer");
		writer = characteristic;
		send_hello();
		// check properties
		// console.log("Writer Properties: " + writer.properties.write);
		toggle_button.style.visibility = "visible";
		writeCanvas(connected_str);

		// enter marking mode
		mark_on();
	})
}

// send hello message
function send_hello() {
	// set up encoder and start writing
	let encoder = new TextEncoder('utf-8');
	let value = "I'm new";
	writer.writeValue(encoder.encode(value))
	.then(_ => {
		// console.log("Sending greetings: " + value);
	})
	.catch(error => {
		// console.log("Hello Error: " + error); // sometimes gets a "not supported" error
		// keep sending
		send_hello();
	})
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
  		let url = window.URL.createObjectURL(bigblob);
  		URL.revokeObjectURL(display.src); // trash the old image
  		display.src = url;

  		// check final size
  		// console.log("Total Size: " + total_size);

  		// reset
  		buffers = [];
  		total_size = 0;

  		// keep going
		if (running) {
			request_img();
		}
  	}
  	// check for color
  	else if (bin.localeCompare("light::red") == 0) {
  		lightWatch(-1);
  	}
  	else if (bin.localeCompare("light::green") == 0) {
  		lightWatch(1);
  	}
  	else if (bin.localeCompare("light::none") == 0) {
  		lightWatch(0);
  	}
  	else {
  		// push value into buffer list
  		// console.log("Packet Size: " + value.byteLength);
  		total_size += value.byteLength;
  		buffers.push(value.buffer);
  	}

  	// draw image // the image on display doesn't actually update until the next iteration
	context.drawImage(display, 0, 0);
}
