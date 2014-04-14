define ['views/categories/category'],
(CategoryView) ->
  class CategoryList extends Marionette.CollectionView
    itemView: CategoryView

    initialize: ->
      @on 'itemview:category:click', @setCurrentCategory

    setCurrentCategory: (view, {model}) =>
      @options.currentCategory.set model.id
