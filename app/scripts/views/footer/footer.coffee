define ['templates/footer/footer', 'templates/footer/_checkout'], 
(template, checkoutButtonTemplate) ->

  class Footer extends Marionette.ItemView
    template: template

    initialize: (options) ->
      { @vent, @cart, @vendor } = options

      @collection = @cart.items

      @vent.on 'order:created', =>
        @hideButton()

    events:
      'click a.kormapp-checkout':         'showCheck'
      'click .kormapp-delivery-discount': 'emptyButtonClicked'

    collectionEvents:
      'add':    'showCheckoutButton'
      'remove': 'hideButton'

    showCheckoutButton: ->
      @$('#kormapp-workspace').html checkoutButtonTemplate

    hideButton: ->
      if @cart.isEmpty()
        @$('#kormapp-workspace').html @workspaceDOM

    showCheck: (e) ->
      e.preventDefault()
      @trigger 'checkout:clicked'

    emptyButtonClicked: ->
      alert @vendor.get 'footer_empty_button'

    onRender: ->
      @workspaceDOM = @$('#kormapp-workspace').children().clone()
      unless @cart.isEmpty()
        @showCheckoutButton()