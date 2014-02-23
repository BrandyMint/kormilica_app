define ['app'], ->
  'use strict'

  class CartItem extends Backbone.Model

    defaults:
      product:  ''
      quantity: 0

    price: () ->
      @get('product').price * @get 'quantity'