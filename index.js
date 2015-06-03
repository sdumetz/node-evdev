
var read_device = require("./lib");

//var device_streams = new read_device({devices:["/dev/input/by-path/pci-0000:45:00.0-usb-0:1:1.0-event-joystick"]});
var device_streams = new read_device({});
device_streams.on("EV_KEY",function(data){
  console.log("key : ",data.code,data.value);
})
streams = device_streams.search("/dev/input/by-path","event-joystick",function(err,streams){
  if(err){
    console.log("node-evdev search stream : ", err);
  }
});
