define [
  'models/user', 'models/vendor',
  'models/cart',
  'collections/cart_items',
  'collections/products', 'collections/categories',
], (
  User, Vendor,
  Cart,
  CartItems,
  ProductsCollection, CategoriesCollection,
) ->
    (App, bundle) ->
      App.vendor     = new Vendor()
      App.categories = new CategoriesCollection()
      App.products   = new ProductsCollection()

      App.user = new User
      App.user.fetch()

      if App.user.get('lastUpdateAt')?
        App.vendor.fetch()
        App.categories.fetch()
        App.products.fetch()
      else
        App.vendor.set     bundle.vendor
        App.categories.set bundle.categories
        App.products.set   bundle.products

      App.cart = new Cart()
      App.cart.fetch()

      App.cart.reattachProductsFromCollection App.products
