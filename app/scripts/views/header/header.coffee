define ['views/header/header_check', 'templates/header/header', 'helpers/application_helpers'],
(HeaderCheckView, template, Helpers) ->

    class HeaderView extends Marionette.Layout

      className: 'header'
      template: template
      
      regions:
        checkRegion: '#check'

      initialize: (options) ->
        { @app, @cart } = options

        @checkView = new HeaderCheckView
          app: @app
          cart: @cart

      onShow: ->
        @checkRegion.show @checkView