#include <node_api.h>
#include <assert.h>
#include <sys/ioctl.h>
#include <linux/input.h>
#include <fcntl.h>
#include <errno.h>
#include <stdio.h>
#include <string.h>

napi_value EvdevNewFromFd(napi_env env, napi_callback_info info) {
  napi_status status;

  size_t argc = 1;
  napi_value args[1];
  status = napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
  assert(status == napi_ok);

  if (argc < 1) {
    napi_throw_type_error(env, nullptr, "Wrong number of arguments");
    return nullptr;
  }

  napi_valuetype valuetypeArg0;
  status = napi_typeof(env, args[0], &valuetypeArg0);
  assert(status == napi_ok);

  if (valuetypeArg0 != napi_number) {
    napi_throw_type_error(env, nullptr, "Wrong arguments");
    return nullptr;
  }

  int fd;
  napi_get_value_int32(env, args[0], &fd);
  assert(status == napi_ok);

  int rc;
  struct input_id id;
  rc = ioctl(fd, EVIOCGID, &id);
  if(rc == -1 ){
    napi_throw_type_error(env, nullptr, strerror(errno));
    return nullptr;
  }

  napi_value size;
  status = napi_create_object(env, &size);
  assert(status == napi_ok);

  napi_value asdf;
  status = napi_create_double(env, (double)id.bustype, &asdf);
  assert(status == napi_ok);
  status = napi_set_named_property(env, size, "bustype", asdf);
  assert(status == napi_ok);

  status = napi_create_double(env, (double)id.vendor, &asdf);
  assert(status == napi_ok);
  status = napi_set_named_property(env, size, "vendor", asdf);
  assert(status == napi_ok);

  status = napi_create_double(env, (double)id.product, &asdf);
  assert(status == napi_ok);
  status = napi_set_named_property(env, size, "product", asdf);
  assert(status == napi_ok);

  status = napi_create_double(env, (double)id.version, &asdf);
  assert(status == napi_ok);
  status = napi_set_named_property(env, size, "version", asdf);
  assert(status == napi_ok);

  // if (napi_ok != ) {
  //   Napi::TypeError::New(env, "unable to create Number from bustype").ThrowAsJavaScriptException();
  // }
  // size.Set("bustype", bustype);

  return size;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_status status;

  napi_property_descriptor evdevNewFromFdDescriptor = { "evdev_new_from_fd", 0, EvdevNewFromFd, 0, 0, 0, napi_default, 0 };

  status = napi_define_properties(env, exports, 1, &evdevNewFromFdDescriptor);
  assert(status == napi_ok);

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
