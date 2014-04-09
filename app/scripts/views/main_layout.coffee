define ['templates/main_layout', 'helpers/application_helpers'],
(template, Helpers) ->
    class MainLayout extends Marionette.Layout

      el: '#kormapp-container'
      #className: 'content'
      template: template

      regions:
        headerRegion: "#kormapp-header-region"
        mainRegion:   "#kormapp-main-region"
        footerRegion: "#kormapp-footer-region"
        checkRegion:  "#kormapp-check-region"
        modalRegion:  "#kormapp-modal-region"

      onRender: ->
        @modalRegion.on 'close', (e) ->
          Helpers.body_scroll_top()
