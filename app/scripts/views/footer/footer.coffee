define ['templates/footer/footer', 'templates/footer/_checkout'], 
(template, checkoutButtonTemplate) ->

  class Footer extends Marionette.ItemView
    template: template

    initialize: (options) ->
      { @profile, @vent, @cart, @vendor } = options

      @collection = @cart.items

      @vent.on 'order:created', =>
        @hideButton()

    events:
      'click a.checkout':         'showCheck'
      'click .delivery-discount': 'emptyButtonClicked'

    collectionEvents:
      'add':    'showCheckoutButton'
      'remove': 'hideButton'

    showCheckoutButton: ->
      @$('#workspace').html checkoutButtonTemplate

    hideButton: ->
      if @cart.isEmpty()
        @$('#workspace').html @workspaceDOM
        @$('#check-bottom').children().remove()

    showCheck: (e) ->
      e.preventDefault()
      @trigger 'checkout:clicked'

    emptyButtonClicked: ->
      alert @vendor.get 'mobile_footer'

    onRender: ->
      @workspaceDOM = @$('#workspace').children().clone()
      unless @cart.isEmpty()
        @showCheckoutButton()