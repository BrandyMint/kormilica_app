define ['models/order'], (Order) ->

  class OrderController extends Marionette.Controller

    initialize: (options) ->
      { @app, @cart, @user, @vendor } = options

      @app.commands.setHandler 'order:create', =>
        @createOrder()

    createOrder: =>
      # total_price, comment, etc
      orderAttributes = @cart.toJSON()

      # phone, name, address
      orderAttributes.user  = @user.toJSON()
      orderAttributes.items = @_getFormattedCartItems()
      orderAttributes.delivery_price = @vendor.get 'delivery_price'

      order = new Order orderAttributes
      order.save null, {
        success: (model, response) =>

          # TODO show cordova alert with subject
          if response.message?.text?
            text = response.message.text
          else
            text = "Ваш заказ №#{response.id}"

          window.navigator.notification.alert text, null, 'Заказ принят'
          @app.vent.trigger 'order:created', response

        error: (model, response) =>
          window.navigator.notification.alert "Заказ не отправлен. #{response.responseText}. Повторите снова", null, 'Ошибка соединения!'
      }

    _getFormattedCartItems: ->
      (for item in @cart.items.toJSON()
        item =
          product_id: item.product_id
          count:      item.quantity
          price:      item.total_cost_cents
      )
