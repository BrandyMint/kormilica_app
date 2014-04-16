define [
  'templates/categories/category_list_narrow',
  'views/categories/category'
  ], (template, CategoryView) ->
  class CategoryListNarrow extends Marionette.CompositeView
    template: template
    className: 'kormapp-categories-list-narrow'
    itemView: CategoryView
    itemViewContainer: '@kormapp-list-container'

    initialize: ->
      @on 'itemview:category:click', @_hide
      @_dragged = false
      @_anim = null
      @_pullDownDistance = 0
      @viewHeight = 300
      @workDistance = 63

    ui:
      pull: '@kormapp-pull-tag'
      modal: '.kormapp-categories-modal'

    events:
      'touch @kormapp-pull-tag': '_onTouch'
      'release': '_onRelease'
      'dragdown @kormapp-pull-tag': '_onDragDown'
      'tap @kormapp-pull-tag': '_showList'
      'tap .kormapp-categories-modal': '_hide'

    onRender: ->
      @$el.hammer()

    _onTouch: (e) =>
      @_hide()

    _onRelease: (e) =>
      return unless @_dragged
      webkitCancelRequestAnimationFrame(@_anim)

      if @_pullDownDistance >= @workDistance
        @_dragged = false
        @_showList()
      else
        @$el.addClass('kormapp-slide-up')
        @_hide()

    _onDragDown: (e) =>
      @_dragged = true
      @updateDistance() unless @_anim

      e.gesture.preventDefault()
      @_pullDownDistance = _.min([e.gesture.deltaY, @viewHeight])

    _showList: =>
      @_down = true
      @$el.addClass 'kormapp-slided-down'
      @setDistance(@viewHeight)
      setTimeout @modalShow, 500

    _hide: =>
      @$el.removeClass('kormapp-slided-down')
      @$el.addClass('kormapp-slide-up') if @_down
      @_pullDownDistance = 0
      @setDistance(0)
      webkitCancelRequestAnimationFrame(@_anim)
      @_anim = null
      @_dragged = false
      @_down = false
      @modalHide()
      setTimeout (=> @$el.removeClass('kormapp-slide-up')), 500

    setDistance: (dist) =>
      @el.style.transform = "translate3d(0, #{dist}px, 0)"
      @el.style.webkitTransform = "translate3d(0, #{dist}px, 0) scale3d(1,1,1)"

    updateDistance: =>
      @setDistance(@_pullDownDistance)
      @_anim = webkitRequestAnimationFrame(@updateDistance)

    modalShow: =>
      @el.style.height = '100%'
      @ui.modal.show()

    modalHide: =>
      @el.style.height = ''
      @ui.modal.hide()
