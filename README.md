# Evdev reader for nodeJS

An Evdev events reader.

## Why not using libevdev

I don't have the required skills to port libevdev to a nodejs native module.
It looks like such a port would require a way to asynchronize every I/O from libevdev and I don't even know if it's possible.
I'm open to suggestion if you think there is a way and it could be profitable by any means over this one.

## How it works

### Internals
Basics are simple : read from evdev character devices in /dev/input.
Everything around is just utility functions : open files from regex.

### Demo App

    node index.js event-<your_event_type>

Will output keyPresses from matched devices.
This app is dead simple on purpose to be easily customizable without having to read tons of source code.


## Options

### Example :
    {
      raw:false
    }

### Options Explained
#### Raw
*<bool>*
get raw events or parsed (with string instead of uints).



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

- Add more tests
- The app require the running user to be a member of the *"input"* group. A VM should be provided to allow for easy testing without risking to compromise the system. Alternatively, I'd be best to find a lightweight solution to safely provide inputs when testing.
- Need a way to discover input capabilities and vendor infos like libevdev's ```libevdev_has_event_code()```.


## Useful resources

### Importing event codes

Event codes are found [here](https://github.com/torvalds/linux/blob/master/include/uapi/linux/input.h)

Use this regex :
    .*#define (\w*)\s*(0?x?[0-9a-f]{1,3})
replace with :
    $2:"$1",
