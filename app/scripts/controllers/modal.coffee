define ->
  class ModalController
    constructor: (options) ->
      { @modalRegion } = options

    show: (view) ->
      # А где он удаляется?
      # TODO Найти этой установке класса более подходящее место, регион?
      view.on 'onClose', @hide

      $('#kormapp-container').addClass 'modal-state'
      @modalRegion.show view

    hide: ->
      $('#kormapp-container').removeClass 'modal-state'
      @modalRegion.close()
