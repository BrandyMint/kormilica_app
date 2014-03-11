define ['views/check/check'], (CheckView) ->

  class CheckController extends Marionette.Controller

    initialize: (options) ->
      { @profile, @cart, @app } = options

      @checkView = new CheckView
        profile: @profile
        cart:    @cart

      @app.reqres.setHandler "form:data", =>
        @checkView.$el.find('form').serializeObject()

      @app.vent.on 'checkout:clicked check:clicked', =>
        @showCheck()
        @app.vent.trigger 'check:appeared'

      @app.vent.on 'order:created', =>
        @hideCheck()
        @app.vent.trigger 'check:disappeared'

      @checkView.on 'check:form:empty:field', =>
        @app.vent.trigger 'check:form:invalid'

      @checkView.on 'check:form:filled', =>
        @app.vent.trigger 'check:form:valid'

      @checkView.on 'cancel:button:clicked', =>
        @app.vent.trigger 'check:disappeared'
        @hideCheck()

    showCheck: ->
      @app.mainLayout.checkRegion.show @checkView

    hideCheck: ->
      @app.mainLayout.checkRegion.close()
