define ['marionette', 'templates/check/_check_top'], (Marionette, template) ->
  
  class CheckTop extends Marionette.ItemView
    template: template

    serializeData: ->
      items: @collection.toJSON()

    templateHelpers: ->
      totalCost: @collection.getTotalCost()