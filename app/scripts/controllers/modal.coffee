define ->
  class ModalController
    constructor: (options) ->
      { @modalRegion } = options

    show: (view) ->
      # А где он удаляется?
      # TODO Найти этой установке класса более подходящее место, регион?
      view.on 'onClose', @hide

      $('#app-container').addClass 'modal-state'
      @modalRegion.show view

    hide: ->
      $('#app-container').removeClass 'modal-state'
      @modalRegion.close()