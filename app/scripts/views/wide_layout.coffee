define ['templates/wide_layout', 'helpers/application_helpers'],
(template, Helpers) ->
    class WideLayout extends Marionette.Layout
      el: '#kormapp-container'
      #className: 'content'
      template: template

      regions:
        headerRegion: "@kormapp-header-region"
        categories:   '@kormapp-categories-region'
        products:     '@kormapp-products-region'
        footerRegion: "@kormapp-footer-region"
        checkRegion:  "@kormapp-check-region"
        modalRegion:  "@kormapp-modal-region"

      onRender: ->
        @modalRegion.on 'close', (e) ->
          Helpers.body_scroll_top()
