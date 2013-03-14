# The MIT License
#
# Copyright (c) 2013 Syu Kato <ukyo@gmail.com>
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
# the Software, and to permit persons to whom the Software is furnished to do so,
# subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
# COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
# IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


module.exports = (grunt) ->

  grunt.initConfig
    watch:
      files: ['deferred.coffee', 'exports.coffee']
      tasks: ['default']

    coffee:
      options:
        bare: true
      compile:
        expand: true
        cwd: ''
        src: ['deferred.coffee', 'exports.coffee']
        dest: ''
        ext: '.js'

    uglify:
      compress:
        options:
          banner: '// License: MIT https://github.com/ukyo/promiseAplusImpl\n'
          wrap: 'Deferred'
        files:
          'deferred.min.js': ['deferred.js', 'exports.js']

    nodeunit:
      all: ['test.js']

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-nodeunit'

  grunt.registerTask 'test', ['nodeunit']
  grunt.registerTask 'default', ['coffee', 'uglify', 'test']