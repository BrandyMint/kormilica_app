define ->
  class CurrentCategoryController extends Marionette.Controller
    initialize: ({@profile, @sorted, @view, @categories}) ->
      # set active category view when collectionview renders:
      @listenTo @view, 'render', () =>
        @_activateAtInit()

      @listenTo @view, 'itemview:category:click', (view, {model}) =>
        @set model.id
        # set active category view on select:
        @._activateItem view, @.view

    set: (id) ->
      @profile.set 'current_category_id', id
      @sorted.updateFilter(category_id: id)


    # TODO refactor setting active category

    _activateAtInit: ->
      active_category = @categories.get @profile.get 'current_category_id'
      active_view = @view.children.findByModel(active_category)
      @_activateItem active_view, @view

    _activateItem: (view, list_view) =>
      item_views = list_view.children._views
      item_views.call(deactivate)
      view.activate()
