define ['templates/wide_layout', 'helpers/application_helpers'],
(template, Helpers) ->
    class WideLayout extends Marionette.Layout
      el: '#kormapp-container'
      className: 'kormapp-wide-layout'
      template: template

      regions:
        headerRegion:  "@kormapp-header-region"
        sidebarRegion: '@kormapp-sidebar-region'
        categories:    '@kormapp-sidebar-categories-region'
        checkRegion:   "@kormapp-sidebar-check-region"
        products:      '@kormapp-products-region'
        footerRegion:  "@kormapp-footer-region"
        modalRegion:   "@kormapp-modal-region"

      onRender: ->
        @$el.addClass @className
        @modalRegion.on 'close', (e) ->
          $('body').scrollTop(0)
