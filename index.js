#!/usr/bin/env node
var EvdevReader = require("./lib");

//var device_streams = new read_device({devices:["/dev/input/by-path/pci-0000:45:00.0-usb-0:1:1.0-event-joystick"]});
var reader = new EvdevReader();

reader.on("EV_KEY",function(data){
  console.log("key : ",data.code,data.value);
}).on("EV_ABS",function(data){
  console.log("Absolute axis : ",data.code,data.value);
}).on("EV_REL",function(data){
  console.log("Relative axis : ",data.code,data.value);
}).on("error",function(e){
  console.log("reader error : ",e);
})
console.log("searching for event streams matching %s in : /dev/input/by-path", process.argv[2]);
reader.search("/dev/input/by-path",process.argv[2],function(err,files){
  if(err){
    console.log("node-evdev search stream : ", err);
  }else if(files[0]){
    console.log("found %s inputs",files.length);
    var device = reader.open(files[0]);
    device.on("open",function(){
      console.log(device.id);
    })
  }
});
