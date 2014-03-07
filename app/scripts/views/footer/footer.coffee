define ['marionette', 'templates/footer/footer', 'templates/footer/_checkout', 'templates/footer/_delivery', 'templates/footer/_check_bottom'], 
(Marionette, template, checkoutButtonTemplate, deliveryButtonTemplate, checkBottomTemplate) ->

  class Footer extends Marionette.ItemView
    template: template

    initialize: (options) ->
      { @profile, @app, @cart } = options

      @collection = @cart.items

      @app.vent.on 'checkout:show', =>
        @showDeliveryButton()
        @showCheckBottom()

      @app.vent.on 'check:form:invalid', =>
        @deactivateDeliveryButton()

      @app.vent.on 'check:form:valid', =>
        @activateDeliveryButton()

      @app.vent.on 'check:disappeared', =>
        @showCheckoutButton()

    events:
      'click a.checkout':           'showCheck'
      'click .delivery a':          'addOrder'
      'click .delivery-inactive a': 'showErrors'

    collectionEvents:
      'add':    'showCheckoutButton'
      'remove': 'hideButton'

    showCheckoutButton: ->
      @$('#workspace').html checkoutButtonTemplate

    showDeliveryButton: ->
      @$('#workspace').html deliveryButtonTemplate(@profile)

    deactivateDeliveryButton: ->
      button = @$('#workspace').find('.delivery')
      button.removeClass('delivery').addClass('delivery-inactive')

    activateDeliveryButton: ->
      button = @$('#workspace').find('.delivery-inactive')
      button.removeClass('delivery-inactive').addClass('delivery')

    hideButton: ->
      if @cart.isEmpty()
        @$('#workspace').html @workspaceDOM
        @$('#check-bottom').children().remove()

    showCheckBottom: ->
      @$('#check-bottom').html checkBottomTemplate

    showCheck: (e) ->
      e.preventDefault()
      @showDeliveryButton()
      @trigger 'checkout:clicked'

    addOrder: (e) ->
      e.preventDefault()
      alert 'Заказ создан!'
      @trigger 'delivery:clicked'
      @hideButton()

    showErrors: (e) ->
      e.preventDefault()
      alert 'Заполните все поля'

    onRender: ->
      @workspaceDOM = @$('#workspace').children().clone()
      unless @cart.isEmpty()
        @showCheckoutButton()
