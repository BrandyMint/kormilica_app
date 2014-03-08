define ['models/order'], (Order) ->

  class OrdersController extends Marionette.Controller

    initialize: (options) ->
      { @cart, @profile, @vent, @app } = options

      @vent.on 'delivery:clicked', =>
        @createOrder()

    createOrder: =>
      formData = @app.request 'form:data'
      # TODO: найти место где можно сохранять данные в профиле
      @profile.save 
        name: formData.name
        phone: formData.phone

      orderOptions = 
        "user":
          "phone": formData.phone
          "name":  formData.name
        "items": @_getFormattedCartItems()
        "total_price": @cart.get 'total_cost'

      order = new Order orderOptions
      order.save null, {
        success: (model, response) ->
          App.vent.trigger 'order:created', response
      }

    _getFormattedCartItems: ->
      (for item in @cart.items.toJSON()
        item =
          product_id: item.product_id
          count:      item.quantity
          price:      item.total_cost_cents
      )