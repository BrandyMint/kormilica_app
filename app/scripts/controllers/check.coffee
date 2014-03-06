define ['marionette', 'views/check/check', 'jquery.form-serialize'], (Marionette, CheckView) ->

  class Controller extends Marionette.Controller

    initialize: (options) ->
      { @profile, @cart, @App } = options

      @App.vent.on 'checkout:show', =>
        @showCheck()

      @App.vent.on 'order:created', =>
        $form_data = @checkView.$el.find('form').serializeObject()
        @profile.save name: $form_data.name, phoneNumber: $form_data.phone
        @hideCheck()

    showCheck: ->
      @checkView = new CheckView 
        profile: @profile
        collection: @cart
      @App.checkRegion.show @checkView

      @checkView.on 'check:form:empty:field', ->
        @App.vent.trigger 'check:form:invalid'

      @checkView.on 'check:form:filled', ->
        @App.vent.trigger 'check:form:valid'

    hideCheck: ->
      @App.checkRegion.close()