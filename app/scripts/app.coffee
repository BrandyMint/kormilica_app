define [
  'controllers/cart', 'controllers/check',
  'views/header/header',
  'views/products/products',
  'views/modal_windows/vendor_page',
  'controllers/footer', 'controllers/order',
  'controllers/update_manager',
  'controllers/checkout',
  'controllers/modal',
  'views/main_layout',
  'controllers/data_repository',
  'controllers/reflection'
],
(
CartController, 
CheckController, 
HeaderView, 
ProductsView,
VendorPageView,
FooterController, OrderController,
UpdateManager,
CheckoutController,
ModalController,
MainLayout,
DataPreloader,
Reflection
) ->

  App = new Marionette.Application
  App.version = '0.1.30' # Переустанавливается через grunt version

  App.addInitializer ({bundle}) ->
    App.bundle = bundle
    console.log "App initialize", Date.now()
    DataPreloader App, bundle

    App.updateManager = new UpdateManager
      user:       App.user
      cart:       App.cart
      vendor:     App.vendor
      categories: App.categories
      products:   App.products

    # Сюда можно передавать el основого контейнера
    App.mainLayout = new MainLayout()
    App.mainLayout.render()

    App.modal = new ModalController
      modalRegion: App.mainLayout.modalRegion
      vent: App.vent

    new CartController
      vent:  App.vent
      cart:  App.cart
      modal: App.modal

    new CheckController
      app:    App
      user:   App.user
      cart:   App.cart
      vendor: App.vendor

    new OrderController
      app:    App
      cart:   App.cart
      user:   App.user
      vendor: App.vendor

    sorted_products = new Backbone.VirtualCollection App.products, comparator: 'position'

    productsListView = new ProductsView
      app:        App
      collection: sorted_products

    App.mainLayout.mainRegion.show productsListView

    headerView = new HeaderView
      app:    App
      cart:   App.cart
      vendor: App.vendor

    headerView.on 'logo:clicked', ->
      App.modal.show new VendorPageView
        version:       App.version
        model:         App.vendor
        user:          App.user
        updateManager: App.updateManager

    App.mainLayout.headerRegion.show headerView

    new FooterController
      app:    App
      cart:   App.cart
      user:   App.user
      vent:   App.vent
      vendor: App.vendor

    new CheckoutController
      app:    App
      cart:   App.cart
      vendor: App.vendor
      vent:   App.vent

  App.on 'start', ->
    console.log "Start KormApp #{App.version}", Date.now()
    if App.bundle.update == 'now'
      App.updateManager.perform()

    onDeviceReady = ->
      console.log 'onDeviceReady fired'
      navigator?.splashscreen?.hide()
      ImgCache.options.debug = true
      ImgCache.init()

      document.addEventListener 'backbutton', ((e) ->
        App.vent.trigger('device:backbutton')
        e.preventDefault()
        e.stopPropagation()
      ), false

    new Reflection()

    document.addEventListener "deviceready", onDeviceReady, false
    document.addEventListener 'ImgCacheReady', (-> App.trigger 'img-cache:ready'), false

    console.log "start:finish", Date.now()

  App
