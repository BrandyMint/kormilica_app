define ['app', 'marionette', 'templates/footer/footer', 'templates/footer/_checkout'], 
(App, Marionette, template, checkoutTemplate) ->

  class Footer extends Marionette.ItemView
    template: template

    events:
      'click a.checkout': 'showCheck'

    collectionEvents:
      'add':    'showCheckoutButton'
      'remove': 'hideCheckoutButton'

    showCheckoutButton: ->
      @$('#workspace').html checkoutTemplate

    hideCheckoutButton: ->
      @$('#workspace').html @workspaceDOM

    showCheck: (e) ->
      e.preventDefault()

    onRender: ->
      @workspaceDOM = @$('#workspace').children().clone()
      if @collection.length > 0
        @showCheckoutButton()