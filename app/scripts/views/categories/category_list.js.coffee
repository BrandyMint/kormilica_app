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
      @currentView = @_getCurrentView()
      @currentView?.activate()

    _activateItem: (view) =>
      unless @currentView == view
        @currentView?.deactivate()
        @currentView = view
        @currentView?.activate()

    _getCurrentView: ->
      active_id = @profile.get 'current_category_id'
      active_category = @collection.get active_id
      if active_category?
        @children.findByModel(active_category)
      else
        null

