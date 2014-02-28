define ['marionette', 'data/products'], (Marionette, productsData) ->
  
  window.App = new Marionette.Application

  App.addRegions
    headerRegion: "#header-region"
    mainRegion:   "#main-region"
    footerRegion: "#footer-region"
    checkRegion:  "#check-region"

  App.addInitializer ->
    require ['models/profile'], (ProfileModel) =>
      App.profile = new ProfileModel
      App.profile.fetch()

    require ['controllers/cart', 'collections/cart'], (CartController, CartCollection) ->
      cartCollection = new CartCollection
      cartCollection.fetch()
      new CartController collection: cartCollection

    require ['controllers/check'], (CheckController) ->
      new CheckController 
        profile: App.profile
        cart: App.cart

    require ['collections/products', 'views/products/list'], (ProductsCollection, ProductsView) =>
      productsListCollection = new ProductsCollection productsData
      productsListView = new ProductsView collection: productsListCollection
      App.mainRegion.show productsListView

    require ['views/header/header'], (HeaderView) ->
      headerView = new HeaderView collection: App.cart
      App.headerRegion.show headerView

    require ['views/footer/footer'], (FooterView) ->
      footerView = new FooterView collection: App.cart
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