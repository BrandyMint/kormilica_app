#/*global require*/
'use strict'

require.config
  shim:
    underscore:
      exports: '_'
    backbone:
      deps: [
        'underscore'
        'jquery'
      ]
      exports: 'Backbone'
    marionette:
      deps: ['backbone', 'backbone.wreqr', 'backbone.babysitter']
      exports: 'Marionette'
    bootstrap:
      deps: ['jquery'],
      exports: 'jquery'

  paths:
    jquery: '../bower_components/jquery/jquery'
    backbone: '../bower_components/backbone/backbone'
    marionette: '../bower_components/backbone.marionette/lib/core/backbone.marionette'
    'backbone.wreqr': '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr'
    'backbone.babysitter': '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter'
    underscore: '../bower_components/underscore/underscore'
    bootstrap: '../bower_components/sass-bootstrap/dist/js/bootstrap'

require ['app'], (App) ->
  App.start()
