define ['marionette',  'backbone', 'backbone.stickit'
  'models/profile', 'controllers/cart', 'collections/cart_items', 'controllers/quantity_selector',
  'controllers/check', 'collections/products', 'views/products/products', 'controllers/header',
  'views/footer/footer', 'models/cart'], 
(Marionette, Backbone, Stickit,
Profile, CartController, CartItems, QuantitySelectorController,
CheckController, ProductsCollection, ProductsView, HeaderController,
FooterView, Cart) ->

  window.App = new Marionette.Application

  App.addRegions
    headerRegion: "#header-region"
    mainRegion:   "#main-region"
    footerRegion: "#footer-region"
    checkRegion:  "#check-region"
    modalRegion:  "#modal-region"

  App.addInitializer (options) ->
    App.cart = new Cart()

    App.products = new ProductsCollection

    App.profile = new Profile()
    App.profile.fetch()

    App.categories = new Backbone.Collection


    $.get options.data_file, (data) ->
      console.log 'Load', options.data_file
      App.profile.set data
      App.products.reset data.products
      App.categories.reset data.categories

      # ДО заполнения корзины продукты уже должны быть
      App.cart.fetch()

    new CartController
      app: App
      cart: App.cart

    new QuantitySelectorController app: App

    new CheckController
      app: App
      profile: App.profile
      cart: App.cart

    productsListView = new ProductsView
      app: App
      collection: App.products
    App.mainRegion.show productsListView

    new HeaderController 
      app:  App
      cart: App.cart

    footerView = new FooterView
      app:      App
      cart:     App.cart
      profile:  App.profile

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
