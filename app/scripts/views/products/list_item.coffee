define ['app', 'marionette', 'templates/products/products_item'], (App, Marionette, template) ->

  class Product extends Marionette.ItemView
    template: template