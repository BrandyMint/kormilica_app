define ['marionette', 'views/modal_windows/quantity_selector'], (Marionette, QuantitySelectorView) ->

  class Controller extends Marionette.Controller

    initialize: (options) ->
      { @cart, @App } = options

      # TODO Отключил чтобы не мешался
      #@App.vent.on 'cartitem:exists', (item) =>
        #@showQuantitySelector item

    showQuantitySelector: (item) ->
      $('#app-container').addClass 'modal-state'
      quantitySelectorView = new QuantitySelectorView model: item
      @App.modalRegion.show quantitySelectorView

      quantitySelectorView.on 'quantity:change', (quantity) =>
        @App.vent.trigger 'quantity:change', item, quantity
        @hideQuantitySelector()

      quantitySelectorView.on 'quantity:change:cancel', =>
        @hideQuantitySelector()

    hideQuantitySelector: ->
      $('#app-container').removeClass 'modal-state'
      @App.modalRegion.close()
