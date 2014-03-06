define ['marionette', 'data/products', 'models/profile', 'controllers/cart', 'collections/cart', 'controllers/quantity_selector', 'controllers/check', 'collections/products', 'views/products/list', 'controllers/header', 'views/footer/footer'], 
(Marionette, productsData, ProfileModel, CartController, CartItems, QuantitySelectorController, CheckController, ProductsCollection, ProductsView, HeaderController, FooterView) ->
  
  App = new Marionette.Application

  App.addRegions
    headerRegion: "#header-region"
    mainRegion:   "#main-region"
    footerRegion: "#footer-region"
    checkRegion:  "#check-region"
    modalRegion:  "#modal-region"

  App.addInitializer ->
    App.profile = new ProfileModel
    App.profile.fetch()

    cartItems = new CartItems
    cartItems.fetch()
    
    new CartController
      app: App
      collection: cartItems

    new QuantitySelectorController app: App

    new CheckController 
      app: App
      profile: App.profile
      cart: App.cart

    productsListCollection = new ProductsCollection productsData
    productsListView = new ProductsView 
      app: App
      collection: productsListCollection
    App.mainRegion.show productsListView

    new HeaderController 
      app: App
      collection: App.cart

    footerView = new FooterView
      app: App
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