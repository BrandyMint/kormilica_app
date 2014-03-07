define ['models/cart_item', 'backbone.localStorage'], (Model) ->

  class CartItems extends Backbone.Collection
    url: 'cart'
    model: Model

    initialize: ->
      @localStorage = new Backbone.LocalStorage 'cart'

    getTotalCost: () ->
      addup = (memo, item) -> item.price().cents + memo
      return {
        cents: @reduce addup, 0
        # TODO Брать из профиля
        currency: 'RUB'
      }

    getTotalCount: () ->
      addup = (memo, item) -> item.get('quantity') + memo
      @reduce addup, 0

    isProductInCart: (product) ->
      @find (item) -> item.get('product').id == product.get('id')
