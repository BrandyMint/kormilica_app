define [ 'templates/products/product', 'templates/products/button', 'templates/products/button_added',
  'helpers/application_helpers'], 
( productTemplate, buttonTemplate, buttonAddedTemplate, Helpers) ->

  class ProductView extends Marionette.ItemView
    templateHelpers: -> Helpers
    template: productTemplate
    className: 'product-block'

    ui:
      'button': '.product-quantity'

    events:
      'click': 'clicked'

    initialize: (options) ->
      { @app, @cartItems } = options

      #@app.reqres.setHandler 'cart:item', (product) =>
        #@cartItems.isProductInCart product


      # Если на начало загрузки товар уже будет в корзине, то item будет содержать
      # этот элементы корзины
      #@item = @app.request 'cart:item', @model
      #@quantity = @item.get 'quantity' if @item

      #@app.vent.on 'cartitem:added', (item) =>
        #if item.get('product').id == @model.get('id')
          #@displaySelectedQuantity item.get 'quantity'

      #@app.vent.on 'quantity:change', (item, quantity) =>
        #if item.get('product').id == @model.get('id')
          #@displaySelectedQuantity quantity

      #@app.vent.on 'order:created', =>
        #@displaySelectedQuantity 0
        #
        # @listenTo window.App.cart.items, 'change', @cartChanged
      @listenTo @cartItems, 'add',    @cartChanged
      @listenTo @cartItems, 'remove', @cartChanged

    clicked: (e) ->
      e.preventDefault()
      @app.vent.trigger 'product:click', @model

    cartChanged: (item) =>
      @showButton() if item.get('product_id') == @model.id

    showButton: =>
      if item = window.App.cart.items.itemOfProduct @model
        @ui.button.html buttonAddedTemplate quantity: item.get('quantity')
      else
        @ui.button.html buttonTemplate()

    onRender: ->
      @showButton()
