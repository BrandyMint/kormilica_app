define ['app', 'marionette', 'views/products/list_item'], (App, Marionette, ItemView) ->

  class ProductsView extends Marionette.CollectionView
    itemView: ItemView

    initialize: (options) ->
      { @App } = options

    itemViewOptions: =>
      App: @App
