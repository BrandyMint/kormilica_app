define ['models/cart_item'], (CartItem) ->

  class CartItems extends Backbone.Collection
    url: 'cart' # TODO в настройки
    model: CartItem

    initialize: ->
      @localStorage = new Backbone.LocalStorage 'cart_items'

    getTotalCost: () ->
      addup = (memo, item) -> item.get('total_cost').cents + memo
      return {
        cents: @reduce addup, 0
        # TODO Брать из профиля
        currency: 'RUB'
      }

    getTotalCount: () ->
      addup = (memo, item) -> item.get('quantity') + memo
      @reduce addup, 0

    isProductInCart: (product) ->
      !!@cartItem product

    itemOfProduct: (product) ->
      @findWhere product_id: product.id

