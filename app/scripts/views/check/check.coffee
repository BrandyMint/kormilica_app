define ['templates/check/check', 'views/check/check_cart_item', 'helpers/application_helpers' ],
(template, CheckCartItemView, Helpers) ->

  class Check extends Marionette.CompositeView
    template: template
    templateHelpers: -> Helpers
    itemView: CheckCartItemView
    itemViewContainer: '.cart-items'

    initialize: (options) ->
      { @app, @cart, @user } = options
      @collection = @cart.items
      @model = @user

    bindings:
      '#kormapp-address':
        observe: 'address'
      '#kormapp-phone':
        observe: 'phone'

    ui:
      form:                   'form'
      backButton:             '.check-header a'
      deliveryButton:         '.delivery a'
      inactiveDeliveryButton: '.delivery-inactive a'

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
        items: @cart.items.toJSON()
        user:  @user

    addOrder: (e) ->
      @user.save()
      @app.execute 'order:create'

    showErrors: (e) ->
      e.preventDefault()
      alert 'Заполните все поля'

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
      button = @$('#kormapp-check-bottom-container').find('.delivery')
      button.removeClass('delivery').addClass('delivery-inactive')

    activateDeliveryButton: ->
      button = @$('#kormapp-check-bottom-container').find('.delivery-inactive')
      button.removeClass('delivery-inactive').addClass('delivery')

    _setScrollableAreaHeight: ->
      container =  $('.check-content')
      bottomInfo = $('.unscrollable-check')
      itemsList =  $('.scrollable-check')

      scrollableHeight = container.height() - bottomInfo.height()
      itemsList.css 'height', scrollableHeight

    onShow: ->
      @_setScrollableAreaHeight()
      @manageButtons()

    onRender: ->
      @stickit()
