define ['marionette', 'data/products', 'collections/products', 'views/products/list', 'models/profile', 'views/header/header'],
(Marionette, products, ProductsCollection, ProductsView, ProfileModel, HeaderView) ->
  
  App = new Marionette.Application

  App.addRegions
    headerRegion: "#header-region"
    mainRegion:   "#main-region"
    footerRegion: "#footer-region"

  App.addInitializer ->
    productsCollection = new ProductsCollection products
    productsListView = new ProductsView collection: productsCollection
    @mainRegion.show productsListView

    @profile = new ProfileModel

    require ['controllers/cart'], (CartController) ->
      new CartController
    headerView = new HeaderView collection: App.profile.get 'cart'
    App.headerRegion.show headerView

  App.on 'start', ->
    console.log 'App starting...'

  App.on 'initialize:after', ->
    Backbone.history.start()

  App