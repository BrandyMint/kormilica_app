define ['views/modal_windows/quantity_selector'], (QuantitySelectorView) ->

  class CartController extends Marionette.Controller

    initialize: (options) ->
      { @vent, @modal, @cart } = options

      @vent.on 'product:click', @productClick

      @vent.on 'order:created', => @cleanCart()

    productClick: (product) =>
      # Если товар есть в корзине, item будет содержать модельку cartItem
      item = @cart.items.itemOfProduct product
      if item
        @modal.show new QuantitySelectorView model: item
      else
        @cart.addProduct product

    cleanCart: ->
      model.destroy() while model = @cart.items.first()
