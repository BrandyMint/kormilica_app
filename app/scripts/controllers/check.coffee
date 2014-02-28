define ['app', 'marionette', 'views/check/check', 'jquery.form-serialize'], (App, Marionette, CheckView) ->

  class Controller extends Marionette.Controller

    initialize: (options) ->
      { @profile, @cart } = options

      App.vent.on 'checkout:show', =>
        @showCheck()

      App.vent.on 'order:created', =>
        $form_data = @checkView.$el.find('form').serializeObject()
        @profile.save name: $form_data.name, phoneNumber: $form_data.phone
        @hideCheck()

    showCheck: ->
      @checkView = new CheckView 
        profile: @profile
        collection: @cart
      App.checkRegion.show @checkView

    hideCheck: ->
      App.checkRegion.close()