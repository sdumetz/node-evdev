export namespace Evdev {
  type ReaderOptions = {
    raw?: boolean;
  };

  enum EventType {
    EV_KEY = 'EV_KEY',
    EV_ABS = 'EV_ABS',
    EV_SYN = 'EV_SYN',
  }

  type Event = {
    type: EventType;
    code: string;
    value: string | number;
    time: string;
  };

  class Device {
    readonly id: string;

    constructor(stream?: NodeJS.ReadStream);

    init(fd): void;
    on(event: 'open', callback: () => void);
  }
}

export default class EvdevReader {
  constructor(options?: Evdev.ReaderOptions);

  open(device: string | number, callback?: (error: Error | null, fd: any) => Evdev.Device): Evdev.Device;
  close(): void;
  closeOne(index: number): void;
  search(basedir: string, reg: string, callback: (error: Error | null, files: string[]) => void): void;
  publish(event: Evdev.Event): void;
  parse(buf: Buffer): Evdev.Event;
  display(event: Evdev.Event): Evdev.Event;
  on(event: 'error', callback: (error: Error) => void);
  on(event: 'EV_ABS' | 'EV_KEY' | 'EV_SYN', callback: (event: Evdev.Event) => void);
  on(event: string, callback: (data: any) => void);
}
