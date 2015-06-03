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
    }
  })


  grunt.loadNpmTasks('grunt-contrib-jshint');


  grunt.registerTask('test', ["jshint"]);
};
