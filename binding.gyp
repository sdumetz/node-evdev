{
  "targets": [
    {
      "target_name": "ioctls",
      "sources": [ "src/ioctls.cc" ],
      "include_dirs" : [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]

}
