define ['models/cart_item', 'backbone.localStorage'], (Model) ->

  class CartItems extends Backbone.Collection
    url: 'cart'
    model: Model

    initialize: ->
      @localStorage = new Backbone.LocalStorage 'cart'

    getTotalCost: () ->
      addup = (memo, item) -> item.price() + memo
      @reduce(addup, 0) + " руб."

    getTotalCount: () ->
      addup = (memo, item) -> item.get('quantity') + memo
      @reduce addup, 0