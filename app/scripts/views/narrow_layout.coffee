define ['templates/narrow_layout', 'helpers/application_helpers'],
(template, Helpers) ->
    class NarrowLayout extends Marionette.Layout
      el: '@kormapp-container'
      className: 'kormapp-narrow-layout'
      template: template

      regions:
        headerRegion: "@kormapp-header-region"
        products:     "@kormapp-products-region"
        footerRegion: "@kormapp-footer-region"
        checkRegion:  "@kormapp-check-region"
        modalRegion:  "@kormapp-modal-region"

      onRender: ->
        @$el.addClass @className
        @modalRegion.on 'close', (e) ->
          $('body').scrollTop(0)
