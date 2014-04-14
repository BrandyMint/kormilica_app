define ->
  class CurrentCategoryController extends Marionette.Controller
    initialize: ({@profile, @sorted, @view}) ->
      @listenTo @view, 'itemview:category:click', (view, {model}) => @set model.id

    set: (id) ->
      @profile.set 'current_category_id', id
      @sorted.updateFilter(category_id: id)
