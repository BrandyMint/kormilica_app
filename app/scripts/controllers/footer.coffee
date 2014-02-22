define ['app', 'marionette', 'views/footer/footer'], (App, Marionette, View) ->

  class Controller extends Marionette.Controller

    initialize: ->
      @show()
    
    show: ->
      view = new View
      App.footerRegion.show view