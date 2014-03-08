define ['templates/check/check_cart_item', 'helpers/application_helpers'], 
(checkCartItemViewTemplate, Helpers) ->

  class CheckCartItemView extends Marionette.ItemView

    template: checkCartItemViewTemplate
    templateHelpers: -> Helpers