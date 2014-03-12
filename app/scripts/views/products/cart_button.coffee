define [ 'templates/products/button_added', 'helpers/application_helpers'], 
(template) ->

  class ProductView extends Marionette.ItemView
    template: template

    bindings:
      '.kormapp-cart-item-quantity': 'quantity'

    onRender: ->
      @stickit()
