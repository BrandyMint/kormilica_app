define ['views/header/top_check', 'templates/header/header', 'helpers/application_helpers'],
(TopCheckView, template, Helpers) ->

    class HeaderView extends Marionette.Layout
      className: 'kormapp-header row'
      template: template

      regions:
        checkRegion: '#kormapp-top-check'

      ui:
        logo: '#kormapp-logo'

      triggers:
        'click @ui.logo': 'logo:clicked'
        
      initialize: (options) ->
        { @app, @cart } = options

        @checkView = new TopCheckView
          app: @app
          cart: @cart

      onShow: ->
        @checkRegion.show @checkView