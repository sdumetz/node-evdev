var ioctls = require("../../build/Release/ioctls")
  , util = require("util")
  , EventEmitter = require("events").EventEmitter;

function DeviceReader(stream){
  var self = this;
  this.stream = stream;
  if(stream.fd > 0){
    this.init(stream.fd);
  }else{
    this.stream.on("open",function(fd){
      self.init(fd);
    });
  }
}
util.inherits(DeviceReader,EventEmitter);
/**
 * Here must go all the ioctl calls on init that we will want to avoir when testing.
 * @param  {[type]} fd [description]
 * @return {[type]}    [description]
 */
DeviceReader.prototype.init = function(fd){
  this.fd = fd;
  try{
    this.id = ioctls.evdev_new_from_fd(fd);
  }catch(e){
    this.emit("error",new Error("in Reader init : "+e));
  }
  this.emit("open",fd);
};

module.exports = DeviceReader;
