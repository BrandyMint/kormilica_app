define ['templates/narrow_layout', 'helpers/application_helpers'],
(template, Helpers) ->
    class NarrowLayout extends Marionette.Layout
      el: '@kormapp-container'
      template: template
      
      initialize: ({layoutClass}) ->
        @layoutClass = layoutClass

      ui:
        layoutContainer: "@kormapp-layout-container"

      regions:
        headerRegion: "@kormapp-header-region"
        products:     "@kormapp-products-region"
        categories:   "@kormapp-categories-region"
        footerRegion: "@kormapp-footer-region"
        checkRegion:  "@kormapp-check-region"
        modalRegion:  "@kormapp-modal-region"

      onRender: ->
        @_transferClass @$el, @ui.layoutContainer
        @$el.addClass @layoutClass
        @modalRegion.on 'close', (e) ->
          $('body').scrollTop(0)

      _transferClass: (source, destination)->
        layoutClass = source.attr 'class'
        destination.addClass layoutClass
        source.removeAttr 'class'

