define ['app', 'marionette', 'views/modal_windows/quantity_selector'], (App, Marionette, QuantitySelectorView) ->

  class Controller extends Marionette.Controller

    initialize: (options) ->
      { @cart } = options

      App.vent.on 'cartitem:exists', (item) =>
        @showQuantitySelector item

    showQuantitySelector: (item) ->
      quantitySelectorView = new QuantitySelectorView model: item
      App.modalRegion.show quantitySelectorView

      quantitySelectorView.on 'quantity:change', (quantity) =>
        App.vent.trigger 'quantity:change', item, quantity
        @hideQuantitySelector()

    hideQuantitySelector: ->
      App.modalRegion.close()