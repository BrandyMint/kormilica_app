define ['app', 'marionette', 'templates/modal_windows/order_created'], 
(App, Marionette, template) ->

  class OrderCreated extends Marionette.ItemView
    template: template

    initialize: (options) ->
      { @orderId } = options

    ui:
      confirmButton: '.button'
      outside:       '.dark-background'

    serializeData: ->
      orderId: @orderId

    triggers:
      'click @ui.outside':       'modal:cancel'
      'click @ui.confirmButton': 'modal:confirmed'
