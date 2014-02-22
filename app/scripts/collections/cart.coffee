define ['models/cart_item', 'backbone.localStorage'], (Model) ->

  class CartItems extends Backbone.Collection
    url: 'cart'
    model: Model

    initialize: ->
      @localStorage = new Backbone.LocalStorage 'cart'