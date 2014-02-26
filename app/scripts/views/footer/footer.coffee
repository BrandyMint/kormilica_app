define ['app', 'marionette', 'templates/footer/footer', 'templates/footer/_checkout'], 
(App, Marionette, template, checkoutTemplate) ->

  class Footer extends Marionette.ItemView
    template: template

    collectionEvents:
      'add':    'showCheckoutButton'
      'remove': 'hideCheckoutButton'

    showCheckoutButton: ->
      @$('#workspace').html checkoutTemplate

    hideCheckoutButton: ->
      @$('#workspace').html @workspaceDOM

    onRender: ->
      @workspaceDOM = @$('#workspace').children().clone()
      if @collection.length > 0
        @showCheckoutButton()