# Evdev reader for nodeJS

An Evdev events reader.

## Why not using libevdev

I don't have the required skills to port libevdev to a nodejs native module.
It looks like such a port would require a way to asynchronize every I/O from libevdev and I don't even know if it's possible.
I'm open to suggestion if you think there is a way and it could be profitable by any means over this one.

## How it works

Basics are simple : read from evdev character devices in /dev/input.
Everything around is just utility functions : open files from regex.

## Options

### Example :
    {
      raw:false
      devices:[]
    }

### Options Explained
#### Raw
*<bool>*
get raw events or parsed (with string instead of uints).

#### Devices
*<Array>*
array of devices to read from.

## Opening streams

You can specify evdev files to open in [options](#options). Or call the **search** method.

    var reader = new EvdevReader();
    reader.search("/dev/input/by-path","event-joystick",function(err){
      //Err should be null.
    });


## Events

#### Raw events
When in raw mode, events are emitted under the name "event" with the structure :
    {
      time : {tv_sec: <long>, tv_usec: <long>},
      type : <uint16>,
      code : <uint16>,
      value : <uint32>
    }

#### Parsed events

Events are emitted under an *"event_type"* name, with this structure :
    {
      time : {tv_sec: <long>, tv_usec: <long>},
      code : <string>,
      value : <uint32>
    }

## TODO

Add tests using mocha. Not much to test about, but worth doing anyway.

## Useful resources

### Importing event codes

Event codes are found [here](https://github.com/torvalds/linux/blob/master/include/uapi/linux/input.h)

Use this regex :
    .*#define (\w*)\s*(0?x?[0-9a-f]{1,3})
replace with :
    $2:"$1",
