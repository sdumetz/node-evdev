var Mockup = require("./mockups/fsMockup");
var EvdevReader = require("../lib");
var path = require("path");
var fs = require("fs");
describe("evdev events",function(){
  beforeEach(function(done){
    this.mockup = new Mockup();
    this.reader = new EvdevReader({raw:true});
    this.mockup.createTmp(done);
  });
  afterEach(function(done){
    this.reader.close();
    this.mockup.cleanup(done);
  });
  it("read-write in fifo",function(done){
    //Test mockup capability to write on fifo
    fs.createReadStream(this.mockup.file, {
        flags: 'r',
        encoding: null
    }).on("data",function(data){
      expect(typeof data).to.equal("object");
      done();
    })
    this.mockup.write([{time:{tv_sec:2,tv_usec:25},code:0,type:0,value:0}],function(){
    });
  });
  it("parse events",function(done){
    var self = this
      , ev = {time:{tv_sec:2,tv_usec:25},code:0,type:0x01,value:0};
    this.reader.raw = false;
    this.reader.on("EV_KEY",function(e){
      expect(e.time.tv_sec).to.equal(2);
      expect(e.code).to.equal("KEY_RESERVED");
      done();
    })
    this.reader.open(this.mockup.file,function(err){
      expect(err).to.be.null;
      self.mockup.write([ev]);
    });

  });
  it("is indempotent in raw mode",function(done){
    var self = this
      , ev = {time:{tv_sec:2,tv_usec:25},code:0,type:0,value:0}
      , count = 0;
    this.reader.on("event",function(e){
      if(count){
        done();
      }else{
        count++;
        self.mockup.write([e]);
      }
    })
    this.reader.open(this.mockup.file,function(err){
      expect(err).to.be.null;
      self.mockup.write([ev]);
    });
  })
})
