define ['app', 'templates/products/products_item'], (App, template) ->

  class Product extends Marionette.ItemView
    template: template