define ['marionette', 'templates/check/check'], (Marionette, template) ->
  
  class CheckTop extends Marionette.ItemView
    template: template

    serializeData: ->
      items: @collection.toJSON()

    templateHelpers: ->
      totalCost: @collection.getTotalCost()