define ['marionette', 'templates/header/header', 'jquery.bounce', 'helpers/application_helpers'], (Marionette, template, jQueryBounce, Helpers) ->

  class HeaderView extends Marionette.ItemView
    template: template
    className: 'header'
    templateHelpers: -> Helpers
    triggers:
      'click #check': 'check:clicked'

    modelEvents:
      'change': 'updateTotalCost'

    initialize: (options) ->
      { @app, @cart } = options

      @model = @cart

      # TODO Следить за коллекцией
      @app.vent.on 'cartitem:added', =>
        @bounceCheck 2, '5px', 100

    updateTotalCost: () ->
      if @model.get('total_cost') > 0
        @showCheck()
      else
        @hideCheck()

      # TODO Обновлять через backbone.stickit
      @$('#amount').html @model.get('total_cost') + " руб."

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
