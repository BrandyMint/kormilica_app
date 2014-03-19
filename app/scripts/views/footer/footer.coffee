define ['templates/footer/footer', 'templates/footer/_checkout', 'helpers/application_helpers'], 
(template, checkoutButtonTemplate, Helpers) ->

  class Footer extends Marionette.ItemView
    template: template

    initialize: ({ @vent, @cart, @vendor }) ->
      @model = @vendor
      @collection = @cart.items

      @vent.on 'order:created', =>
        @hideButton()

    bindings:
      '.kormapp-footer-offer':
        observe:      'mobile_footer'
        updateMethod: 'html'
      '.kormapp-free-delivery':
        observe:      'mobile_delivery'
        updateMethod: 'html'
        onGet:        (val) ->
          deliveryPrice = Helpers.moneyWithoutCurrency @vendor.get 'delivery_price'
          if deliveryPrice == 0
            return val
          else
            return "Стоимость доставки #{deliveryPrice} руб."

    events:
      'click a.kormapp-checkout':         'checkoutButtonClicked'
      'click .kormapp-delivery-discount': 'emptyButtonClicked'

    collectionEvents:
      'add':    'showCheckoutButton'
      'remove': 'hideButton'

    showCheckoutButton: ->
      @$('#kormapp-workspace').html checkoutButtonTemplate

    hideButton: ->
      if @cart.isEmpty()
        @$('#kormapp-workspace').html @workspaceDOM

    checkoutButtonClicked: (e) ->
      e.preventDefault()

      if @_isGreaterThanMinimalPrice()
        @trigger 'checkout:clicked'
      else
        alert "Минимальный заказ от #{@minimalPrice} рублей"

    _isGreaterThanMinimalPrice: ->
      @minimalPrice = Helpers.moneyWithoutCurrency @vendor.get 'minimal_price'
      currentTotalCost = Helpers.moneyWithoutCurrency @cart.get 'total_cost'
      currentTotalCost > @minimalPrice

    emptyButtonClicked: ->
      alert @vendor.get 'footer_empty_button'

    onRender: ->
      @stickit()
      @workspaceDOM = @$('#kormapp-workspace').children().clone()
      unless @cart.isEmpty()
        @showCheckoutButton()