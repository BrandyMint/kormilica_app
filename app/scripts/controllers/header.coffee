define ['views/header/header'], (HeaderView) ->

  class HeaderController extends Marionette.Controller

    initialize: (options) ->
      { @cart, @app } = options

      @headerView = new HeaderView
        app: @app
        cart: @cart

      @showHeader()

      @headerView.on 'check:clicked', ->
        @app.vent.trigger 'checkout:show'

      @app.vent.on 'check:appeared', =>
        @hideHeader()

      @app.vent.on 'check:disappeared', =>
        @showHeader()

    hideHeader: ->
      $('#app-container').addClass 'checkout-state'
      @app.headerRegion.close()

    showHeader: ->
      $('#app-container').removeClass 'checkout-state'
      @app.headerRegion.show @headerView
