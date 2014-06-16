define ['templates/check/check', 'views/check/check_cart_item', 'views/modal_windows/check_contacts', 'helpers/application_helpers' ],
(template, CheckCartItemView, CheckContactsView, Helpers) ->

  class CheckView extends Marionette.CompositeView
    template: template
    templateHelpers: -> Helpers
    itemView: CheckCartItemView
    itemViewContainer: '@kormapp-cart-items'
    className: 'kormapp-check-block'
    emptyCheckClass: 'kormapp-empty-check'

    initialize: ({ @app, @cart, @user, @vendor, @modal }) ->
      @collection = @cart.items
      @model = @user
      @app.vent.on 'order:failed', @activateDeliveryButton
      @listenTo @collection, 'add remove reset', () =>
        @_manageContinueButton()

    ui:
      backButton: '@kormapp-check-back-button'
      continueButton: '@kormapp-check-continue-button'
      checkInfo: '@kormapp-check-info'
      bottomInfo: '@kormapp-check-bottom-info'
      itemsList:  '@kormapp-check-items-list'

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
          update: ($el, val) =>
            if val.cents > 0
              @_showSummary()
              @$el.removeClass @emptyCheckClass
              result =
                currency: val.currency
                cents:    val.cents + @vendor.get('delivery_price').cents
              $el.html Helpers.money result
            else
              @_hideSummary()
              @$el.addClass @emptyCheckClass

      @_manageContinueButton()

    _manageContinueButton: ->
      if @collection.length == 0
        @ui.continueButton.hide()
        @ui.checkInfo.show()
      else
        @ui.continueButton.show()
        @ui.checkInfo.hide()

    _showSummary: ->
      @ui.bottomInfo.show()

    _hideSummary: ->
      @ui.bottomInfo.hide()

    continueOrder: (e) =>
      if @vendor.isPriceValid(@cart)
        @modal.show new CheckContactsView app: @app, cart: @cart, user: @user, vendor: @vendor, modal: @modal
      else
        @_showMinOrderAlert()

    # TODO move this to controller
    _showMinOrderAlert: ->
      window.navigator.notification.alert @vendor.get('mobile_empty_cart_alert'), null, 'Внимание'

    _setScrollableAreaHeight: ->
      unless @app.isWide
        bottomInfo = @ui.bottomInfo
        itemsList =  @ui.itemsList
        scrollableHeight = @ui.bottomInfo.position().top - @ui.itemsList.position().top
        @ui.itemsList.css 'height', scrollableHeight


