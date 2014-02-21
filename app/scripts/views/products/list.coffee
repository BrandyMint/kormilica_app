define ['app', 'views/products/list_item'], (App, ItemView) ->

  class Products extends Marionette.CollectionView
    itemView: ItemView
