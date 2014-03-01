define ['app', 'marionette', 'templates/modal_windows/quantity_selector'], (App, Marionette, template) ->

  class QuantitySelector extends Marionette.ItemView
    template: template

    initialize: ->
      @quantity = @model.get 'quantity'
      @price = @model.get('product').price

    ui:
      plusButton:    '#plus-sign'
      minusButton:   '#minus-sign'
      confirmButton: '.button'
      quantity:      '.quantity'
      result:        '.result'
      outside:       '.dark-background'

    triggers:
      'click @ui.outside': 'quantity:change:cancel'

    events:
      'click @ui.minusButton':   'decreaseQuantity'
      'click @ui.plusButton':    'increaseQuantity'
      'click @ui.confirmButton': 'confirmChanges'

    decreaseQuantity: (e) ->
      e.preventDefault()
      unless @quantity < 1
        @quantity--
        @_updateView()

    increaseQuantity: (e) ->
      e.preventDefault()
      @quantity++
      @_updateView()

    confirmChanges: (e) ->
      e.preventDefault()
      @trigger 'quantity:change', @quantity

    _updateView: ->
      $(@ui.quantity).html @quantity
      $(@ui.result).html @quantity * @price