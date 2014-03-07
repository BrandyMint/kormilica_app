define ['marionette', 'templates/header/header', 'jquery.bounce', 'helpers/application_helpers'],
  (Marionette, template, jQueryBounce, Helpers) ->

    class HeaderView extends Marionette.ItemView
      template: template
      className: 'header'
      templateHelpers: -> Helpers
      triggers:
        'click #check': 'check:clicked'

      modelEvents:
        'change': 'update'

      bindings:
        '#amount':
          observe: 'total_cost'
          updateMethod: 'html'
          #onGet: (values) ->
            #value =  "#{@model.get('total_cost').cents}"
            #console.log value
            #values[0]=123
            #return value

          update: ->
            # TODO Разобраться почему через onGet не работает правильноk
            @$('#amount').html Helpers.money @model.get('total_cost')


      initialize: (options) ->
        { @app, @cart } = options
        @model = @cart

        # TODO Следить за коллекцией
        @app.vent.on 'cartitem:added', =>
          @bounceCheck 2, '5px', 100

      update: ->
        if @model.get('total_cost').cents > 0
          @showCheck()
        else
          @hideCheck()

        # TODO Обновлять через backbone.stickit
        # @$('#amount').html @model.get('total_cost') + " руб."

      showCheck: ->
        @$('#check').html @checkDOM

      hideCheck: ->
        @$('#check').children().remove()

      bounceCheck: (times, distance, speed) ->
        @$('#check img').bounce times, distance, speed

      onRender: ->
        @stickit()
        @checkDOM = @$('#check').children().clone()
        #unless @collection.getTotalCost() > 0
          #@hideCheck()
