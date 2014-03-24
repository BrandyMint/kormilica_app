define ->

  # Делегирование DOM событий
  $(document)
    .on("mousedown", '.kormapp-interactive', (e) ->
      $(@).addClass('kormapp-mousedown'))
    .on("mouseup", '.kormapp-interactive', (e) ->
      $(@).removeClass('kormapp-mousedown'))
    .on("mousemove", '.kormapp-interactive', (e) ->
      $(@).removeClass('kormapp-mousedown'))