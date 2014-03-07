define ['marionette'], (Marionette) ->

  class CartController extends Marionette.Controller

    initialize: (options) ->
      { @app, @cartItems } = options

      @app.vent.on 'cart:add', (product, quantity=1) =>
        debugger
        @addToCart product, quantity

      @app.vent.on 'quantity:change', (item, quantity) =>
        if quantity > 0
          @changeQuantity item, quantity
        else
          @deleteItem item

      @app.vent.on 'cart:clean',    => @cleanCart()
      @app.vent.on 'order:created', => @cleanCart()

    addToCart: (product, quantity) ->
      # Если товар есть в корзине, item будет содержать модельку cartItem
      item = @cartItems.isProductInCart product
      if !item
        newItem = @cartItems.create
                    product: product
                    quantity: quantity
        @app.vent.trigger 'cartitem:added', newItem
      else
        @app.vent.trigger 'cartitem:exists', item

    deleteItem: (item) ->
      # Удаление item из коллекции cart, с сохранением изменения в localStorage
      @cartItem.get(item.id).destroy()
      @app.vent.trigger 'cart:item:deleted'

    changeQuantity: (item, quantity) ->
      item.set 'quantity', quantity
      item.save()

    cleanCart: ->
      model.destroy() while model = @cartItem.first()

