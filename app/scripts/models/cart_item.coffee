define ['backbone'], (Backbone)->
  'use strict'

  class CartItem extends Backbone.Model

    defaults:
      quantity: 1

    initialize: ->
      # Восстанавливаем модели при загрузке данных из localStorage
      @product = window.App.products.get @get('product_id')

      @on 'change:quantity', @updateTotalCost

      @updateTotalCost()

    updateTotalCost: ->
      cents = @product.get('price').cents * @get('quantity')
      @set 
        total_cost:
          cents:    cents
          currency: @product.get('price').currency
        total_cost_cents: cents
