define ->

  # Делегирование DOM событий
  $(document)
    .on("touchstart mousedown", '.kormapp-reflection', (e) ->
      $(@).addClass('kormapp-mousedown'))
    .on("touchend mouseup", '.kormapp-reflection', (e) ->
      $(@).removeClass('kormapp-mousedown'))
    .on("mousemove", '.kormapp-reflection', (e) ->
      $(@).removeClass('kormapp-mousedown'))