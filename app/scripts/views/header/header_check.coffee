define ['templates/header/header_check', 'helpers/application_helpers'],
(template, Helpers) ->

  class HeaderCheckView extends Marionette.ItemView

    template: template
    templateHelpers: -> Helpers

    initialize: (options) ->
      { @app, @cart } = options
      @model = @cart
      @collection = @cart.items

    bindings:
      '#amount':
        observe: 'total_cost'
        updateMethod: 'html'
        onGet: (value) ->
          Helpers.money value

    events:
      'click': 'clicked'

    collectionEvents:
      'add':    'itemAdded'
      'remove': 'itemRemoved'

    clicked: =>
      @app.vent.trigger 'check:clicked'

    itemAdded: (val) ->
      @$el.show() if @model.getNumberOfItems() == 1
      @bounce()

    itemRemoved: =>
      @$el.hide() if @model.isEmpty()

    bounce: =>
      @$('img').effect 'bounce', {times:2}, 150

    onRender: ->
      @stickit()