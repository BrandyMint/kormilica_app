define ->
  class CurrentCategoryController
    constructor: ({@profile, @collection, @sorted}) ->
      _.extend @, Backbone.Events
      @listenTo @collection, 'add remove reset', @update
      @update()

    set: (id) =>
      return unless @collection.get(id)
      @profile.set('current_category_id', id)
      @sorted.updateFilter category_id: id

    update: =>
      @set(@_get())

    _get: =>
      id = @profile.get('current_category_id')
      if id and @collection.get(id)
        id
      else
        @collection.first().id
