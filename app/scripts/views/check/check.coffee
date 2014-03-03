define ['marionette', 'templates/check/check'], (Marionette, template) ->
  
  class CheckTop extends Marionette.ItemView
    template: template

    serializeData: ->
      items:   @collection.toJSON()
      profile: @options.profile

    templateHelpers: ->
      totalCost: @collection.getTotalCost()

    _setScrollableAreaHeight: ->
      container = $('.check-content')
      bottomInfo = $('.unscrollable-check')
      itemsList = $('.scrollable-check')

      scrollableHeight = container.height() - bottomInfo.height()
      itemsList.css 'height', scrollableHeight

    onShow: ->
      @_setScrollableAreaHeight()