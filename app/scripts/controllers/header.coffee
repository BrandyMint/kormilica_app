define ['views/header/header', 'views/header/header_check'], 
(HeaderView, HeaderCheckView) ->

  class HeaderController extends Marionette.Controller

    initialize: (options) ->
      { @cart, @app } = options

      @layout = new HeaderView
        app: @app
        cart: @cart

      @layout.on 'show', =>
        @checkRegion()

      @showHeader()

      @app.vent.on 'check:appeared', =>
        @hideHeader()

      @app.vent.on 'check:disappeared', =>
        @showHeader()

    hideHeader: ->
      $('#app-container').addClass 'checkout-state'
      @app.headerRegion.close()

    showHeader: ->
      $('#app-container').removeClass 'checkout-state'
      @app.headerRegion.show @layout

    checkRegion: =>
      checkView = new HeaderCheckView
        app: @app
        cart: @cart

      @layout.checkRegion.show checkView