define ['marionette'], (Marionette) ->
  
  App = new Marionette.Application

  App.addRegions
    headerRegion: "#header-region"
    mainRegion:   "#main-region"
    footerRegion: "#footer-region"

  App.on 'start', ->
    console.log 'App starting...'

  App.on 'initialize:after', ->
    Backbone.history.start()

  App