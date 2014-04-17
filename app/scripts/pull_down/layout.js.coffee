define ['templates/pull_down_layout'], (template) ->
  class PullDownLayout extends Marionette.Layout
    className: 'kormapp-categories-list-narrow'
    template: template

    regions:
      holder: '@kormapp-pull-down-view'

    ui:
      pull: '@kormapp-pull-tag'

    onRender: ->
      @holder.show @options.view
      @listenTo @options.view, 'itemview:category:click', =>
        @trigger 'pull-down:hide'

    setHeight: (height) =>
      @$el.css '-webkit-transform', "translate3d(0, #{height}px, 0) scale3d(1,1,1)"
