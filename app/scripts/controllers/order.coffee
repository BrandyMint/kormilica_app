define ['models/order'], (Order) ->

  class OrderController extends Marionette.Controller

    initialize: (options) ->
      { @app, @cart, @profile } = options

      @app.commands.setHandler 'order:create', =>
        @createOrder()

    createOrder: =>
      orderOptions = 
        "user":
          "phone": @profile.get 'phone'
          "name":  @profile.get 'name'
        "items": @_getFormattedCartItems()
        "total_price": @cart.get 'total_cost'

      order = new Order orderOptions
      order.save null, {
        success: (model, response) =>
          alert "Ваш заказ №#{response.id}"
          @app.vent.trigger 'order:created', response
      }

    _getFormattedCartItems: ->
      (for item in @cart.items.toJSON()
        item =
          product_id: item.product_id
          count:      item.quantity
          price:      item.total_cost_cents
      )