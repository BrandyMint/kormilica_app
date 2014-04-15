define ['views/categories/category'], (CategoryView) ->
  class CategoryListNarrow extends Marionette.CollectionView
    itemView: CategoryView

    initialize: ->
      @on 'itemview:category:click', => @trigger 'pull-down:hide'
