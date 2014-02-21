define ['marionette', 'views/header/header', 'views/products/list'], (Marionette, HeaderView, View) ->
  
  App = new Marionette.Application

  App.addRegions
    headerRegion: "#header-region"
    mainRegion:   "#main-region"
    footerRegion: "#footer-region"

  App.addInitializer ->
    console.log 'App starting...'
    header_view = new HeaderView
    App.headerRegion.show header_view

  App.on 'initialize:after', ->
    Backbone.history.start()

    require ['controllers/products'], ->
      App.trigger 'products:list'

  App