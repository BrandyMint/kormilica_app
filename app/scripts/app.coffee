define [
  'controllers/cart', 'controllers/check',
  'views/header/header',
  'views/products/products',
  'views/modal_windows/vendor_page',
  'controllers/footer', 'controllers/order',
  'controllers/update_manager',
  'controllers/checkout',
  'controllers/modal',
  'views/wide_layout',
  'views/narrow_layout',
  'views/categories/category_list',
  'controllers/data_repository',
  'controllers/reflection',
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
WideLayout,
NarrowLayout,
CategoryList,
DataPreloader,
Reflection
) ->

  App = new Marionette.Application
  App.version = '0.1.30' # Переустанавливается через grunt version

  App.addInitializer ({bundle, type}) ->
    App.bundle = bundle
    console.log "App initialize", Date.now()
    DataPreloader App, bundle

    #TODO turned off temporarily
    # resets local changes to categories on update
    ###
    App.updateManager = new UpdateManager
      user:       App.user
      cart:       App.cart
      vendor:     App.vendor
      categories: App.categories
      products:   App.products
    ###

    App.mainLayout = if type == 'wide'
      new WideLayout()
    else
      new NarrowLayout()

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
      modal: App.modal

    new OrderController
      app:    App
      cart:   App.cart
      user:   App.user
      vendor: App.vendor

    sorted_products = new Backbone.VirtualCollection(
      App.products,
      comparator: 'position',
      filter: { category_id: App.categories.first()?.id })

    if type == 'wide'
      App.mainLayout.categories.show new CategoryList
          app: App
          collection: App.categories
          products: sorted_products

    App.mainLayout.products.show new ProductsView
        app: App
        collection: sorted_products

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

      document.addEventListener 'backbutton', ((e) ->
        App.vent.trigger('device:backbutton')
        e.preventDefault()
        e.stopPropagation()
      ), false

      userAgent = navigator.userAgent
      #android = userAgent.match(/(Android)/g)
      ios = userAgent.match(/(iPhone|iPad)/g)
      ios7 = userAgent.match(/OS 7_1/) if ios
      cordova_ios = window.cordova.platformId?.match(/ios/)
      if cordova_ios && ios7
        $('body').addClass 'kormapp-body-ios7'


    new Reflection()

    document.addEventListener "deviceready", onDeviceReady, false

    console.log "start:finish", Date.now()

  App
