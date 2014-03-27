define ->
  class ReflectionController
    constructor: ->
      $(document).on "touchstart mousedown", '.kormapp-reflection', (e) ->
        el = $ @
        el.addClass('kormapp-reflection-on')

        window.__reflection_timeStamp = e.timeStamp

        window.__reflection_callback = =>
          el.removeClass('kormapp-reflection-on')
          window.clearTimeout window.__reflection_timeout_id
          window.__reflection_callback = undefined

        window.clearTimeout window.__reflection_timeout_id if window.__reflection_timeout_id?

        window.__reflection_timeout_id = window.setTimeout window.__reflection_callback, 2000

        el.on "touchend mouseup mousemove", -> window.__reflection_callback?.call()
