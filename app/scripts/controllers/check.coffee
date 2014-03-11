define ['views/check/check'], (CheckView) ->

  class CheckController extends Marionette.Controller

    initialize: (options) ->
      { @profile, @cart, @app } = options

      @app.vent.on 'checkout:clicked check:clicked', =>
        @showCheck()

      @app.vent.on 'order:created', =>
        @hideCheck()

    showCheck: ->
      @checkView = new CheckView
        app:     @app
        profile: @profile
        cart:    @cart

      @checkView.on 'cancel:button:clicked', =>
        @hideCheck()

      @app.mainLayout.checkRegion.show @checkView

    hideCheck: ->
      @app.mainLayout.checkRegion.close()