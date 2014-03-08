define ['models/profile', 'controllers/cart', 'collections/cart_items',
  'controllers/check', 'collections/products', 'views/products/products', 'controllers/header',
  'views/footer/footer', 'models/cart',
  'controllers/modal'], 
( Profile, CartController, CartItems,
CheckController, ProductsCollection, ProductsView, HeaderController,
FooterView, Cart,
ModalController ) ->

  App = new Marionette.Application

  App.addRegions
    headerRegion: "#header-region"
    mainRegion:   "#main-region"
    footerRegion: "#footer-region"
    checkRegion:  "#check-region"
    modalRegion:  "#modal-region"

  App.modal = new ModalController modalRegion: App.modalRegion

  App.addInitializer (options) ->
    App.vendor = new Backbone.Model options.vendor

    App.categories = new Backbone.Collection options.vendor.categories
    App.products = new ProductsCollection options.vendor.products

    App.profile = new Profile
    App.profile.fetch()

    App.cart = new Cart
    # ДО заполнения корзины продукты уже должны быть
    App.cart.fetch()

    new CartController
      vent: App.vent
      cart: App.cart
      modal: App.modal

    new CheckController
      app:     App
      profile: App.profile
      cart:    App.cart

    productsListView = new ProductsView
      app:        App
      collection: App.products

    App.mainRegion.show productsListView

    new HeaderController 
      app:  App
      cart: App.cart

    footerView = new FooterView
      app:     App
      cart:    App.cart
      profile: App.profile

    App.footerRegion.show footerView

    footerView.on 'checkout:clicked', ->
      App.vent.trigger 'checkout:show'

    footerView.on 'delivery:clicked', ->
      App.vent.trigger 'order:created'

  App.on 'start', ->
    console.log 'App starting....'

  #App.on 'initialize:after', ->
    #Backbone.history.start()

  App
