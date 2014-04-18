define ->
  class CurrentCategoryController extends Marionette.Controller
    initialize: ({@profile, @sorted}) ->
      @listenTo @profile, 'change', () =>
        @updateProductsList @profile.get 'current_category_id'

    updateProductsList: (id) ->
      @sorted.updateFilter(category_id: id)

