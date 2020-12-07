export type ReaderOptions = {
  raw?: boolean;
};

export enum EventType {
  EV_KEY = 'EV_KEY',
  EV_ABS = 'EV_ABS',
  EV_SYN = 'EV_SYN',
}

export type Event = {
  type: EventType;
  code: string;
  value: string | number;
  time: string;
};

export class Device {
  readonly id: string;

  constructor(stream?: NodeJS.ReadStream);

  init(fd): void;
  on(event: 'open', callback: () => void);
}

export default class EvdevReader {
  constructor(options?: ReaderOptions);

  open(device: string | number, callback?: (error: Error | null, fd: any) => Device): Device;
  close(): void;
  closeOne(index: number): void;
  search(basedir: string, reg: string, callback: (error: Error | null, files: string[]) => void): void;
  publish(event: Event): void;
  parse(buf: Buffer): Event;
  display(event: Event): Event;
  on(event: 'error', callback: (error: Error) => void);
  on(event: 'EV_ABS' | 'EV_KEY' | 'EV_SYN', callback: (event: Event) => void);
  on(event: string, callback: (data: any) => void);
}
