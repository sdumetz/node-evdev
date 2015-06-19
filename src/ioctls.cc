#include <node.h>
#include <sys/ioctl.h>
#include <linux/input.h>
#include <fcntl.h>
#include <errno.h>
#include <stdio.h>
#include <string.h>

using namespace v8;

void evdev_new_from_fd(const FunctionCallbackInfo<Value>& args) {
  int rc;
  struct input_id id;
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  rc = ioctl(args[0]->NumberValue(), EVIOCGID, &id);
  if(rc == -1 ){
    isolate->ThrowException(Exception::Error( String::NewFromUtf8(isolate, strerror(errno) )));
  }
  Local<Object> size = Object::New(isolate);
  size->Set(String::NewFromUtf8(isolate, "bustype"), Number::New(isolate, (double)id.bustype));
  size->Set(String::NewFromUtf8(isolate, "vendor"), Number::New(isolate,  (double)id.vendor));
  size->Set(String::NewFromUtf8(isolate, "product"), Number::New(isolate,  (double)id.product));
  size->Set(String::NewFromUtf8(isolate, "version"), Number::New(isolate,  (double)id.version));
  args.GetReturnValue().Set(size);
}

void Init(Handle<Object> exports) {
  NODE_SET_METHOD(exports, "evdev_new_from_fd",evdev_new_from_fd);
}

NODE_MODULE(ioctls, Init)
