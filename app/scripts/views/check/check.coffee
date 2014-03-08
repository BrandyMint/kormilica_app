define ['templates/check/check', 'helpers/application_helpers'], (template, Helpers) ->
  class Check extends Marionette.ItemView
    template: template
    templateHelpers: -> Helpers

    initialize: (options) ->
      { @cart, @profile } = options

    ui:
      form:       'form'
      backButton: '.check-header a'

    events:
      'keyup form': 'checkForEmptyFields'

    triggers:
      'click @ui.backButton':
        event:          'cancel:button:clicked'
        preventDefault: true

    serializeData: ->
      _.extend @cart.toJSON(),
        items:   @cart.items.toJSON()
        profile: @profile

    checkForEmptyFields: (e) =>
      formData = @ui.form.serializeObject()
      errors = []
      for inputData of formData
        unless formData[inputData]
          errors.push inputData

      if errors.length > 0
        @trigger 'check:form:empty:field'
      else
        @trigger 'check:form:filled'

    _setScrollableAreaHeight: ->
      container = $('.check-content')
      bottomInfo = $('.unscrollable-check')
      itemsList = $('.scrollable-check')

      scrollableHeight = container.height() - bottomInfo.height()
      itemsList.css 'height', scrollableHeight

    onShow: ->
      @_setScrollableAreaHeight()
