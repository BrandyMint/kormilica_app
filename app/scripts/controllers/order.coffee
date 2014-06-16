define ['models/order',
  'controllers/make_order' ],
(Order,
MakeOrderController) ->

  class OrderController extends Marionette.Controller

    initialize: ({ @app, @cart, @user, @vendor }) ->

      @makeOrderController = new MakeOrderController
        app:    @app
        user:   @user
        vendor: @vendor

      @app.vent.on 'order:checkout', =>
        @makeOrderController.perform @cart