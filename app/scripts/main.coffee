#/*global require*/
'use strict'

require.config
  shim:
    underscore:
      exports: '_'
    #backbone:
      #deps: [
        #'underscore'
        #'jquery'
      #]
      #exports: 'Backbone'
    #marionette:
      #deps: ['backbone', 'backbone.wreqr', 'backbone.babysitter']
      #exports: 'Marionette'
    #bootstrap:
      #deps: ['jquery'],
      #exports: 'jquery'
    #'jquery.form-serialize': ['jquery']

  paths:
    jquery:                  '../bower_components/jquery/jquery'
    underscore:              '../bower_components/underscore/underscore'
    #backbone:                '../bower_components/backbone/backbone'
    #marionette:              '../bower_components/backbone.marionette/lib/core/backbone.marionette'
    # 'backbone.virtualcollection':  '../bower_components/backbone.virtualcollection/backbone.virtual-collection'
    #'backbone.stickit':      '../bower_components/backbone.stickit/backbone.stickit'
    #'backbone.wreqr':        '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr'
    #'backbone.babysitter':   '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter'
    #'backbone.localStorage': '../bower_components/backbone.localStorage/backbone.localStorage'
    #bootstrap:               '../bower_components/sass-bootstrap/dist/js/bootstrap'
    'form-serialize': 'lib/form-serialize'
    #'jquery.bounce':         'lib/bounce'
