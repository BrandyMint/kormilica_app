define ['marionette', 'templates/check/check_cart_item', 'helpers/application_helpers'], (Marionette, checkCartItemViewTemplate, Helpers) ->

  class CheckCartItemView extends Marionette.ItemView

    template: checkCartItemViewTemplate
    templateHelpers: -> Helpers

    serializeData: ->
      productTitle: @model.product.get 'title'
      price:        @model.product.get 'price'
      quantity:     @model.get 'quantity'