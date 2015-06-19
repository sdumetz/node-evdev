var Mockup = require("./mockups/fsMockup");
var path = require("path");
var fs = require("fs");
describe("evdev close",function(){
  beforeEach(function(done){
    this.mockup = new Mockup();
    this.reader = new EvdevReader({raw:true});
    this.mockup.createTmp(done);
  });
  afterEach(function(done){
    this.reader.close();
    this.mockup.cleanup(done);
  });
  it("all",function(done){
    var self = this;
    var stream = this.reader.open(this.mockup.file);
    expect(stream).to.be.instanceof(Object);
    stream.on("open",function(){
      expect(stream.fd).to.be.a("number");
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
      expect(stream).to.be.instanceof(Object);

    })
  });
})
