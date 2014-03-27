define ->
  class ReflectionController
    constructor: ->
      $(document).on "touchstart mousedown", '.kormapp-reflection', (e) =>
        el = $ e.currentTarget
        el.addClass('kormapp-reflection-on')

        _callback = @callback.bind @,el

        window.clearTimeout @_reflection_timeout_id if @_reflection_timeout_id?

        @_reflection_timeout_id = window.setTimeout _callback, 2000

        el.on "touchend mouseup touchmove mousemove", _callback

    callback: (el) ->
      el.removeClass('kormapp-reflection-on')
      window.clearTimeout @_reflection_timeout_id
      @_reflection_callback = undefined
