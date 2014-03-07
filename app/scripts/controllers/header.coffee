define ['marionette', 'views/header/header'], (Marionette, HeaderView) ->

  class HeaderController extends Marionette.Controller

    initialize: (options) ->
      { @cartItems, @app } = options

      @headerView = new HeaderView
        app: @app
        cartItems: @cartItems

      @showHeader()

      @headerView.on 'check:clicked', ->
        @app.vent.trigger 'checkout:show'

      @app.vent.on 'checkout:show', =>
        @hideHeader()

      @app.vent.on 'check:disappeared', =>
        @showHeader()

    hideHeader: ->
      $('#app-container').addClass 'checkout-state'
      @app.headerRegion.close()

    showHeader: ->
      $('#app-container').removeClass 'checkout-state'
      @app.headerRegion.show @headerView
