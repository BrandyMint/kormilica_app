define ['app', 'marionette', 'views/header/header'], (App, Marionette, View) ->

  class Controller extends Marionette.Controller

    initialize: ->
      @show()

    show: ->
      view = new View collection: App.profile.get 'cart'
      App.headerRegion.show view