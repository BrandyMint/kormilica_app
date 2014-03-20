#/*global require*/
'use strict'

require.config
  shim:
    underscore:
      exports: '_'
    jquery:
      exports: 'jQuery'
    backbone:
      deps: [
        'underscore'
        'jquery'
      ]
      exports: 'Backbone'
    marionette:
      deps: ['backbone', 'backbone.wreqr', 'backbone.babysitter']
      exports: 'Marionette'
    'jquery.ui.effect':
      deps: ['jquery']
    'jquery.ui.effect-bounce':
      deps: ['jquery.ui.effect']
    'backbone.virtualcollection':
      deps: ['underscore', 'backbone']
    app:
      deps: [
        'marionette', 'notification',
      'backbone.stickit', 'backbone.localStorage',
      'backbone.virtualcollection',
      'jquery.ui.effect', 'jquery.ui.effect-bounce'
      ]

  paths:
    jquery:                  '../bower_components/jquery/jquery'
    underscore:              '../bower_components/underscore/underscore'
    backbone:                '../bower_components/backbone/backbone'
    marionette:              '../bower_components/backbone.marionette/lib/core/backbone.marionette'
    'backbone.stickit':      '../bower_components/backbone.stickit/backbone.stickit'
    'backbone.wreqr':        '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr'
    'backbone.babysitter':   '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter'
    'backbone.localStorage': '../bower_components/backbone.localStorage/backbone.localStorage'
    'backbone.virtualcollection':  '../bower_components/backbone.virtualcollection/backbone.virtual-collection'
    'jquery.ui.effect':        "../bower_components/jquery.ui/ui/jquery.ui.effect"
    'jquery.ui.effect-bounce': "../bower_components/jquery.ui/ui/jquery.ui.effect-bounce"
    'notification':            './libs/notification'

unless @Marionette
  require [
    'backbone',
    'backbone.stickit',
    'backbone.virtualcollection',
    'backbone.localStorage',
    'marionette'
    'jquery.ui.effect',
    'jquery.ui.effect-bounce'
    ], (Backbone, Stickit, VirtualCollection, LocalStorage, Marionette)  =>
      @Marionette = Marionette

unless window.navigator?.notification?
  require ['notification'], (Notification) ->
    window.navigator = {} unless window.navigator?
    window.navigator.notification = Notification


require ['app', 'data/bundle'], (KormApp, bundle) =>
  window.KormApp = KormApp
  KormApp.start bundle
