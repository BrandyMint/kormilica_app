define ['templates/check/check', 'views/check/check_cart_item', 'views/modal_windows/check_contacts', 'helpers/application_helpers' ],
(template, CheckCartItemView, CheckContactsView, Helpers) ->

  class Check extends Marionette.CompositeView
    template: template
    templateHelpers: -> Helpers
    itemView: CheckCartItemView
    itemViewContainer: '@kormapp-cart-items'

    initialize: ({ @app, @cart, @user, @vendor, @modal }) ->
      @collection = @cart.items
      @model = @user
      @app.vent.on 'order:failed', @activateDeliveryButton
      @listenTo @collection, 'add remove', () =>
        @_manageContinueButton()

    ui:
      backButton: '@kormapp-check-back-button'
      continueButton: '@kormapp-check-continue-button'
      checkInfo: '@kormapp-check-info'

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

    continueOrder: (e) ->
      @modal.show new CheckContactsView app: @app, cart: @cart, user: @user, vendor: @vendor, modal: @modal

    _setScrollableAreaHeight: ->
      container =  $('@kormapp-check-content')
      bottomInfo = $('@kormapp-check-bottom-info')
      itemsList =  $('@kormapp-check-items-list')

      scrollableHeight = container.height() - bottomInfo.height()
      itemsList.css 'height', scrollableHeight

    onShow: ->
      @_setScrollableAreaHeight()

    onRender: ->
      @stickit()
      
      @stickit @vendor,
        '@kormapp-delivery-price':
          observe: 'delivery_price'
          visible: (val) -> val.cents > 0
        '@kormapp-delivery-sum-right':
          observe: 'delivery_price'
          updateMethod: 'html'
          onGet: (val) -> Helpers.money val
        '@kormapp-check-offer':
          observe:      'mobile_footer'
          updateMethod: 'html'
        '@kormapp-check-free-delivery':
          observe:      'mobile_delivery'
          updateMethod: 'html'

      @stickit @cart,
        '@kormapp-all-sum-right':
          observe:      'total_cost'
          updateMethod: 'html'
          onGet: (val) ->
            result =
              currency: val.currency
              cents:    val.cents + @vendor.get('delivery_price').cents
            Helpers.money result

      @_manageContinueButton()

    _manageContinueButton: ->
      if @collection.length == 0
        @ui.continueButton.hide()
        @ui.checkInfo.show()
      else
        @ui.continueButton.show()
        @ui.checkInfo.hide()

