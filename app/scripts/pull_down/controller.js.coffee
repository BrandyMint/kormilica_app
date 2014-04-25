define ->
  class PullDownController extends Marionette.Controller
    clickStopperTemplate: '<div class="kormapp-click-stopper"></div>'
    initialize: ({@view, @workHeight, @handler}) ->
      @setHeight = @view.setHeight.bind(@view)

      @_dragged = false
      @_anim = null
      @_down = false
      @_pullDownDistance = 0
      # высота под вьюху на которую она смещена в css стилях
      @maxHeight = 300

      @listenTo @view, 'render', @onRender

    onRender: =>
      @view.ui.pull.hammer()
      @view.ui.pull.on 'release dragdown', @hammerHandler
      @view.ui.pull.on 'tap', @_toggle

      @listenTo @view, 'pull-down:hide', @_hide

    hammerHandler: (ev) =>
      switch ev.type
        when 'release'
          return unless @_dragged
          webkitCancelRequestAnimationFrame(@_anim)

          if @_pullDownDistance >= @workHeight
            @_show()
            @handler(@) if typeof @handler == 'function'
          else
            @_hide()

        when 'dragdown'
          @_dragged = true
          @updateHeight() unless @_anim

          ev.gesture.preventDefault()
          @_pullDownDistance = _.min([ev.gesture.deltaY, @maxHeight])

    _toggle: =>
      if @_down
        @_hide()
      else
        @_show()

    _hide: =>
      @_pullDownDistance = 0
      @setHeight(0)
      webkitCancelRequestAnimationFrame(@_anim)
      @_anim = null
      @_dragged = null
      @_down = false
      @clickStopperHide()

    _show: =>
      @view.$el.addClass 'kormapp-slided-down'
      @_dragged = false
      @setHeight(@maxHeight)
      @_down = true
      @clickStopperShow()

    updateHeight: =>
      @setHeight(@_pullDownDistance)
      @_anim = webkitRequestAnimationFrame(@updateHeight)

    clickStopperShow: =>
      @clickStopper = $(@clickStopperTemplate)
      @view.$el.append @clickStopper
      @clickStopper.height $(window).height() + @maxHeight
      @clickStopper.width $(window).width()
      @clickStopper.one 'click', @_hide

    clickStopperHide: =>
      setTimeout (=>
        @view.$el.removeClass('kormapp-slided-down')
        @clickStopper.remove()
      ), 500
