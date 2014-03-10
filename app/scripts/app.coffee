define [ 'models/profile', 'controllers/cart', 'collections/cart_items',
  'controllers/check', 'collections/products', 'views/products/products', 'views/header/header',
  'controllers/footer', 'controllers/order', 'models/cart',
  'controllers/modal', 'data/vendor_predefined'], 
( Profile, CartController, CartItems,
CheckController, ProductsCollection, ProductsView, HeaderView,
FooterController, OrderController, Cart,
ModalController, VendorPredefined) ->

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
      vent:  App.vent
      cart:  App.cart
      modal: App.modal

    new CheckController
      app:     App
      profile: App.profile
      cart:    App.cart

    new OrderController
      app:     App
      cart:    App.cart
      profile: App.profile

    productsListView = new ProductsView
      app:        App
      collection: App.products

    App.mainRegion.show productsListView

    headerView = new HeaderView
      app: App
      cart: App.cart
    
    App.headerRegion.show headerView

    new FooterController
      app:     App
      cart:    App.cart
      profile: App.profile
      vent:    App.vent

  App.on 'start', ->
    console.log 'App starting....'

  #App.on 'initialize:after', ->
    #Backbone.history.start()

  App
