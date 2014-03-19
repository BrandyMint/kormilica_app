define ['helpers/application_helpers'], (Helpers) ->
  
  class MinimalPriceChecker extends Marionette.Controller
    
    initialize: ({ @app, @cart, @vendor, @vent }) ->
      @minimalPrice = @vendor.get('minimal_price')
      
      @vent.on 'checkout:clicked top_check:clicked', =>
        if @_isGreaterThanMinimalPrice()
          @app.execute 'check:show'
        else
          alert "Минимальный заказ от #{Helpers.money_txt(@minimalPrice)}"
      
    _isGreaterThanMinimalPrice: ->
      currentTotalCost = @cart.get 'total_cost_cents'
      currentTotalCost > @minimalPrice.cents