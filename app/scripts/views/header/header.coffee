define ['templates/header/header', 'helpers/application_helpers'],
  (template, Helpers) ->
    debugger

    class HeaderView extends Marionette.ItemView
      template: template
      className: 'header'
      templateHelpers: -> Helpers
      triggers:
        'click #check': 'check:clicked'

      modelEvents:
        'change': 'update'

      #bindings:
        #'#amount':
          #observe: 'total_cost'
          #updateMethod: 'html'
          ##onGet: (values) ->
          ##value =  "#{@model.get('total_cost').cents}"
          ##console.log value
          ##values[0]=123
          ##return value

          #update: ->
            #console.log 'update', @model.get('total_cost')
            ## TODO Разобраться почему через onGet не работает правильноk


      initialize: (options) ->
        { @app, @cart } = options
        @model = @cart

        # TODO Следить за коллекцией
        @app.cart.items.on 'add', @bounce

      update: ->
        if @model.isEmpty()
          @hideCheck()
        else
          @showCheck()
        @changeCost()

      # TODO Вынсти check в отдельную вьюху
      showCheck: ->
        @$('#check').html @checkDOM

      hideCheck: ->
        @$('#check').children().remove()

      bounce: =>
        @$('#check img').effect 'bounce', {times:2}, 150

      changeCost: ->
        @$('#amount').html Helpers.money @model.get('total_cost')

      onRender: ->
        @checkDOM  = @$('#check').children().clone()

        @update()

        #unless @collection.getTotalCost() > 0
          #@hideCheck()
