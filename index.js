#!/usr/bin/env node
var EvdevReader = require("./lib");

//var device_streams = new read_device({devices:["/dev/input/by-path/pci-0000:45:00.0-usb-0:1:1.0-event-joystick"]});
var reader = new EvdevReader();

reader.on("EV_KEY",function(data){
  console.log("key : ",data.code,data.value);
})
console.log("searching for event streams matching %s in : /dev/input/by-path", process.argv[1]);
reader.search("/dev/input/by-path",process.argv[2],function(err,streams){
  if(err){
    console.log("node-evdev search stream : ", err);
  }else{
    console.log("found %s streams",streams.length);
  }
});
