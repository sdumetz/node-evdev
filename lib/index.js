var fs = require("fs")
  , util = require("util")
  , path = require("path")
  , EventEmitter = require("events").EventEmitter;

var events = require("./Events")
  , codes = {
    EV_KEY : require("./Events/EV_KEY"),
    EV_ABS : require("./Events/EV_ABS"),
    EV_SYN : require("./Events/EV_SYN")
  };

function EvdevReader(options) {
  var self = this;
  options = options||{};
  this.subscriptions = [];
  this.events = events;
  if(options.devices){
    options.devices.forEach(function(device){
      self.read(device);
    });
  }
}
util.inherits(EvdevReader,EventEmitter);


/**
 * Open a stream for the given device
 * @param  {sring} device Device absolute path
 * @return {ReadStream} the created readable stream.
 */
EvdevReader.prototype.read = function(device){
  var self = this;
  try {
      return fs.createReadStream(device, {
          flags: 'r',
          encoding: null
      })
      .on('data', function(buf){
        var i,j,chunk = 24;
        for (i=0,j=buf.length; i<j; i+=chunk) {
            self.publish(self.parse(buf.slice(i,i+chunk)));
        }
      })
      .on("error",function(e){
        console.log("Error %s - When reading %s",e,device);
      });
  } catch(e){
      console.log("error reading from evdev stream : ",e);
  }
};
/**
 * search in *basedir* for events matching the given regex.
 * Read those event emitters.
 * @param  {string} basedir base directory to search in. generally "/dev/input/by-path"
 * @param  {string} Regex convertibmle string to match against found.
 * @return {Array}  an array of Read streams
 */
EvdevReader.prototype.search = function(basedir, reg,callback){
  var self = this
    , filter = new RegExp(reg);
  fs.readdir(basedir,function(err,files){
    if(!err && files.length && files.length>0){
      //console.log("files : ",files);
      return callback(err,files.filter(function(f){return filter.test(f)}).map(function(file){self.read(path.join(basedir,file));},self));
    }else{
      return callback(err);
    }

  })
}

EvdevReader.prototype.publish = function(event){
    return ((this.raw === true) ? this.emit("event",event) : this.emit(event.type,{code:event.code,value:event.value,timestamp:event.time}));
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
 * @param  {Buffer} bufer of length 24
 * @return {Object} {time : {tv_sec: <long>, tv_usec: <long>}, type : <uint16>, code : <uint16>, value : <uint32>}
 */
EvdevReader.prototype.parse = function(buf){
  var event = {
      time : {tv_sec:null,tv_usec:null},
      type : null,
      code : null,
      value : null
    }
    , low = 0;

  low = buf.readInt32LE(0);
  event.time.tv_sec = buf.readInt32LE(4) * 4294967296.0 + low;
  if (low < 0) time.tv_sec += 4294967296;
  low = buf.readInt32LE(8);
  event.time.tv_usec = buf.readInt32LE(12) * 4294967296.0 + low;
  if (low < 0) time.tv_usec += 4294967296;
  event.type = buf.readUInt16LE(16);
  event.code = buf.readUInt16LE(18);
  event.value = buf.readUInt32LE(20);
  return ((this.raw === true) ? event : this.display(event));
};

/**
 * Convert event numeric informations to string codes when possible.
 * @param  {Object} event {time : {tv_sec: <long>, tv_usec: <long>}, type : <uint16>, code : <uint16>, value : <uint32>}
 * @return {Object} event      transformed event : {time : {tv_sec: <long>, tv_usec: <long>}, type : <string>, code : <string>, value : <uint32>}
 */
EvdevReader.prototype.display = function(event){
  if(events[event.type]){

    event.type = events[event.type];
  }
  if(codes[event.type] && codes[event.type][event.code]){
    event.code = codes[event.type][event.code];
  }

  //console.log(event);
  return event;
};
/**
 * Exports
 * @type {[function]}
 */
module.exports = EvdevReader;
