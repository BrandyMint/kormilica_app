define [ 'templates/products/button_added', 'helpers/application_helpers'], 
(template) ->

  class ProductView extends Marionette.ItemView
    template: template

    bindings:
      '.karmapp-cart_item-quantity': 'quantity'

    onRender: ->
      @stickit()
