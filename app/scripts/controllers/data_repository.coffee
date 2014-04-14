define [
  'models/user', 'models/vendor',
  'models/profile',
  'models/cart',
  'collections/cart_items',
  'collections/products', 'collections/categories',
], (
  User, Vendor,
  Profile,
  Cart,
  CartItems,
  ProductsCollection, CategoriesCollection,
) ->
    (App, bundle) ->

      if window.localStorage.kormapp_version != App.version
        console.log "Clear localStorage"
        # TODO Постараться сохранить корзину
        window.localStorage.clear()
        window.localStorage.kormapp_version = App.version
        if bundle.vendor.is_demo
          _.defer ->
            window.navigator.notification.alert "Это демонстрационное приложение! Заказы не исполняются.", null, 'Внимание!'

      App.vendor     = new Vendor()
      App.categories = new CategoriesCollection()
      App.products   = new ProductsCollection()

      App.user = new User()
      App.user.fetch()

      if false && App.user.get('lastUpdateAt')?
        App.vendor.fetch()
        App.categories.fetch()
        App.products.fetch()
      else
        App.vendor.set     bundle.vendor
        App.categories.set bundle.categories
        App.products.set   bundle.products

      App.cart = new Cart {}, App.products
      App.cart.fetch()

      App.profile = new Profile()
      App.profile.fetch()

      #App.cart.reattachProductsFromCollection App.products
