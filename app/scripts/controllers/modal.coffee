define ->
  class ModalController
    constructor: (options) ->
      { @modalRegion } = options

    show: (view) ->
      # А где он удаляется?
      # TODO Найти этой установке класса более подходящее место, регион?
      view.on 'onClose', @hide

      $('#kormapp-container').addClass 'kormapp-modal-state'
      @modalRegion.show view

    hide: ->
      $('#kormapp-container').removeClass 'kormapp-modal-state'
      @modalRegion.close()