define [ 'models/user', 'models/vendor',
  'controllers/cart', 'collections/cart_items',
  'controllers/check', 'collections/products',
  'views/header/header',
  'views/products/products',
  'views/modal_windows/vendor_page',
  'controllers/footer', 'controllers/order', 'models/cart',
  'controllers/update_manager',
  'controllers/modal',
  'views/main_layout'
],
( User, Vendor,
CartController, CartItems,
CheckController, ProductsCollection,
HeaderView, 
ProductsView,
VendorPageView,
FooterController, OrderController, Cart,
UpdateManager,
ModalController,
MainLayout
) ->

  App = new Marionette.Application
  App.version = '0.1.7' # Переустанавливается через grunt version

  App.addInitializer (options) ->
    App.vendor     = new Vendor              options.vendor
    App.categories = new Backbone.Collection options.categories
    App.products   = new ProductsCollection  options.products

    App.user = new User
    App.user.fetch()

    App.cart = new Cart({}, app: @)
    # ДО заполнения корзины продукты уже должны быть
    App.cart.fetch()

    App.updateManager = new UpdateManager
      cart:       App.cart
      vendor:     App.vendor
      categories: App.categories
      products:   App.products

    # Сюда можно передавать el основого контейнера
    App.mainLayout = new MainLayout()
    App.mainLayout.render()

    App.modal = new ModalController modalRegion: App.mainLayout.modalRegion

    new CartController
      vent:  App.vent
      cart:  App.cart
      modal: App.modal

    new CheckController
      app:  App
      user: App.user
      cart: App.cart

    new OrderController
      app:  App
      cart: App.cart
      user: App.user

    productsListView = new ProductsView
      app:        App
      collection: App.products

    App.mainLayout.mainRegion.show productsListView

    headerView = new HeaderView
      app:    App
      cart:   App.cart
      vendor: App.vendor

    headerView.on 'logo:clicked', ->
      App.modal.show new VendorPageView model: App.vendor

    App.mainLayout.headerRegion.show headerView

    new FooterController
      app:    App
      cart:   App.cart
      user:   App.user
      vent:   App.vent
      vendor: App.vendor

  App.on 'start', ->
    console.log "Start KormApp #{App.version}"

  App.on 'initialize:after', ->
    App.updateManager.perform()

  App
