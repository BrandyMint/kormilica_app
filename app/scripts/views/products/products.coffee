define ['app', 'marionette', 'views/products/product'], (App, Marionette, ProductView) ->

  class ProductsView extends Marionette.CollectionView
    itemView: ProductView

    initialize: (options) ->
      { @app } = options

    itemViewOptions: =>
      app: @app
      cartItems: @app.cart.items