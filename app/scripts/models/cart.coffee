define ['collections/cart_items'], (CartItems)->
  'use strict'

  class Cart extends Backbone.Model

    initialize: ->
      #@localStorage = new Backbone.LocalStorage 'cart'
      @items = new CartItems()

      @listenTo @items, 'change', @updateAggregators
      @listenTo @items, 'add', @updateAggregators
      @listenTo @items, 'remove', @updateAggregators

      @updateAggregators()

    fetch: ->
      @items.fetch()

    updateAggregators: =>
      @set 'total_cost',  @items.getTotalCost()
      @set 'total_count', @items.getTotalCount()

      # Чтобы можно было следить за изменением цены
      @set 'total_cost_cents',  @get('total_cost').cents

    isEmpty: ->
      @get('total_count') == 0
