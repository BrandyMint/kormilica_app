define ['marionette', 'templates/products/product', 'templates/products/product_quantity', 'helpers/application_helpers'], 
(Marionette, productTemplate, productQuantityTemplate, Helpers) ->

  class ProductView extends Marionette.ItemView
    templateHelpers: -> Helpers
    template: productTemplate
    className: 'product-block'

    initialize: (options) ->
      { @app } = options

      # Если на начало загрузки товар уже будет в корзине, то item будет содержать
      # этот элементы корзины
      @item = @app.request 'cart:item', @model
      @quantity = @item.get 'quantity' if @item

      @app.vent.on 'cartitem:added', (item) =>
        if item.get('product').id == @model.get('id')
          @displaySelectedQuantity item.get 'quantity'

      @app.vent.on 'quantity:change', (item, quantity) =>
        if item.get('product').id == @model.get('id')
          @displaySelectedQuantity quantity

      @app.vent.on 'order:created', =>
        @displaySelectedQuantity 0

    events:
      'click': 'addToCart'

    addToCart: (e) ->
      e.preventDefault()
      @app.vent.trigger 'cart:add', @model, 1

    displaySelectedQuantity: (quantity) =>
      if quantity > 0
        @$('.product-quantity').html productQuantityTemplate quantity: quantity
      else
        @$('.product-quantity').html @productQuantityDOM

    onRender: ->
      @productQuantityDOM = @$('.product-quantity').children().clone()
      @displaySelectedQuantity @quantity if @item
