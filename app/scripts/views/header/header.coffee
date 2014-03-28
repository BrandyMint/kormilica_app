define ['views/header/top_check', 'templates/header/header', 'helpers/application_helpers'],
(TopCheckView, template, Helpers) ->

    class HeaderView extends Marionette.Layout
      className: 'kormapp-header row'
      template: template

      regions:
        checkRegion: '#kormapp-top-check'

      bindings:
        '.kormapp-logo-text':
          observe:      'mobile_title'
          updateMethod: 'html'
        # https://www.pivotaltracker.com/story/show/68420416
        # Отключил обновление логотипа
        # потому что оно не показывается в cordova android
        #'.kormapp-logo-image':
          #attributes: [
            #name:    'src'
            #observe: 'mobile_logo_url'
          #]

      ui:
        logo: '#kormapp-logo'

      triggers:
        'click @ui.logo': 'logo:clicked'

      initialize: ({ @app, @cart, @vendor }) ->
        @model = @vendor
        @checkView = new TopCheckView
          app: @app
          cart: @cart

      onShow: ->
        @checkRegion.show @checkView

      onRender: ->
        @stickit()
