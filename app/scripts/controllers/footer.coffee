define ['views/footer/footer'], (FooterView) ->

  class FooterController extends Marionette.Controller

    initialize: (options) ->
      { @cart, @app, @user, @vent } = options

      @footerView = new FooterView
        app:     @app
        cart:    @cart
        user:    @user

      @showFooter()

      @footerView.on 'checkout:clicked', =>
        @vent.trigger 'checkout:clicked'

    showFooter: ->
      @app.mainLayout.footerRegion.show @footerView
