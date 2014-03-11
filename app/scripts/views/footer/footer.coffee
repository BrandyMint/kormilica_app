define ['templates/footer/footer', 'templates/footer/_checkout'], 
(template, checkoutButtonTemplate) ->

  class Footer extends Marionette.ItemView
    template: template

    initialize: (options) ->
      { @profile, @app, @cart } = options

      @collection = @cart.items

      @app.vent.on 'order:created', =>
        @hideButton()

    events:
      'click a.checkout':           'showCheck'

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

    onRender: ->
      @workspaceDOM = @$('#workspace').children().clone()
      unless @cart.isEmpty()
        @showCheckoutButton()