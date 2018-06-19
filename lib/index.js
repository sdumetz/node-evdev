var fs = require("fs")
  , util = require("util")
  , path = require("path")
  , EventEmitter = require("events").EventEmitter;

var Device = require("./Device");

var ev = require("./Events")
  , codes = {
    EV_KEY : require("./Events/EV_KEY"),
    EV_ABS : require("./Events/EV_ABS"),
    EV_SYN : require("./Events/EV_SYN")
  };

function EvdevReader(options) {
  options = options||{};
  this.raw = options.raw ||false;
  this.subscriptions = [];
  this.devices = [];
  this.eventList = ev;
  this.arch = (process.arch.indexOf('64') >= 0) ?64 :32;
}
util.inherits(EvdevReader,EventEmitter);

/**
 * Open a stream for the given device.
 * @param  {sring, Number} device Device file absolute path or a file descriptor number.
 * @return {ReadStream} the created readable stream.
 */
EvdevReader.prototype.open = function(device, callback){
  var self = this
    , evdev_device
    , stream
    , options = {
        flags: 'r',
        encoding: null,
        fd: null,
        autoClose: true
      };
  if(typeof device === "number"){
    options.fd = device;
    device = null;
  }
  try {
      stream = fs.createReadStream(device,options)
      .on('data', function(buf){
        var i,j, chunk = self.arch === 64 ?24 :16;
        for (i=0,j=buf.length; i<j; i+=chunk) {
          self.publish(self.parse(buf.slice(i,i+chunk)));
        }
      })
      .on("error",function(e){
        self.emit("error",e);
      });
      if(callback){
        //here device is not set when we provide a fd number. Since the file is already opened, there will be no open event.
        if(device){
          stream.once("open",function(fd){callback(null,fd);});
        }else{
          callback(null,stream.fd);
        }
      }
  } catch(e){
    if(callback){
      return callback(e);
    }else{
      throw e;
    }
  }
  evdev_device = new Device(stream);
  this.devices.push(evdev_device);
  return evdev_device;
};
/**
 * Close every opened stream. Will allow a clean exit.
 */
EvdevReader.prototype.close = function(){
  if(0 < this.devices.length ){
    this.devices.forEach(function(device){
      device.stream.close();
    });
    this.devices = [];
  }
};
/**
 * clean a specific indexed stream.
 */
EvdevReader.prototype.closeOne = function(index){
  if(index < this.devices.length  && 0 <= index ){
    this.devices[index].close();
    this.devices.splice(index, 1);
    return null;
  }else{
    return new Error("invalid index : "+index);
  }
};
/**
 * query a device informations
 * @param  {[type]} device [description]
 * @return {[type]}        [description]
 */

/**
 * search in *basedir* for events matching the given regex.
 * Read those event emitters.
 * @param  {string} basedir base directory to search in. generally "/dev/input/by-path"
 * @param  {string} Regex convertibmle string to match against found.
 * @return {Array}  an array of Read devices
 */
EvdevReader.prototype.search = function(basedir, reg,callback){
  var self = this
    , filter = new RegExp(reg);
  fs.readdir(basedir,function(err,files){
    if(!err && files.length && files.length>0){
      return callback(null,files.filter(function(f){
        return filter.test(f);
      }).map(function(file){
        return path.join(basedir,file);
      },self));
    }else{
      return callback(err);
    }
  });
};
/**
 * Publish an event either raw via "event", or with it's type code as event name.
 * @param  {[type]} event
 */
EvdevReader.prototype.publish = function(ev){
  var self = this;
  if(this.raw === true){
    self.emit("event",ev);
  }else{
    this.emit(ev.type,{code:ev.code,value:ev.value,time:ev.time});
  }
};

/**
 * Parse a received event. Event structure as described in evdev is (C code):
 * 		struct input_event {
 *         struct timeval time;
 *         __u16 type;
 *         __u16 code;
 *         __s32 value;
 *    };
 *
 * A timeval is a structure of 2 LowEndian longInt : seconds and microseconds. The LowEndian may not be consistent across systems.
 *
 * @param  {Buffer} bufer of length 24 for x64 and 16 for x86
 * @return {Object} {time : {tv_sec: <long>, tv_usec: <long>}, type : <uint16>, code : <uint16>, value : <uint32>}
 */
EvdevReader.prototype.parse = function(buf){
  var ev = {
      time : {tv_sec:null,tv_usec:null},
      type : null,
      code : null,
      value : null
    }
    , low = 0;
  var offset;
  if (this.arch === 64){
    low = buf.readInt32LE(0);
    ev.time.tv_sec = buf.readInt32LE(4) * 4294967296.0 + low;
    if (low < 0) time.tv_sec += 4294967296;
    low = buf.readInt32LE(8);
    ev.time.tv_usec = buf.readInt32LE(12) * 4294967296.0 + low;
    if (low < 0) time.tv_usec += 4294967296;
    offset = 16;
  }else{
    ev.time.tv_sec = buf.readInt32LE(0);
    ev.time.tv_usec = buf.readInt32LE(4);
    offset = 8;
  }
  ev.type = buf.readUInt16LE(offset);
  ev.code = buf.readUInt16LE(offset + 2);
  ev.value = buf.readInt32LE(offset + 4);
  return ((this.raw === true) ? ev : this.display(ev));
};

/**
 * Convert event numeric informations to string codes when possible.
 * @param  {Object} event {time : {tv_sec: <long>, tv_usec: <long>}, type : <uint16>, code : <uint16>, value : <uint32>}
 * @return {Object} event      transformed event : {time : {tv_sec: <long>, tv_usec: <long>}, type : <string>, code : <string>, value : <uint32>}
 */
EvdevReader.prototype.display = function(ev){
  if(this.eventList[ev.type]){

    ev.type = this.eventList[ev.type];
  }
  if(codes[ev.type] && codes[ev.type][ev.code]){
    ev.code = codes[ev.type][ev.code];
  }

  //console.log(event);
  return ev;
};
/**
 * Exports
 * @type {[function]}
 */
module.exports = EvdevReader;
