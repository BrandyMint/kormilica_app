define ['marionette', 'templates/header/header', 'jquery.bounce', 'helpers/application_helpers'], (Marionette, template, jQueryBounce, Helpers) ->

  class HeaderView extends Marionette.ItemView
    template: template
    className: 'header'
    templateHelpers: -> Helpers

    initialize: (options) ->
      { @app, @cartItems } = options

      # TODO Следить за коллекцией
      @app.vent.on 'cartitem:added', =>
        @bounceCheck 2, '5px', 100

    triggers:
      'click #check': 'check:clicked'

    serializeData: ->
      total_cost: @cartItems.getTotalCost()

    #collectionEvents:
      #'all': 'updateTotalCost'

    #updateTotalCost: () ->
      #if @collection.getTotalCost() > 0 then @showCheck() else @hideCheck()
      #@$('#amount').html @collection.getTotalCost() + " руб."

    showCheck: ->
      @$('#check').html @checkDOM

    hideCheck: ->
      @$('#check').children().remove()

    bounceCheck: (times, distance, speed) ->
      @$('#check img').bounce times, distance, speed

    onRender: ->
      @checkDOM = @$('#check').children().clone()
      #unless @collection.getTotalCost() > 0
        #@hideCheck()
