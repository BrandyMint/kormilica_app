define ['app', 'marionette', 'views/products/list_item'], (App, Marionette, ItemView) ->

  class Products extends Marionette.CollectionView
    itemView: ItemView
