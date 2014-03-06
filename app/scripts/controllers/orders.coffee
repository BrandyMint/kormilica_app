define ['app', 'marionette', 'models/order', 'views/modal_windows/order_created'], (App, Marionette, OrderModel, OrderCreatedView) ->

  class Controller extends Marionette.Controller

    initialize: (options) ->
      { @profile, @cart } = options

      @cart.getFormattedCartItems()

      App.vent.on 'order:create', =>
        @createOrder()

      App.vent.on 'order:created', (id) =>
        @showOrderMessage id

    createOrder: ->
      orderOptions = 
        "user":
          "phone": @profile.get 'phoneNumber'
          "name":  @profile.get 'name'
          # "address": "ул.к.иванова, дом 91"
          # "comment": "Комментарий к заказу"
        "items": @cart.getFormattedCartItems()
        "total_price": @cart.getTotalCost()

      order = new OrderModel orderOptions
      order.save null, {
        success: (model, response) ->
          App.vent.trigger 'order:created', response
      }

    showOrderMessage: (id) ->
      orderCreatedView = new OrderCreatedView orderId: id
      App.modalRegion.show orderCreatedView

      orderCreatedView.on 'modal:cancel modal:confirmed', ->
        App.modalRegion.close()