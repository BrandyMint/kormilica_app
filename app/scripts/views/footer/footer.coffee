define ['templates/footer/footer', 'templates/footer/_checkout'], 
(template, checkoutButtonTemplate) ->

  class Footer extends Marionette.ItemView
    template: template

    initialize: (options) ->
      { @profile, @app, @cart } = options

      @collection = @cart.items

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

    showCheckoutButton: ->
      @$('#workspace').html checkoutButtonTemplate

    hideButton: ->
      if @cart.isEmpty()
        @$('#workspace').html @workspaceDOM
        @$('#check-bottom').children().remove()

    showCheck: (e) ->
      e.preventDefault()
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