define ['views/categories/category'],
(CategoryView) ->
  class CategoryList extends Marionette.CollectionView
    itemView: CategoryView
    className: 'kormapp-categories-list'

    initialize: ({@collection, @profile}) ->
      @on 'itemview:category:click', (view, {model}) =>
        @_selectCategory view, model

    onRender: ->
      @_activateAtInit()

    _selectCategory: (view, model) =>
      @profile.set 'current_category_id', model.id
      @_activateItem view

    _activateAtInit: ->
      active_id = @profile.get 'current_category_id'
      active_category = @collection.get active_id
      if active_category?
        active_view = @children.findByModel(active_category)
        @_activateItem active_view

    _activateItem: (view) =>
      @children.call('deactivate')
      view.activate()
