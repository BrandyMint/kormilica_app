define ['app', 'marionette', 'templates/footer/footer', 'templates/footer/_checkout', 'templates/footer/_delivery', 'templates/footer/_check_bottom'], 
(App, Marionette, template, checkoutButtonTemplate, deliveryButtonTemplate, checkBottomTemplate) ->

  class Footer extends Marionette.ItemView
    template: template

    initialize: ->
      App.vent.on 'checkout:show', =>
        @showDeliveryButton()
        @showCheckBottom()

    events:
      'click a.checkout': 'showCheck'
      'click a.delivery': 'addOrder'

    collectionEvents:
      'add':    'showCheckoutButton'
      'remove': 'hideButton'

    showCheckoutButton: ->
      @$('#workspace').html checkoutButtonTemplate

    showDeliveryButton: ->
      @$('#workspace').html deliveryButtonTemplate

    hideButton: ->
      if @collection.getTotalCost() == 0
        @$('#workspace').html @workspaceDOM

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

    onRender: ->
      @workspaceDOM = @$('#workspace').children().clone()
      if @collection.length > 0
        @showCheckoutButton()