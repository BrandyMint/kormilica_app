define ['app', 'marionette', 'templates/header/header', 'jquery.bounce'], (App, Marionette, template) ->

  class Header extends Marionette.ItemView
    template: template
    className: 'header'

    initialize: ->
      App.vent.on 'cartitem:added', =>
        @bounceCheck 2, '5px', 100

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

    bounceCheck: (times, distance, speed) ->
      @$('#check img').bounce times, distance, speed

    onRender: ->
      @checkDOM = @$('#check').children().clone()
      unless @collection.getTotalCost() > 0
        @hideCheck()