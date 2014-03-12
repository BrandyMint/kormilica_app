define ['views/header/top_check', 'templates/header/header', 'helpers/application_helpers'],
(TopCheckView, template, Helpers) ->

    class HeaderView extends Marionette.Layout

      className: 'header row'
      template: template

      regions:
        checkRegion: '#kormapp-top-check'

      initialize: (options) ->
        { @app, @cart } = options

        @checkView = new TopCheckView
          app: @app
          cart: @cart

      onShow: ->
        @checkRegion.show @checkView