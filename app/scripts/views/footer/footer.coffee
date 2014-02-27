define ['app', 'marionette', 'templates/footer/footer', 'templates/footer/_checkout', 'templates/check/_check_bottom'], 
(App, Marionette, template, checkoutTemplate, checkBottomTemplate) ->

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
      @trigger 'checkout:clicked'

    onRender: ->
      @workspaceDOM = @$('#workspace').children().clone()
      if @collection.length > 0
        @showCheckoutButton()