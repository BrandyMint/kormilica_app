define ['marionette', 'templates/products/list_item', 'templates/products/list_item_quantity'], 
(Marionette, listItemTemplate, listItemQuantityTemplate) ->

  class Product extends Marionette.ItemView
    template: listItemTemplate
    className: 'product-block'

    initialize: ->
      # Если на начало загрузки товар уже будет в корзине, то item будет содержать
      # этот элементы корзины
      @item = window.App.request 'cart:item', @model
      @quantity = @item.get 'quantity' if @item

      window.App.vent.on 'cartitem:added', (item) =>
        if item.get('product').id == @model.get('id')
          @displaySelectedQuantity item.get 'quantity'

      window.App.vent.on 'quantity:change', (item, quantity) =>
        if item.get('product').id == @model.get('id')
          @displaySelectedQuantity quantity

      window.App.vent.on 'order:created', =>
        @displaySelectedQuantity 0

    events:
      'click': 'addToCart'

    addToCart: (e) ->
      e.preventDefault()
      window.App.vent.trigger 'cart:add', @model, 1

    displaySelectedQuantity: (quantity) =>
      if quantity > 0
        @$('.product-quantity').html listItemQuantityTemplate quantity: quantity
      else
        @$('.product-quantity').html @productQuantityDOM

    onRender: ->
      @productQuantityDOM = @$('.product-quantity').children().clone()
      @displaySelectedQuantity @quantity if @item