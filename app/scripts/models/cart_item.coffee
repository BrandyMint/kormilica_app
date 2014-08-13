define ->

  class CartItem extends Backbone.Model

    defaults:
      quantity: 1

    initialize: ({product}) ->
      @reattachProductFromCollection(product) if product?

    # Восстанавливаем модели при загрузке данных из localStorage
    reattachProductFromCollection: (product) ->
      product = @collection.products.get product?.id || @get('product_id')

      if product?
        @attachProduct product
      else
        @destroy()

    attachProduct: (product) ->
      @product = product
      @set 'product_id', @product.id
      @off 'change:quantity', @updateTotalCost
      @on  'change:quantity', @updateTotalCost
      @updateTotalCost()

    updateTotalCost: ->
      cents = @product.get('price').cents * @get('quantity')
      @set 
        total_cost:
          cents:    cents
          currency: @product.get('price').currency
        total_cost_cents: cents
