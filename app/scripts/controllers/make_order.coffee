define ['models/order', 'settings'], (Order, Settings) ->

  class MakeOrderController extends Marionette.Controller

    initialize: (options) ->
      { @app, @user, @vendor } = options

    perform: (cart) ->
      order = new Order @orderAttributes cart
      order.save null, {
        url: Settings.routes.orders_url()
        headers:
          'X-Vendor-Key': @vendor.get 'key'

        success: (model, response) =>
          @app.vent.trigger 'order:created', response
          @successAlert response

        error: (model, response) =>
          @app.vent.trigger 'order:failed', response
          @errorAlert response
      }

    errorAlert: (response) ->
      window.navigator.notification.alert "Заказ не отправлен. #{response.responseText}. Повторите снова", null, 'Ошибка соединения!'

    successAlert: (response) ->
      if response.message?
        text = response.message.text
        subject = response.message.subject
      else
        text = "Ваш заказ №#{response.id}"
        subject = 'Заказ отправлен'

      window.navigator.notification.alert text, null, subject


    orderAttributes: (cart) ->
      # total_price, comment, etc
      orderAttributes = cart.toJSON()

      # phone, name, address
      u  = @user.toJSON()
      u.phone = u.phone_prefix + u.phone
      orderAttributes.user = u
      orderAttributes.items = @presentCartItems cart.items

      return orderAttributes

    presentCartItems: (items) ->
      (for item in items.toJSON()
        item =
          product_id: item.product_id
          count:      item.quantity
          price:      item.total_cost_cents
      )
