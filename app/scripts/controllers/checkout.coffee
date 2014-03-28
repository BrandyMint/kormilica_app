define ->
  class CheckoutController extends Marionette.Controller
    initialize: ({ @app, @cart, @vendor, @vent }) ->
      @vent.on 'checkout:clicked top_check:clicked', =>
        if @vendor.isPriceValid(@cart)
          @app.execute 'check:show'
        else
          window.navigator.notification.alert @vendor.minimal_alert(), null, 'Заказ не может быть оформлен'
