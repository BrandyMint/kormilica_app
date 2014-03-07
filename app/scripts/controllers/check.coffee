define ['marionette', 'views/check/check', 'jquery.form-serialize'], (Marionette, CheckView) ->

  class CheckController extends Marionette.Controller

    initialize: (options) ->
      { @profile, @cart, @app } = options

      @app.vent.on 'checkout:show', =>
        @showCheck()

      @app.vent.on 'order:created', =>
        $form_data = @checkView.$el.find('form').serializeObject()
        @profile.save name: $form_data.name, phoneNumber: $form_data.phone
        @app.vent.trigger 'check:disappeared'
        @hideCheck()

    showCheck: ->
      @checkView = new CheckView 
        profile: @profile
        collection: @cart
      @app.checkRegion.show @checkView

      @checkView.on 'check:form:empty:field', =>
        @app.vent.trigger 'check:form:invalid'

      @checkView.on 'check:form:filled', =>
        @app.vent.trigger 'check:form:valid'

      @checkView.on 'cancel:button:clicked', =>
        @app.vent.trigger 'check:disappeared'
        @hideCheck()

    hideCheck: ->
      @app.checkRegion.close()