define ->
  'use strict'

  class CartItem extends Backbone.Model

    defaults:
      quantity: 1

    initialize: (attrs, options) ->
      # Восстанавливаем модели при загрузке данных из localStorage
      @product = @collection?.app.products.get @get('product_id')

      if @product?

        @set 
          product_title: @product.get('title')
          product_price: @product.get('price')

        @on 'change:quantity', @updateTotalCost

        @updateTotalCost()

      else
        @destroy()

    updateTotalCost: ->
      cents = @product.get('price').cents * @get('quantity')
      @set 
        total_cost:
          cents:    cents
          currency: @product.get('price').currency
        total_cost_cents: cents
