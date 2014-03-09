define ['templates/footer/footer', 'templates/footer/_checkout', 'templates/footer/_delivery', 'templates/footer/_check_bottom'], 
(template, checkoutButtonTemplate, deliveryButtonTemplate, checkBottomTemplate) ->

  class Footer extends Marionette.ItemView
    template: template

    initialize: (options) ->
      { @profile, @app, @cart } = options

      @listenTo @profile, 'change:name change:phone', @manageButtons

      @collection = @cart.items

      @app.vent.on 'check:appeared', =>
        @showDeliveryButton()
        @showCheckBottom()

      @app.vent.on 'check:disappeared', =>
        @showCheckoutButton()

      @app.vent.on 'order:created', =>
        @hideButton()

    events:
      'click a.checkout':           'showCheck'
      'click .delivery a':          'addOrder'
      'click .delivery-inactive a': 'showErrors'

    collectionEvents:
      'add':    'showCheckoutButton'
      'remove': 'hideButton'

    manageButtons: (model, value) ->
      if !!value
        @showDeliveryButton()
      else
        @deactivateDeliveryButton()

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
      @app.execute 'order:create'
      @hideButton()

    showErrors: (e) ->
      e.preventDefault()
      alert 'Заполните все поля'

    onRender: ->
      @workspaceDOM = @$('#workspace').children().clone()
      unless @cart.isEmpty()
        @showCheckoutButton()

    onClose: ->
      @.stopListening()