define ['app', 'marionette'], (App, Marionette) ->

  class Controller extends Marionette.Controller

    initialize: (options) ->
      { collection } = options
      @cart = collection
      @cleanCart()
      App.cart = @cart

      App.vent.on 'cart:add', (product, quantity) =>
        @addToCart product, quantity

      App.vent.on 'cart:clean', =>
        @cleanCart()

      App.vent.on 'order:created', =>
        @cleanCart()

    addToCart: (product, quantity) ->
      # Если товар есть в корзине, item будет содержать модельку cartItem
      item = @_isProductAlreadyInCart product
      if item
        item.set 'quantity', quantity
        item.save()
      else
        @cart.create
          product: product
          quantity: quantity

    cleanCart: ->
      model.destroy() while model = @cart.first()

    _isProductAlreadyInCart: (product) ->
      @cart.find (item) -> item.get('product').id == product.get('id')