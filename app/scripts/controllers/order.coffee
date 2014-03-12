define ['models/order'], (Order) ->

  class OrderController extends Marionette.Controller

    initialize: (options) ->
      { @app, @cart, @user } = options

      @app.commands.setHandler 'order:create', =>
        @createOrder()

    createOrder: =>
      # total_price, comment, etc
      orderOptions =  @cart.toJSON()

      # phone, name, address
      orderOptions.user  = @user.toJSON()
      orderOptions.items = @_getFormattedCartItems()

      order = new Order orderOptions
      order.save null, {
        success: (model, response) =>

          # TODO show cordova alert with subject
          if response.message?.text?
            text = response.message.text
          else
            text = "Ваш заказ №#{response.id}"

          alert text
          @app.vent.trigger 'order:created', response
      }

    _getFormattedCartItems: ->
      (for item in @cart.items.toJSON()
        item =
          product_id: item.product_id
          count:      item.quantity
          price:      item.total_cost_cents
      )
