define ['marionette',  'backbone', 'models/profile', 'controllers/cart', 'collections/cart_items', 'controllers/quantity_selector', 'controllers/check', 'collections/products', 'views/products/list', 'controllers/header', 'views/footer/footer'],
(Marionette, Backbone, ProfileModel, CartController, CartItems, QuantitySelectorController, CheckController, ProductsCollection, ProductsView, HeaderController, FooterView) ->
  
  window.App = new Marionette.Application

  App.addRegions
    headerRegion: "#header-region"
    mainRegion:   "#main-region"
    footerRegion: "#footer-region"
    checkRegion:  "#check-region"
    modalRegion:  "#modal-region"

  App.addInitializer (options) ->
    App.profile = new ProfileModel
    App.profile.fetch()

    App.cartItems = new CartItems
    App.cartItems.fetch()

    App.categories = new Backbone.Collection

    App.products = new ProductsCollection

    $.get options.data_file, (data) ->
      console.log 'Load', options.data_file
      App.profile.set data
      App.products.reset data.products
      App.categories.reset data.categories

    new CartController
      App: App
      collection: App.cartItems

    new QuantitySelectorController App: App

    new CheckController
      App: App
      profile: App.profile
      cart: App.cart

    productsListView = new ProductsView
      App: App
      collection: App.products
    App.mainRegion.show productsListView

    new HeaderController 
      App: App
      collection: App.cart

    footerView = new FooterView
      App: App
      collection: App.cart
      profile:    App.profile
    App.footerRegion.show footerView

    footerView.on 'checkout:clicked', ->
      App.vent.trigger 'checkout:show'

    footerView.on 'delivery:clicked', ->
      App.vent.trigger 'order:created'

  App.on 'start', ->
    console.log 'App starting....'

  App.on 'initialize:after', ->
    Backbone.history.start()

  App
