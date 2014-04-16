define ['templates/check/check_cart_item', 'helpers/application_helpers'], 
(checkCartItemViewTemplate, Helpers) ->

  class CheckCartItemView extends Marionette.ItemView

    template: checkCartItemViewTemplate
    templateHelpers: -> Helpers
    tagName: 'li'

    bindings:
      '@kormapp-cartitem-product-quantity': 'quantity'
      '@kormapp-product-price':
        observe: 'total_cost'
        updateMethod: 'html'
        onGet:   (val) ->
          Helpers.money val

    onRender: ->
      @stickit()

      @stickit @model.product,
        '@kormapp-cartitem-name': 'title'
        '@kormapp-cartitem-product-price':
          observe: 'price'
          onGet:   (val) ->
            Helpers.moneyWithoutCurrency val
