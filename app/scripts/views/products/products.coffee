define ['views/products/product'], (ProductView) ->

  class ProductsView extends Marionette.CollectionView
    itemView: ProductView

    initialize: (options) ->
      { @app } = options

    itemViewOptions: =>
      app: @app
      cartItems: @app.cart.items