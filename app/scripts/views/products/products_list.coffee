define ['app', 'marionette', 'views/products/products_list_item'], (App, Marionette, ProductsListItemView) ->

  class Products extends Marionette.CollectionView
    itemView: ProductsListItemView

    initialize: (options) ->
      { @app } = options

    itemViewOptions: =>
      app: @app