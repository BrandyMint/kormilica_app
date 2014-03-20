define ['collections/cart_items', 'helpers/application_helpers'], (CartItems, Helpers)->
  'use strict'

  class Cart extends Backbone.Model

    initialize: ->
      #@localStorage = new Backbone.LocalStorage 'cart'
      @items = new CartItems

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
      @items.create product: product

    removeProduct: (product) ->
      item = @items.itemOfProduct product
      item.destroy() if item?

    getTotalCost: ->
      @items.getTotalCost()

    # TODO Выделить в сервис
    reattachProductsFromCollection: (products) ->
      saved_total_cost = @getTotalCost()
      @items.each (ci) -> ci.reattachProductFromCollection products

      return saved_total_cost.cents != @getTotalCost().cents
