define ['views/categories/category'],
(CategoryView) ->
  class CategoryList extends Marionette.CollectionView
    itemView: CategoryView

    initialize: ->
      @on 'itemview:category:click', @updateProducts

    updateProducts: (view, data) =>
      @options.products.updateFilter(category_id: data.model.id) if data.model
