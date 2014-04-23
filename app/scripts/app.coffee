define [
  'controllers/cart',
  'controllers/check',
  'views/header/header',
  'views/products/products',
  'views/modal_windows/vendor_page',
  'controllers/footer',
  'controllers/order',
  'controllers/update_manager',
  'controllers/checkout',
  'controllers/modal',
  'views/wide_layout',
  'views/narrow_layout',
  'views/categories/category_list',
  'views/categories/category_list_narrow',
  'pull_down/layout',
  'pull_down/controller',
  'views/check/check',
  'controllers/data_repository',
  'controllers/reflection',
  'controllers/current_category'
],
(
CartController,
CheckController,
HeaderView,
ProductsView,
VendorPageView,
FooterController,
OrderController,
UpdateManager,
CheckoutController,
ModalController,
WideLayout,
NarrowLayout,
CategoryList,
CategoryListNarrow,
PullDownLayout,
PullDownController,
CheckView,
DataPreloader,
Reflection,
CurrentCategoryController
) ->

  App = new Marionette.Application
  App.version = '0.1.31' # Переустанавливается через grunt version

  App.addInitializer ({bundle}) ->
    App.bundle = bundle
    console.log "App initialize", Date.now()
    App.isWide = document.body.clientWidth > 992
    DataPreloader App, bundle

    App.updateManager = new UpdateManager
      user:       App.user
      profile:    App.profile
      cart:       App.cart
      vendor:     App.vendor
      categories: App.categories
      products:   App.products

    App.mainLayout = if App.isWide
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

    new OrderController
      app:    App
      cart:   App.cart
      user:   App.user
      vendor: App.vendor

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

    sorted_products = new Backbone.VirtualCollection(
      App.products,
      comparator: 'position',
      filter: { category_id: App.profile.get('current_category_id') })

    categoryListView = if App.isWide
      new CategoryList
        collection: App.categories
        profile: App.profile
    else
      new CategoryListNarrow
        collection: App.categories
        profile: App.profile

    if App.categories.length > 1
      if App.isWide
        App.mainLayout.categories.show categoryListView
      else
        pullDownLayout = new PullDownLayout
          view: categoryListView
        new PullDownController
          view: pullDownLayout
          workHeight: headerView.$el.height()
        App.mainLayout.categories.show pullDownLayout

    if App.isWide
      App.mainLayout.checkRegion.show new CheckView
        app:    App
        user:   App.user
        cart:   App.cart
        vendor: App.vendor
        modal:  App.modal
    else
      new CheckController
        app:    App
        user:   App.user
        cart:   App.cart
        vendor: App.vendor
        modal:  App.modal

    new CurrentCategoryController
      profile: App.profile
      sorted: sorted_products

    App.mainLayout.products.show new ProductsView
        app: App
        collection: sorted_products

    unless App.isWide
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
