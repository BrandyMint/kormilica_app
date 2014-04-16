define ->
  class PullDownWidget
    constructor: ({@view, @$slideTag, @$modal, @maxHeight, @workHeight, @handler}) ->
      _.extend @, Backbone.Events
      @$slideBox = @view.$el
      @_dragged = false
      @_anim = null
      @_down = false
      @_pullDownDistance = 0
      @$slideTag.hammer()
      @$slideTag.on 'release dragdown', @hammerHandler
      @$slideTag.on 'tap', @toggle
      @$modal.on 'click', @hide
      @listenTo @view, 'pull-down:hide', @hide

    hammerHandler: (ev) =>
      switch ev.type
        when 'release'
          return unless @_dragged
          webkitCancelRequestAnimationFrame(@_anim)

          if @_pullDownDistance >= @workHeight
            @show()
            @handler(@) if typeof @handler == 'function'
          else
            @hide()

        when 'dragdown'
          @_dragged = true
          @updateHeight() unless @_anim

          ev.gesture.preventDefault()
          @_pullDownDistance = _.min([ev.gesture.deltaY, @maxHeight])

    toggle: =>
      if @_down
        @hide()
      else
        @show()

    hide: =>
      @_pullDownDistance = 0
      @setHeight(0)
      webkitCancelRequestAnimationFrame(@_anim)
      @_anim = null
      @_dragged = null
      @_down = false
      @modalHide()

    show: =>
      @$slideBox.addClass 'kormapp-slided-down'
      @_dragged = false
      @setHeight(@maxHeight)
      @_down = true
      @modalShow()

    setHeight: (height) =>
      @$slideBox.css '-webkit-transform', "translate3d(0, #{height}px, 0) scale3d(1,1,1)"

    updateHeight: =>
      @setHeight(@_pullDownDistance)
      @_anim = webkitRequestAnimationFrame(@updateHeight)

    modalShow: =>
      setTimeout (=>
        @$slideBox.css 'height', '200%'
        @$modal.show()), 500

    modalHide: =>
      setTimeout (=>
        @$slideBox.css 'height', ''
        @$slideBox.removeClass('kormapp-slided-down')
        @$modal.hide()), 500
