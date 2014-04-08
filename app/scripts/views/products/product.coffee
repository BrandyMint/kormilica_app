define [ 'templates/products/product',
  'views/products/cart_button',
  'views/products/empty_cart_button',
  'helpers/application_helpers'], 
(productTemplate, CartButton, EmptyCartButton, Helpers) ->

  class ProductView extends Marionette.ItemView
    templateHelpers: -> Helpers
    template: productTemplate
    className: 'kormapp-product-block kormapp-reflection'

    ui:
      img: '.kormapp-product-image'

    events:
      click: 'clicked'

    initialize: (options) ->
      { @app, @cartItems } = options

      @listenTo @cartItems, 'add remove', @cartChanged

    clicked: (e) ->
      e.preventDefault()
      @app.vent.trigger 'product:click', @model

    cartChanged: (item) =>
      @showButton() if item.get('product_id') == @model.id

    showButton: =>
      if item = @app.cart.items.itemOfProduct @model
        view = new CartButton model: item
      else
        view = new EmptyCartButton()

      @buttonRegion.show view

    getCachedImg: ($img) =>
      imgUrl = @model.get('image')?.mobile_url
      return unless imgUrl
      remote = -> $img.attr('src', imgUrl)
      if ImgCache and window.cordova?
        cached = ->
          ImgCache.useCachedFileWithSource($img, imgUrl, null, (->
            ImgCache.cacheFile(imgUrl)))
        if ImgCache.ready
          cached()
        else
          @stopListening @app, 'img-cache:ready'
          @listenToOnce @app, 'img-cache:ready', cached
      else
        remote()

    onRender: ->
      @buttonRegion = new Marionette.Region el: @$el.find('.kormapp-product-quantity')
      @showButton()
      @getCachedImg(@ui.img)
