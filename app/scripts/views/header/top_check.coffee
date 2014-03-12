define ['templates/header/top_check', 'helpers/application_helpers'],
(template, Helpers) ->

  class TopCheckView extends Marionette.ItemView

    SLIDE_SPEED:  100
    BOUNCE_SPEED: 150

    template: template
    templateHelpers: -> Helpers

    ui:
      checkImage: '.kormapp-check-image'

    initialize: (options) ->
      { @app, @cart } = options
      @model = @cart
      @collection = @cart.items
      @_hideIfEmpty()

    bindings:
      '#kormapp-amount':
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
      if @model.getNumberOfItems() == 1
        @$el.show()
        @slideUp()
      else
        @bounce()

    itemRemoved: =>
      @_hideIfEmpty()

    bounce: =>
      @ui.checkImage.effect 'bounce', {times:2}, @BOUNCE_SPEED

    slideUp: =>
      checkHeight = @ui.checkImage.height()
      checkMarginTop = parseInt @ui.checkImage.css('margin-top')

      @ui.checkImage.
        css    ( 'margin-top', checkHeight + checkMarginTop ).
        animate( marginTop: checkMarginTop, @SLIDE_SPEED ).
        effect ( 'bounce', {times:2}, @BOUNCE_SPEED )

    _hideIfEmpty: ->
      @$el.hide() if @model.isEmpty()

    onRender: ->
      @stickit()