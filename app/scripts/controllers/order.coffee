define ['models/order', 'settings'], (Order, Settings) ->

  class OrderController extends Marionette.Controller

    initialize: (options) ->
      { @app, @cart, @user, @vendor } = options

      @app.commands.setHandler 'order:create', @createOrder

    createOrder: =>
      # total_price, comment, etc
      orderAttributes = @cart.toJSON()

      # phone, name, address
      orderAttributes.user  = @user.toJSON()
      orderAttributes.items = @_getFormattedCartItems()
      orderAttributes.delivery_price = @vendor.get 'delivery_price'

      order = new Order orderAttributes
      debugger
      #order.urlRoot = Settings.routes.orders_url()
      order.save null, {
        url: Settings.routes.orders_url()
        headers:
          'X-Vendor-Key': @vendor.get 'key'

        success: (model, response) =>

          # TODO show cordova alert with subject
          if response.message?
            text = response.message.text
            subject = response.message.subject
          else
            text = "Ваш заказ №#{response.id}"
            subject = 'Заказ принят'

          window.navigator.notification.alert text, null, subject
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
