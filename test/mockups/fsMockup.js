var exec = require("child_process").exec
  , fs = require("fs")
  , net = require('net');
function Mockup (){
  this.file = null;
  this.stream;
  this.socket = null;
}

Mockup.prototype.createTmp = function(callback){
  var self = this;
  exec("mktemp -u",function(err,stdout,stderr){
    self.file = stdout.replace("\n","");
    exec("mkfifo "+self.file,function(error,stdout2,stderr2){
      self.stream = fs.createWriteStream(self.file);
      callback(err||error || null,stdout.replace("\n",""));
    });
  });
}
Mockup.prototype.cleanup = function(callback){
  var self = this;
  if(this.stream){
    this.stream.end(function(){
      if(self.file){
        fs.unlink(self.file,callback);
      }
    });
  }

}
/**
 * write events to a file through a buffer
 * @param  {Array}   data     data to be written
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Mockup.prototype.write = function(data,callback){
  var buf = new Buffer(24*data.length);
  var tempLong, low, high;
  var offset = 0;
  var longwriter = function(num){
    high =Math.floor(num/4294967296.0);
    low = num - high*4294967296.0;
    buf.writeUInt32LE(low,offset);
    offset +=4;
    buf.writeUInt32LE(high,offset);
    offset+=4;
  }
  data.forEach(function(ev){
    longwriter(ev.time.tv_sec);
    longwriter(ev.time.tv_usec);
    buf.writeUInt16LE( ev.type,offset);
    offset+=2;
    ev.code = buf.writeUInt16LE(ev.code,offset);
    offset+=2;
    buf.writeUInt32LE(ev.value ,offset);
    offset+=4;
  });
  this.stream.write(buf,callback);
}

module.exports = Mockup;
