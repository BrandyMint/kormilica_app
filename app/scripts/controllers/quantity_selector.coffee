define ['marionette', 'views/modal_windows/quantity_selector'], (Marionette, QuantitySelectorView) ->

  class Controller extends Marionette.Controller

    initialize: (options) ->
      { @cart, @app } = options

      @app.vent.on 'cartitem:exists', (item) =>
        @showQuantitySelector item

    showQuantitySelector: (item) ->
      $('#app-container').addClass 'modal-state'
      quantitySelectorView = new QuantitySelectorView model: item
      @app.modalRegion.show quantitySelectorView

      quantitySelectorView.on 'quantity:change', (quantity) =>
        @app.vent.trigger 'quantity:change', item, quantity
        @hideQuantitySelector()

      quantitySelectorView.on 'quantity:change:cancel', =>
        @hideQuantitySelector()

    hideQuantitySelector: ->
      $('#app-container').removeClass 'modal-state'
      @app.modalRegion.close()