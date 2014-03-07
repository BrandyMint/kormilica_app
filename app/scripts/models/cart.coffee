define ['collections/cart'], (CartItems)->
  'use strict'

  class Cart extends Backbone.Model

    initialize: ->
      #@localStorage = new Backbone.LocalStorage 'cart'
      @items = new CartItems()

      @listenTo @items, 'change', @updateAggregators

      @updateAggregators()

    fetch: ->
      @items.fetch()

    updateAggregators: =>
      @set 'total_cost',  @items.getTotalCost()
      @set 'total_count', @items.getTotalCount()

    isEmpty: ->
      @get('total_count') == 0
