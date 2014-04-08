define ['views/check/check'], (CheckView) ->

  class CheckController extends Marionette.Controller

    initialize: ({ @app, @user, @cart, @vendor, @modal }) ->

      @app.commands.setHandler 'check:show', @showCheck

      @app.vent.on 'order:created device:backbutton', @hideCheck

      @app.vent.on 'order:created order:failed', @hideModal

    showCheck: =>
      @checkView = new CheckView
        app:    @app
        user:   @user
        cart:   @cart
        vendor: @vendor
        modal: @modal

      @checkView.on 'cancel:button:clicked', @hideCheck

      @app.mainLayout.checkRegion.show @checkView

    hideCheck: =>
      @app.mainLayout.checkRegion.close()

    hideModal: =>
      @modal.hide()
