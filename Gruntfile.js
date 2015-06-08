module.exports = function(grunt) {
  grunt.initConfig({
    jshint: { // configure the task
      // lint your project's server code
      client: [
        'lib/**/*.js',
      ],
      options:{
        "unused": true,
        "laxcomma":true
      }
    },
    mochaTest: {
      test: {
        options: {
          require: "test/common.js",
          reporter: 'spec',
          quiet: false, // Optionally suppress output to standard out (defaults to false)
        },
        src: ['test/**/*.js']
      }
    }
  })


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test', ["mochaTest","jshint"]);
};
