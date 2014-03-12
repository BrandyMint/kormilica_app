"use strict"
LIVERELOAD_PORT = 35729
SERVER_PORT = 3006
lrSnippet = require("connect-livereload")(port: LIVERELOAD_PORT)
mountFolder = (connect, dir) ->
  connect.static require("path").resolve(dir)


# # Globbing
# for performance reasons we're only matching one level down:
# 'test/spec/{,*/}*.js'
# use this if you want to match all subfolders:
# 'test/spec/**/*.js'
# templateFramework: 'lodash'
module.exports = (grunt) ->

  # show elapsed time at the end
  require("time-grunt") grunt

  # load all grunt tasks
  require("load-grunt-tasks") grunt
  grunt.loadNpmTasks "grunt-haml"
  grunt.loadNpmTasks 'grunt-version'
  grunt.loadTasks('./tasks/')

  # configurable paths
  yeomanConfig =
    app: "app"
    dist: "dist"
    bower: "."

  grunt.initConfig
    yeoman: yeomanConfig
    version:
      options:
        build_number: process.env.BUILD_NUMBER
      defaults:
        src: ['app/scripts/app.coffee']
    watch:
      options:
        nospawn: true
        livereload: true

      coffee:
        files: ["<%= yeoman.app %>/scripts/{,*/,*/*/}*.coffee"]
        tasks: ["coffee:dist"]

      coffeeTest:
        files: ["test/spec/{,*/}*.coffee"]
        tasks: ["coffee:test"]

      haml:
        files: ["<%= yeoman.app %>/scripts/templates/{,*/}*.haml"]
        tasks: ["haml"]

      compass:
        files: ["<%= yeoman.app %>/styles/{,*/}*.{scss,sass}"]
        tasks: ["compass"]

      livereload:
        options:
          livereload: LIVERELOAD_PORT

        files: [
          "<%= yeoman.app %>/*.html"
          "{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css"
          "{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js"
          "<%= yeoman.app %>/kormapp/images/{,*/}*.{png,jpg,jpeg,gif,webp}"
          "<%= yeoman.app %>/scripts/templates/{,*/}*.{ejs,mustache,hbs,haml}"
          "test/spec/**/*.js"
        ]

      jst:
        files: ["<%= yeoman.app %>/scripts/templates/*.ejs"]
        tasks: ["jst"]

      test:
        files: [
          "<%= yeoman.app %>/scripts/{,*/}*.js"
          "test/spec/**/*.js"
        ]
        tasks: ["test"]

    connect:
      options:
        port: SERVER_PORT

        # change this to '0.0.0.0' to access the server from outside
        hostname: "localhost"

      livereload:
        options:
          middleware: (connect) ->
            [
              lrSnippet
              mountFolder(connect, ".tmp")
              mountFolder(connect, "lib")
              mountFolder(connect, yeomanConfig.app)
            ]

      test:
        options:
          port: 9001
          middleware: (connect) ->
            [
              lrSnippet
              mountFolder(connect, ".tmp")
              mountFolder(connect, "test")
              mountFolder(connect, yeomanConfig.app)
            ]

      dist:
        options:
          middleware: (connect) ->
            [mountFolder(connect, yeomanConfig.dist)]


    open: {
        server: {
            path: 'http://localhost:<%= connect.options.port %>'
        }
    },
    clean:
      dist: [
        ".tmp"
        "<%= yeoman.dist %>/*"
      ]
      server: ".tmp"

    jshint:
      options:
        jshintrc: ".jshintrc"
        reporter: require("jshint-stylish")

      all: [
        "Gruntfile.js"
        "<%= yeoman.app %>/scripts/{,*/}*.js"
        "!<%= yeoman.app %>/scripts/vendor/*"
        "test/spec/{,*/}*.js"
      ]

    mocha:
      all:
        options:
          run: true
          urls: ["http://localhost:<%= connect.test.options.port %>/index.html"]

    coffee:
      dist:
        files: [

          # rather than compiling multiple files here you should
          # require them into your main .coffee file
          expand: true
          cwd: "<%= yeoman.app %>/scripts"
          src: "{,*/,*/*/}*.coffee"
          dest: ".tmp/scripts"
          ext: ".js"
        ]

      test:
        files: [
          expand: true
          cwd: "test/spec"
          src: "{,*/}*.coffee"
          dest: ".tmp/spec"
          ext: ".js"
        ]

    compass:
      options:
        sassDir: "<%= yeoman.app %>/styles"
        cssDir: ".tmp/styles"
        imagesDir: "<%= yeoman.app %>/kormapp/images"
        javascriptsDir: "<%= yeoman.app %>/scripts"
        fontsDir: "<%= yeoman.app %>/styles/fonts"
        importPath: "<%= yeoman.app %>/bower_components"
        relativeAssets: true

      dist: {}
      server:
        options:
          debugInfo: true

    requirejs:
      dist:

        # Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options:

          # `name` and `out` is set by grunt-usemin
          baseUrl: ".tmp/scripts"
          optimize: "none"
          paths:
            templates: "../../.tmp/scripts/templates"
            jquery: "../../app/bower_components/jquery/jquery"
            underscore: "../../app/bower_components/underscore/underscore"
            backbone: "../../app/bower_components/backbone/backbone"
            marionette: "../../app/bower_components/backbone.marionette/lib/core/amd/backbone.marionette"
            "backbone.virtualcollection": '../../app/bower_components/backbone.virtualcollection/backbone.virtual-collection'
            "backbone.stickit": "../../app/bower_components/backbone.stickit/backbone.stickit"
            "backbone.wreqr": "../../app/bower_components/backbone.wreqr/lib/amd/backbone.wreqr"
            "backbone.babysitter": "../../app/bower_components/backbone.babysitter/lib/amd/backbone.babysitter"
            "backbone.localStorage": "../../app/bower_components/backbone.localStorage/backbone.localStorage"
            'jquery.ui.effect':        "../../app/bower_components/jquery.ui/ui/jquery.ui.effect"
            'jquery.ui.effect-bounce': "../../app/bower_components/jquery.ui/ui/jquery.ui.effect-bounce"
            "form-serialize": "../../.tmp/scripts/lib/form-serialize"
            "app":            '../../.tmp/scripts/app'

          # TODO: Figure out how to make sourcemaps work with grunt-usemin
          # https://github.com/yeoman/grunt-usemin/issues/30
          #generateSourceMaps: true,
          # required to support SourceMaps
          # http://requirejs.org/docs/errors.html#sourcemapcomments
          preserveLicenseComments: false
          useStrict: true
          wrap: true
          findNestedDependencies: true

      core:
        options:
          baseUrl: '.tmp/scripts'
          optimize: 'none'
          paths:
            templates: "../../.tmp/scripts/templates"
          useStrict: true
          almond: true
          findNestedDependencies: true
          out: './lib/kormilica_app_core.js'
          name: 'app'
          mainConfig: '.tmp/scripts/app.js'

    #uglify:
    #  options:
    #    mangle: false
    #    compress: false
    #    beautify: true
    #    sourceMap: true  # // https://github.com/mishoo/UglifyJS2
    useminPrepare:
      html: "<%= yeoman.app %>/index.html"
      options:
        dest: "<%= yeoman.dist %>"

    usemin:
      html: ["<%= yeoman.dist %>/{,*/}*.html"]
      css: ["<%= yeoman.dist %>/styles/{,*/}*.css"]
      options:
        dirs: ["<%= yeoman.dist %>"]

    imagemin:
      dist:
        files: [
          expand: true
          cwd: "<%= yeoman.app %>/kormapp/images"
          src: "{,*/}*.{png,jpg,jpeg}"
          dest: "<%= yeoman.dist %>/kormapp/images"
        ]

    cssmin:
      dist:
        files:
          "<%= yeoman.dist %>/styles/main.css": [
            ".tmp/styles/{,*/}*.css"
            "<%= yeoman.app %>/styles/{,*/}*.css"
          ]

    htmlmin:
      dist:
        options: {}

        #removeCommentsFromCDATA: true,
        #                    // https://github.com/yeoman/grunt-usemin/issues/44
        #                    //collapseWhitespace: true,
        #                    collapseBooleanAttributes: true,
        #                    removeAttributeQuotes: true,
        #                    removeRedundantAttributes: true,
        #                    useShortDoctype: true,
        #                    removeEmptyAttributes: true,
        #                    removeOptionalTags: true
        files: [
          expand: true
          cwd: "<%= yeoman.app %>"
          src: "*.html"
          dest: "<%= yeoman.dist %>"
        ]

    copy:
      dist:
        files: [
          expand: true
          dot: true
          cwd: "<%= yeoman.app %>"
          dest: "<%= yeoman.dist %>"
          src: [
            "*.{ico,txt}"
            ".htaccess"
            "data/images/*.*"
            "kormapp/images/{,*/}*.{webp,gif,png,jpg}"
            "styles/fonts/{,*/}*.*"
            "{,*/}*.js"
          ]
        ]

      bower:
        files: ["<%= yeoman.bower %>/lib/kormilica_app.js": "<%= yeoman.dist %>/scripts/main.js"]

      bower_min:
        files: ["<%= yeoman.bower %>/lib/kormilica_app.min.js": "<%= yeoman.dist %>/scripts/main.js"]

    bower:
      all:
        rjsConfig: "<%= yeoman.app %>/scripts/main.js"

    jst:
      options:
        amd: true

      compile:
        files:
          ".tmp/scripts/templates.js": ["<%= yeoman.app %>/scripts/templates/*.ejs"]

    haml:
      options:
        placement: "amd"
        dependencies: {}
        target: "js"
        language: "coffee"

      files:
        expand: true
        cwd: "<%= yeoman.app %>/scripts/templates"
        src: "{,*/}*.haml"
        dest: ".tmp/scripts/templates"
        ext: ".js"

    rev:
      dist:
        files:
          src: [
            "<%= yeoman.dist %>/scripts/{,*/}*.js"
            "<%= yeoman.dist %>/styles/{,*/}*.css"
            "/styles/fonts/{,*/}*.*"
          ]

  grunt.registerTask "createDefaultTemplate", ->
    grunt.file.write ".tmp/scripts/templates.js", "this.JST = this.JST || {};"
    return

  grunt.registerTask "server", (target) ->
    if target is "dist"
      return grunt.task.run([
        "build"
        "open"
        "connect:dist:keepalive"
      ])
    if target is "test"
      return grunt.task.run([
        "clean:server"
        "coffee"
        "createDefaultTemplate"
        "jst"
        "haml"
        "compass:server"
        "connect:test"
        "watch:livereload"
      ])
    grunt.task.run [
      "clean:server"
      "coffee:dist"
      "createDefaultTemplate"
      "jst"
      "haml"
      "compass:server"
      "connect:livereload"
      "watch"
    ]
    return

  grunt.registerTask "test", [
    "clean:server"
    "coffee"
    "createDefaultTemplate"
    "jst"
    "compass"
    "connect:test"
    "mocha"
    "watch:test"
  ]
  grunt.registerTask "build", [
    "clean:dist"
    'version',
    "coffee"
    "createDefaultTemplate"
    "jst"
    "haml"
    "compass:dist"
    "useminPrepare"
    "requirejs"
    "imagemin"
    "htmlmin"
    "concat"
    "copy:bower"
    "cssmin"
    "uglify"
    "copy:bower_min"
    "copy:dist"
    "rev"
    "usemin"
  ]
  grunt.registerTask "default", [
    "jshint"
    "test"
    "build"
  ]

  return
