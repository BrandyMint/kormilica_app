define ['app', 'marionette', 'models/profile'], (App, Marionette, Model) ->

  class Controller extends Marionette.Controller
    
    initialize: (options) ->
      App.profile = new Model
