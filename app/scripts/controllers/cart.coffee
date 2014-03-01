define ['app', 'marionette'], (App, Marionette) ->

  class Controller extends Marionette.Controller

    initialize: (options) ->
      { collection } = options
      @cart = collection
      # @cleanCart()
      App.cart = @cart

      App.vent.on 'cart:add', (product, quantity) =>
        @addToCart product, quantity

      App.vent.on 'quantity:change', (item, quantity) =>
        if quantity > 0
          @changeQuantity item, quantity
        else
          @deleteItem item

      App.vent.on 'cart:clean', =>
        @cleanCart()

      App.vent.on 'order:created', =>
        @cleanCart()

    addToCart: (product, quantity) ->
      # Если товар есть в корзине, item будет содержать модельку cartItem
      item = @_isProductAlreadyInCart product
      if !item
        @cart.create
          product: product
          quantity: quantity
      else
        App.vent.trigger 'cartitem:exists', item
    
    deleteItem: (item) ->
      # Удаление item из коллекции cart, с сохранением изменения в localStorage
      @cart.get(item.id).destroy()

    changeQuantity: (item, quantity) ->
      item.set 'quantity', quantity
      item.save()

    cleanCart: ->
      model.destroy() while model = @cart.first()

    _isProductAlreadyInCart: (product) ->
      @cart.find (item) -> item.get('product').id == product.get('id')