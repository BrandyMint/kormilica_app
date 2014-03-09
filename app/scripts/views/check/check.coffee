define ['templates/check/check', 'views/check/check_cart_item', 'helpers/application_helpers' ], (template, CheckCartItemView, Helpers) ->

  class Check extends Marionette.CompositeView
    template: template
    templateHelpers: -> Helpers
    itemView: CheckCartItemView
    itemViewContainer: '.cart-items'

    initialize: (options) ->
      { @cart, @profile } = options
      @collection = @cart.items
      @model = @profile

    bindings:
      '#name':
        observe: 'name'
      '#phone':
        observe: 'phone'

    ui:
      form:       'form'
      backButton: '.check-header a'

    triggers:
      'click @ui.backButton':
        event:          'cancel:button:clicked'
        preventDefault: true

    serializeData: ->
      _.extend @cart.toJSON(),
        items:   @cart.items.toJSON()
        profile: @profile

    _setScrollableAreaHeight: ->
      container =  $('.check-content')
      bottomInfo = $('.unscrollable-check')
      itemsList =  $('.scrollable-check')

      scrollableHeight = container.height() - bottomInfo.height()
      itemsList.css 'height', scrollableHeight

    onShow: ->
      @_setScrollableAreaHeight()

    onRender: ->
      @stickit()
