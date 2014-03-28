define ['templates/check/check', 'views/check/check_cart_item', 'helpers/application_helpers' ],
(template, CheckCartItemView, Helpers) ->

  class Check extends Marionette.CompositeView
    template: template
    templateHelpers: -> Helpers
    itemView: CheckCartItemView
    itemViewContainer: '.kormapp-cart-items'

    initialize: ({ @app, @cart, @user, @vendor }) ->
      @collection = @cart.items
      @model = @user

    bindings:
      '#kormapp-address':
        observe: 'address'
      '#kormapp-phone':
        observe: 'phone'

    ui:
      form:                   'form'
      backButton:             '.kormapp-check-header a'
      deliveryButton:         '.kormapp-delivery a'
      inactiveDeliveryButton: '.kormapp-delivery-inactive a'

    events:
      'click @ui.deliveryButton': 'addOrder'
      'click @ui.inactiveDeliveryButton': 'showErrors'
      'keyup @ui.form': 'manageButtons'

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

    addOrder: (e) ->
      @user.save()
      @app.execute 'order:create'

    showErrors: (e) ->
      e.preventDefault()
      window.navigator.notification.alert 'Впишите телефон и адрес доставки', null, 'Внимание'

    checkForEmptyFields: (e) ->
      $(@ui.form).find("input").filter( ->
        return $.trim( $(@).val().length ) < 1
      ).length == 0

    manageButtons: (model) ->
      if @checkForEmptyFields()
        @activateDeliveryButton()
      else
        @deactivateDeliveryButton()

    deactivateDeliveryButton: ->
      button = @$('#kormapp-check-bottom-container').find('.kormapp-delivery')
      button.removeClass('kormapp-delivery').addClass('kormapp-delivery-inactive')

    activateDeliveryButton: ->
      button = @$('#kormapp-check-bottom-container').find('.kormapp-delivery-inactive')
      button.removeClass('kormapp-delivery-inactive').addClass('kormapp-delivery')

    _setScrollableAreaHeight: ->
      container =  $('.kormapp-check-content')
      bottomInfo = $('.kormapp-unscrollable-check')
      itemsList =  $('.kormapp-scrollable-check')

      scrollableHeight = container.height() - bottomInfo.height()
      itemsList.css 'height', scrollableHeight

    onShow: ->
      @_setScrollableAreaHeight()
      @manageButtons()

    onRender: ->
      @stickit()

      @stickit @vendor,
        '.kormapp-delivery-price':
          observe: 'delivery_price'
          visible: (val) ->
            true if val.cents > 0
        '.kormapp-delivery-sum-right':
          observe: 'delivery_price'
          updateMethod: 'html'
          onGet: (val) -> Helpers.money val
        'label[for="address"]':
          observe: 'city'
          onGet:   (val) ->
            "Ваш адрес (#{val})"

      @stickit @cart,
        '.kormapp-all-sum-right':
          observe:      'total_cost'
          updateMethod: 'html'
          onGet: (val) ->
            result =
              currency: val.currency
              cents:    val.cents + @vendor.get('delivery_price').cents
            Helpers.money result
