define ['views/check/check'], (CheckView) ->

  class CheckController extends Marionette.Controller

    initialize: ({ @app, @user, @cart, @vendor }) ->

      @app.commands.setHandler 'check:show', =>
        @showCheck()

      @app.vent.on 'order:created', =>
        @hideCheck()

    showCheck: ->
      @checkView = new CheckView
        app:    @app
        user:   @user
        cart:   @cart
        vendor: @vendor

      @checkView.on 'cancel:button:clicked', =>
        @hideCheck()

      @app.mainLayout.checkRegion.show @checkView

    hideCheck: ->
      @app.mainLayout.checkRegion.close()