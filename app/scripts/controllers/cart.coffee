define ['marionette'], (Marionette) ->

  class CartController extends Marionette.Controller

    initialize: (options) ->
      { @app, @cart } = options

      @app.vent.on 'product:click', @productClick
      #@app.vent.on 'quantity:change', (item, quantity) =>
        #@cart.changeQuantity 
        #if quantity > 0
          #@changeQuantity item, quantity
        #else
          #@deleteItem item

      @app.vent.on 'cart:clean',    => @cleanCart()
      @app.vent.on 'order:created', => @cleanCart()

    productClick: (product) =>
      # Если товар есть в корзине, item будет содержать модельку cartItem
      item = @cart.items.itemOfProduct product
      if !item
        @cart.addProduct product
      else
        @cart.removeProduct product
        #@app.vent.trigger 'cartitem:exists', item

    deleteItem: (item) ->
      # Удаление item из коллекции cart, с сохранением изменения в localStorage
      @app.vent.trigger 'cart:item:deleted'

    cleanCart: ->
      model.destroy() while model = @cart.items.first()
