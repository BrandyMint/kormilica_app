define ['marionette',  'backbone', 'models/profile', 'controllers/cart', 'collections/cart', 'controllers/quantity_selector', 'controllers/check', 'collections/products', 'views/products/list', 'controllers/header', 'views/footer/footer', 'models/cart'], 
(Marionette, Backbone, ProfileModel, CartController, CartItems, QuantitySelectorController, CheckController, ProductsCollection, ProductsView, HeaderController, FooterView, Cart) ->
  
  window.App = new Marionette.Application

  App.addRegions
    headerRegion: "#header-region"
    mainRegion:   "#main-region"
    footerRegion: "#footer-region"
    checkRegion:  "#check-region"
    modalRegion:  "#modal-region"

  App.addInitializer (options) ->
    App.products = new ProductsCollection

    App.profile = new ProfileModel
    App.profile.fetch()

    App.categories = new Backbone.Collection

    App.cart      = new Cart

    $.get options.data_file, (data) ->
      console.log 'Load', options.data_file
      App.profile.set data
      App.products.reset data.products
      App.categories.reset data.categories

      # ДО заполнения корзины продукты уже должны быть
      App.cart.fetch()

    new CartController
      app: App
      cartItems: App.cart.items

    new QuantitySelectorController App: App

    new CheckController
      App: App
      profile: App.profile
      cartItems: App.cart.items

    productsListView = new ProductsView
      App: App
      collection: App.products
    App.mainRegion.show productsListView

    new HeaderController 
      app:  App
      cart: App.cart

    footerView = new FooterView
      app: App
      cartItems: App.cart.items
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
