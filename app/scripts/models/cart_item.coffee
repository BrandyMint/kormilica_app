define ['app'], ->
  'use strict'

  class CartItem extends Backbone.Model

    defaults:
      product:  ''
      quantity: 0

    price: () ->
      console.log @
      # @get('product').get('price') * @get('quantity')