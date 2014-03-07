define ['backbone'], (Backbone)->
  'use strict'

  class CartItem extends Backbone.Model

    defaults:
      quantity: 1

    initialize: ->
      # Восстанавливаем модели при загрузке данных из localStorage
      @product = window.App.products.get @get('product_id')

    price: ->
      cents:   @product.get('price').cents * @get('quantity')
      curency: @product.get('price').currency