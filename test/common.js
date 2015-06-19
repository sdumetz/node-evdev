var chai = require("chai");
global.expect = chai.expect;
global.rewire = require("rewire");


global.EvdevReader = rewire("../lib");

var Device = rewire("../lib/Device");
Device.__set__("ioctls",require("./mockups/ioctlsMockup"));
EvdevReader.__set__("Device",Device);
