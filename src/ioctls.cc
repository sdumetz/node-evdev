#include <nan.h>
#include <sys/ioctl.h>
#include <linux/input.h>
#include <fcntl.h>
#include <errno.h>
#include <stdio.h>
#include <string.h>

using v8::FunctionTemplate;
using v8::Handle;
using v8::Object;
using v8::String;
using Nan::GetFunction;
using Nan::New;
using Nan::Set;
using Nan::To;


NAN_METHOD(evdev_new_from_fd) {
  int rc;
  struct input_id id;
  rc = ioctl(To<int>(info[0]).FromJust(), EVIOCGID, &id);
  if(rc == -1 ){
    Nan::ThrowError(strerror(errno));
    //Nan::ThrowError(info[0]);
  }
  v8::Local<v8::Object> size = Nan::New<v8::Object>();
  Nan::Set(size,Nan::New("bustype").ToLocalChecked(), Nan::New<v8::Number>((double)id.bustype));
  Nan::Set(size,Nan::New("vendor").ToLocalChecked(), Nan::New<v8::Number>((double)id.vendor));
  Nan::Set(size,Nan::New("product").ToLocalChecked(), Nan::New<v8::Number>((double)id.product));
  Nan::Set(size,Nan::New("version").ToLocalChecked(), Nan::New<v8::Number>((double)id.version));
  info.GetReturnValue().Set(size);
}

NAN_MODULE_INIT(Init) {
  Nan::Set(target, Nan::New("evdev_new_from_fd").ToLocalChecked(),GetFunction(Nan::New<FunctionTemplate>(evdev_new_from_fd)).ToLocalChecked());
}

NODE_MODULE(ioctls, Init)
