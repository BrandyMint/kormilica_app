define ['marionette'], (Marionette) ->
  
  App = new Marionette.Application

  App.addRegions
    headerRegion: "#header-region"
    mainRegion:   "#main-region"
    footerRegion: "#footer-region"

  App.addInitializer ->
    require ['collections/products', 'views/products/list', 'data/products'], (Collection, View, products) =>
      productsListCollection = new Collection products
      productsListView = new View collection: productsListCollection
      App.mainRegion.show productsListView

    require [
      'controllers/cart'
      'controllers/profile'
      'controllers/header'
      'controllers/footer'
      ], (CartController, ProfileController, HeaderController, FooterController) ->
      new ProfileController
      new CartController
      new HeaderController
      new FooterController

  App.on 'start', ->
    console.log 'App starting...'

  App.on 'initialize:after', ->
    Backbone.history.start()

  App