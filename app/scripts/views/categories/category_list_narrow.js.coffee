define [
  'templates/categories/category_list_narrow',
  'views/categories/category',
  'widget/pull_down'
  ], (template, CategoryView, PullDownWidget) ->
  class CategoryListNarrow extends Marionette.CompositeView
    template: template
    className: 'kormapp-categories-list-narrow'
    itemView: CategoryView
    itemViewContainer: '@kormapp-list-container'

    initialize: ->
      @on 'itemview:category:click', => @trigger 'pull-down:hide'

    ui:
      pull: '@kormapp-pull-tag'
      modal: '.kormapp-categories-modal'

    onRender: ->
      new PullDownWidget
        view: @
        $slideTag: @ui.pull
        $modal: @ui.modal
        maxHeight: 300
        workHeight: 63
