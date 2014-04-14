define ['views/categories/category'],
(CategoryView) ->
  class CategoryList extends Marionette.CollectionView
    itemView: CategoryView

    initialize: ->
      @on 'itemview:category:click', @updateProducts

    updateProducts: (view, data) =>
      if data.model
        @options.app.profile.set 'currentCategory', data.model.id
        @options.products.updateFilter(category_id: data.model.id)
