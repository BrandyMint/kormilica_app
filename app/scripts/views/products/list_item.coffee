define ['app', 'marionette', 'templates/products/list_item'], (App, Marionette, template) ->

  class Product extends Marionette.ItemView
    template: template
    className: 'product-block'