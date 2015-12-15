var Mockup = require("./mockups/fsMockup");
var EvdevReader = require("../lib");
var DeviceReader = require("../lib/Device");
var path = require("path");
var fs = require("fs");
var stream = require('stream');
describe("evdev open",function(){
  beforeEach(function(done){
    this.mockup = new Mockup();
    this.reader = new EvdevReader({raw:true});
    this.mockup.createTmp(done);
  });
  afterEach(function(done){
    this.reader.close();
    this.mockup.cleanup(done);
  });
  it("from path",function(done){
    var self = this;
    var stream = this.reader.open(this.mockup.file);
    expect(stream).to.be.instanceof(DeviceReader);
    stream.on("open",function(fd){
      expect(fd).to.be.a("number");
      done();
    })
  });
  it("from fd",function(done){
    var self = this;
    fs.open(this.mockup.file,'r',function(err,file){
      expect(err).to.be.null;
      expect(file).to.be.a("number");
      var stream = self.reader.open(file,function(err,fd){
        expect(fd).to.be.a("number");
        done();
      });
      expect(stream).to.be.instanceof(fs.ReadStream);

    })
  });
})
