define ['marionette'], (Marionette) ->
  
  App = new Marionette.Application

  App.addRegions
    headerRegion: "#header-region"
    mainRegion:   "#main-region"
    footerRegion: "#footer-region"

  App.on 'start', ->
    require [
      'controllers/cart'
      'controllers/profile'
      'controllers/header'
      'controllers/products'
      'controllers/footer'
      ], (CartController, ProfileController, HeaderController, ProductsController, FooterController) ->
      new ProfileController
      new CartController
      new HeaderController
      new ProductsController
      new FooterController

  App.on 'start', ->
    console.log 'App starting...'

  App.on 'initialize:after', ->
    Backbone.history.start()

  App