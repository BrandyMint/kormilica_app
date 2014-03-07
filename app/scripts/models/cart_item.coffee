define ['backbone'], (Backbone)->
  'use strict'

  class CartItem extends Backbone.Model

    defaults:
      quantity: 0

    initialize: ->
      # Восстанавливаем модели при загрузке данных из localStorage
      @set 'product', window.App.products.get @get('product').id

    price: ->
      cents:   @get('product').get('price').cents * @get('quantity')
      curency: @get('product').get('price').currency
