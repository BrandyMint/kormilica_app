define ['collections/cart_items'], (CartItems)->
  'use strict'

  class Cart extends Backbone.Model

    initialize: (attrs, options) ->
      #@localStorage = new Backbone.LocalStorage 'cart'
      @items = new CartItems({}, options)

      @listenTo @items, 'add change remove', @updateAggregators

      @updateAggregators()

    fetch: ->
      @items.fetch()

    updateAggregators: =>
      total_cost = @items.getTotalCost()
      @set
        total_cost:  total_cost
        total_count: @items.getTotalCount()
        # Чтобы можно было следить за изменением цены
        total_cost_cents:  total_cost.cents

    isEmpty: ->
      #@get('total_count') == 0
      @items.length == 0

    getNumberOfItems: ->
      @items.length

    changeQuantity: (product, quantity) ->
      item = @items.itemOfProduct product
      item.set 'quantity', quantity
      item.save()

    addProduct: (product) ->
      @items.create product_id: product.id

    removeProduct: (product) ->
     item = @items.itemOfProduct product
     item.destroy() if item?
