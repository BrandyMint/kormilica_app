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
        @showUp()

    itemRemoved: =>
      @_hideIfEmpty()

    bounce: =>
      return if @model.isEmpty()
      return unless @ui.checkImage.is(':visible')
      @ui.checkImage.effect 'bounce', {times:1}, @BOUNCE_SPEED

    showUp: =>
      @ui.checkImage.finish().
        css( 'margin-top', @checkHeight + @checkMarginTop ).
        animate( marginTop: @checkMarginTop, @SLIDE_SPEED ).
        effect( 'bounce', {times:1}, @BOUNCE_SPEED )

    _hideIfEmpty: ->
      if @model.isEmpty()
        @ui.checkImage.finish().
          animate marginTop: @checkHeight + @checkMarginTop, @SLIDE_SPEED, 'swing', =>
            @$el.fadeOut @SLIDE_SPEED

    onRender: ->
      @listenTo @model, 'change:total_cost_cents', @bounce

      @checkHeight    = 50 #@ui.checkImage.height()
      @checkMarginTop = 0 #$parseInt @ui.checkImage.css('margin-top')
      if @model.isEmpty()
        @$el.hide() 

      @stickit()
