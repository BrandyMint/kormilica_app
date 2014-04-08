define ['templates/check/check', 'views/check/check_cart_item', 'views/modal_windows/check_contacts', 'helpers/application_helpers' ],
(template, CheckCartItemView, CheckContactsView, Helpers) ->

  class Check extends Marionette.CompositeView
    template: template
    templateHelpers: -> Helpers
    itemView: CheckCartItemView
    itemViewContainer: '.kormapp-cart-items'

    initialize: ({ @app, @cart, @user, @vendor, @modal }) ->
      @collection = @cart.items
      @model = @user
      @app.vent.on 'order:failed', @activateDeliveryButton

    ui:
      backButton: '.kormapp-check-header a'
      continueButton: '.kormapp-delivery a'

    events:
      'click @ui.continueButton': 'continueOrder'

    triggers:
      'click @ui.backButton':
        event: 'cancel:button:clicked'
        preventDefault: true

    serializeData: ->
      _.extend @cart.toJSON(),
        items:  @cart.items.toJSON()
        user:   @user
        vendor: @vendor
        total_cost_with_delivery: 
          cents: @cart.get('total_cost').cents + @vendor.get('delivery_price').cents

    stopEvent: (e) ->
      e.stopPropagation()

    adjustScreen: ->
      setTimeout(( ->
        $('body').scrollTop(0)
      ), 100)

    continueOrder: (e) ->
      @modal.show new CheckContactsView app: @app, cart: @cart, user: @user, vendor: @vendor, modal: @modal

    _setScrollableAreaHeight: ->
      container =  $('.kormapp-check-content')
      bottomInfo = $('.kormapp-unscrollable-check')
      itemsList =  $('.kormapp-scrollable-check')

      scrollableHeight = container.height() - bottomInfo.height()
      itemsList.css 'height', scrollableHeight

    onShow: ->
      @_setScrollableAreaHeight()

    onRender: ->
      @stickit()

      @stickit @vendor,
        '.kormapp-delivery-price':
          observe: 'delivery_price'
          visible: (val) -> val.cents > 0
        '.kormapp-delivery-sum-right':
          observe: 'delivery_price'
          updateMethod: 'html'
          onGet: (val) -> Helpers.money val

      @stickit @cart,
        '.kormapp-all-sum-right':
          observe:      'total_cost'
          updateMethod: 'html'
          onGet: (val) ->
            result =
              currency: val.currency
              cents:    val.cents + @vendor.get('delivery_price').cents
            Helpers.money result
