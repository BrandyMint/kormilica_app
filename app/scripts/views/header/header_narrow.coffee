define ['views/header/top_check', 'templates/header/header_narrow', 'helpers/application_helpers'],
(TopCheckView, template, Helpers) ->

    class HeaderNarrowView extends Marionette.Layout
      className: 'kormapp-header'
      template: template

      regions:
        checkRegion: '@kormapp-top-check'

      bindings:
        '@kormapp-logo-text':
          observe:      'mobile_title'
          updateMethod: 'html'
        # https://www.pivotaltracker.com/story/show/68420416
        # TODO Отключил обновление логотипа
        # потому что оно не показывается в cordova android
        #'.kormapp-logo-image':
          #attributes: [
            #name:    'src'
            #observe: 'mobile_logo_url'
          #]

      ui:
        logo: '@kormapp-logo'

      triggers:
        'tap @ui.logo': 'logo:clicked'

      initialize: ({ @app, @cart, @vendor }) ->
        @model = @vendor
        @checkView = new TopCheckView
          app: @app
          cart: @cart

      onShow: ->
        @checkRegion.show @checkView

      onRender: ->
        @$el.hammer()
        @stickit()
