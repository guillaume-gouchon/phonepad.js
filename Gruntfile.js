// Generated on 2014-04-07 using generator-webapp 0.4.7
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-header');
  grunt.loadNpmTasks('grunt-remove-logging');

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    version: grunt.file.readJSON('bower.json').version,

    // Project settings
    yeoman: {
      // Configurable paths
      app: 'src',
      dist: 'dist'
    },

    // Empties folders to start fresh
    clean: {
      options: { force: true },
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/{,*/}*.js',
      ]
    },

    // Mocha testing framework configuration options
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
        }
      }
    },

    concat: {
      dist: {
        files: {
          '<%= yeoman.dist %>/phonepad.js': [
            '<%= yeoman.app %>/{,*/}*.js'
          ]
        }
      }
    },

    removelogging: {
      dist: {
        src: '<%= yeoman.dist %>/**/*.js',
        options: {
          // see below for options. this is optional.
        }
      }
    },
   
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/phonepad.min.js': [
            '<%= yeoman.dist %>/phonepad.js'
          ]
        }
      }
    },

    header: {
      dist: {
        options: {
          text: '/*! phonepad.js build: <%= version %>. MIT Licensed. Copyright(c) 2014 Guillaume Gouchon <guillaume.gouchon@gmail.com> */'
        },
        files: {
          '<%= yeoman.dist %>/phonepad.js': '<%= yeoman.dist %>/phonepad.js',
          '<%= yeoman.dist %>/phonepad.min.js': '<%= yeoman.dist %>/phonepad.min.js'
        }
      }
    }

  });

  grunt.registerTask('test', function (target) {
    if (target !== 'watch') {
      grunt.task.run([
        'clean:server',
        'concurrent:test'
      ]);
    }

    grunt.task.run([
      'connect:test',
      'mocha'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    // 'jshint',
    'concat',
    'removelogging',
    'uglify',
    'header'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

};
