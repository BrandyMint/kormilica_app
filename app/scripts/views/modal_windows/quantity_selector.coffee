define ['templates/modal_windows/quantity_selector', 'helpers/application_helpers'],
(template, Helpers) ->

    class QuantitySelector extends Marionette.ItemView
      template: template
      templateHelpers: -> Helpers

      ui:
        plusButton:    '#kormapp-plus-sign'
        minusButton:   '#kormapp-minus-sign'
        confirmButton: '.kormapp-modal-button'
        quantity:      '.kormapp-quantity'
        result:        '.kormapp-result'
        outside:       '.kormapp-dark-background'

      bindings:
        '.kormapp-quantity': 'quantity'
        '.kormapp-result': 
          observe: 'total_cost'
          updateMethod: 'html'
          onGet: -> Helpers.money @model.get 'total_cost'

      events:
        'click @ui.minusButton':   'decreaseQuantity'
        'click @ui.plusButton':    'increaseQuantity'
        'click @ui.confirmButton': 'confirmChanges'
        'click @ui.outside': 'close'

      decreaseQuantity: (e) ->
        e.preventDefault()
        unless @model.get('quantity') < 1
          @model.set 'quantity', @model.get('quantity')-1

      increaseQuantity: (e) ->
        e.preventDefault()
        @model.set 'quantity', @model.get('quantity')+1

      confirmChanges: (e) ->
        e.preventDefault()
        @close()

      onClose: ->
        @model.destroy() if @model.get('quantity')==0

      onRender: ->
        @stickit()
        @stickit @model.product,
          '.kormapp-quantity-price':
            observe: 'price'
            updateMethod: 'html'
            onGet: -> Helpers.money @model.product.get 'price'
