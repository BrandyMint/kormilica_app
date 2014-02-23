define ['app', 'marionette', 'templates/header/header'], (App, Marionette, template) ->

  class Header extends Marionette.ItemView
    template: template

    serializeData: ->
      collection: @collection

    collectionEvents:
      'all': 'updateTotalCost'

    updateTotalCost: () ->
      @$('#amount').html @collection.getTotalCost()