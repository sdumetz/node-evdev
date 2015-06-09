var fs = require("fs")
  , util = require("util")
  , path = require("path")
  , EventEmitter = require("events").EventEmitter;

var ev = require("./Events")
  , codes = {
    EV_KEY : require("./Events/EV_KEY"),
    EV_ABS : require("./Events/EV_ABS"),
    EV_SYN : require("./Events/EV_SYN")
  };

function EvdevReader(options) {
  var self = this;
  options = options||{};
  this.raw = options.raw ||false;
  this.subscriptions = [];
  this.streams = [];
  this.eventList = ev;
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
  var self = this
    , stream;
  try {
      stream = fs.createReadStream(device, {
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
      return e;
  }
  this.streams.push(stream);
  return stream;
};
EvdevReader.prototype.close = function(){
  if(this.streams.length >0){
    this.streams.forEach(function(stream){
      stream.close();
    });
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
      return callback(null,files.filter(function(f){
        return filter.test(f);
      }).map(function(file){
        return self.read(path.join(basedir,file));
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
 * @param  {Buffer} bufer of length 24
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

  low = buf.readInt32LE(0);
  ev.time.tv_sec = buf.readInt32LE(4) * 4294967296.0 + low;
  if (low < 0) time.tv_sec += 4294967296;
  low = buf.readInt32LE(8);
  ev.time.tv_usec = buf.readInt32LE(12) * 4294967296.0 + low;
  if (low < 0) time.tv_usec += 4294967296;
  ev.type = buf.readUInt16LE(16);
  ev.code = buf.readUInt16LE(18);
  ev.value = buf.readUInt32LE(20);
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
