define ['marionette', 'templates/check/check', 'jquery.form-serialize'], (Marionette, template) ->
  
  class CheckTop extends Marionette.ItemView
    template: template

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
      items:   @collection.toJSON()
      profile: @options.profile

    templateHelpers: ->
      totalCost: @collection.getTotalCost()

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