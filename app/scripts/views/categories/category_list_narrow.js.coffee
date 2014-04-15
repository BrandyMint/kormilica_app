define [
  'templates/categories/category_list_narrow',
  'views/categories/category'
  ], (template, CategoryView) ->
  class CategoryListNarrow extends Marionette.CompositeView
    template: template
    className: 'categories-list-narrow'
    itemView: CategoryView
    itemViewContainer: '@list-container'

    initialize: ->
      @on 'itemview:category:click', @_hide
      @_dragged = false
      @_anim = null
      @_pullDownDistance = 0
      @viewHeight = 300

    ui:
      pull: '@pull-tag'

    events:
      'touch @pull-tag': '_onTouch'
      'release': '_onRelease'
      'dragdown @pull-tag': '_onDragDown'

    onRender: ->
      @$el.hammer()

    _onTouch: (e) =>
      @_hide()

    _onRelease: (e) =>
      return unless @_dragged
      webkitCancelRequestAnimationFrame(@_anim)

      if e.gesture.deltaY > @viewHeight
        @_dragged = false
      else
        @_hide()

    _onDragDown: (e) =>
      @_dragged = true
      @updateDistance() unless @_anim

      e.gesture.preventDefault()
      @_pullDownDistance = _.min([e.gesture.deltaY, @viewHeight])

    _hide: =>
      @ui.pull.removeClass ''
      @_pullDownDistance = 0
      @setDistance(0)
      webkitCancelRequestAnimationFrame(@_anim)
      @_anim = null
      @_dragged = false

    setDistance: (dist) =>
      @el.style.webkitTransform = "translate3d(0, #{dist}px, 0) scale3d(1,1,1)"

    updateDistance: =>
      @setDistance(@_pullDownDistance)
      @_anim = webkitRequestAnimationFrame(@updateDistance)
