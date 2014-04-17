define ->
  class CurrentCategoryController extends Marionette.Controller
    initialize: ({@profile, @sorted, @view, @categories}) ->
      @listenTo @profile, 'change', () =>
        @set @profile.get 'current_category_id'

    set: (id) ->
      @sorted.updateFilter(category_id: id)

