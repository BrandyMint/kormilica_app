define ['app', 'marionette', 'templates/header/header'], (App, Marionette, template) ->

  class Header extends Marionette.ItemView
    template: template
    className: 'header'

    triggers:
      'click #check': 'check:clicked'

    serializeData: ->
      items: @collection.toJSON()

    templateHelpers: ->
      totalCost: @collection.getTotalCost()

    collectionEvents:
      'all': 'updateTotalCost'

    updateTotalCost: () ->
      if @collection.getTotalCost() > 0 then @showCheck() else @hideCheck()
      @$('#amount').html @collection.getTotalCost() + " руб."

    showCheck: ->
      @$('#check').html @checkDOM

    hideCheck: ->
      @$('#check').children().remove()

    onRender: ->
      @checkDOM = @$('#check').children().clone()
      unless @collection.getTotalCost() > 0
        @hideCheck()