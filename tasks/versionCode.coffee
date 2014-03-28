module.exports = (grunt) ->
  grunt.registerTask "versionCode", "Increment version code", ->
    path = require('path').dirname(require.main.filename)
    file = process.cwd() + '/versionCode.json'
    version = grunt.option('versionCode')
    fs = require('fs')
    done = @async()
    data = require file

    version = parseInt(data.version) + 1 unless version?

    data.version = version

    grunt.log.writeln "New version is:", version

    fs.writeFile file, JSON.stringify(data), @async()
