define ['marionette'], (Marionette) ->

  class CartController extends Marionette.Controller

    initialize: (options) ->
      { collection, @app } = options

      @cart = collection
      # @cleanCart()
      @app.cart = @cart

      @app.reqres.setHandler 'cart:item', (product) =>
        @_isProductAlreadyInCart product

      @app.vent.on 'cart:add', (product, quantity) =>
        @addToCart product, quantity

      @app.vent.on 'quantity:change', (item, quantity) =>
        if quantity > 0
          @changeQuantity item, quantity
        else
          @deleteItem item

      @app.vent.on 'cart:clean', =>
        @cleanCart()

      @app.vent.on 'order:created', =>
        @cleanCart()

    addToCart: (product, quantity) ->
      # Если товар есть в корзине, item будет содержать модельку cartItem
      item = @_isProductAlreadyInCart product
      if !item
        newItem = @cart.create
                    product: product
                    quantity: quantity
        @app.vent.trigger 'cartitem:added', newItem
      else
        @app.vent.trigger 'cartitem:exists', item
    
    deleteItem: (item) ->
      # Удаление item из коллекции cart, с сохранением изменения в localStorage
      @cart.get(item.id).destroy()
      @app.vent.trigger 'cart:item:deleted'

    changeQuantity: (item, quantity) ->
      item.set 'quantity', quantity
      item.save()

    cleanCart: ->
      model.destroy() while model = @cart.first()

    _isProductAlreadyInCart: (product) ->
      @cart.find (item) -> item.get('product').id == product.get('id')