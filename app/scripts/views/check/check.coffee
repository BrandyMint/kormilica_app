define ['marionette', 'templates/check/check', 'helpers/application_helpers', 'views/check/check_cart_item', 'jquery.form-serialize'], (Marionette, template, Helpers, CheckCartItemView) ->
  
  class Check extends Marionette.CompositeView
    template: template
    templateHelpers: -> Helpers
    itemView: CheckCartItemView
    itemViewContainer: '.cart-items'

    ui:
      form:       'form'
      backButton: '.check-header a'

    initialize: (options) ->
      { @cart } = options
      @collection = @cart.items

    events:
      'keyup form': 'checkForEmptyFields'

    triggers:
      'click @ui.backButton':
        event:          'cancel:button:clicked'
        preventDefault: true

    serializeData: ->
      cartItems:  @cart.items
      profile:    @options.profile
      total_cost: @cart.items.getTotalCost()

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
