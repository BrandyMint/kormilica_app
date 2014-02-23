define ['app', 'marionette', 'collections/cart'], (App, Marionette, Collection) ->

  class Controller extends Marionette.Controller

    initialize: ->
      @cart = new Collection
      @cart.fetch()
      App.profile.set 'cart', @cart

      App.vent.on 'cart:add', (product, quantity) =>
        @addToCart product, quantity

      App.vent.on 'cart:clean', =>
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