define ->
  class ModalController
    constructor: (options) ->
      { @modalRegion } = options

    show: (view) ->
      # А где он удаляется?
      # TODO Найти этой установке класса более подходящее место, регион?
      view.on 'onClose', @hide
      @modalRegion.show view

    hide: ->
      @modalRegion.close()