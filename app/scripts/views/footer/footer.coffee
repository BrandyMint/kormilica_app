define ['templates/footer/footer', 'templates/footer/_checkout', 'helpers/application_helpers'], 
(template, checkoutButtonTemplate, Helpers) ->

  class Footer extends Marionette.ItemView
    template: template

    initialize: ({ @vent, @cart, @vendor }) ->
      @model = @vendor
      @collection = @cart.items

      @vent.on 'order:created', @hideButton

    bindings:
      '@kormapp-footer-offer':
        observe:      'mobile_footer'
        updateMethod: 'html'
      '@kormapp-free-delivery':
        observe:      'mobile_delivery'
        updateMethod: 'html'

    events:
      'click @kormapp-checkout':         'checkoutButtonClicked'
      'click @kormapp-delivery-discount': 'emptyButtonClicked'

    collectionEvents:
      'add':    'showCheckoutButton'
      'remove': 'hideButton'

    showCheckoutButton: ->
      @$('@kormapp-workspace').html checkoutButtonTemplate

    hideButton: =>
      if @cart.isEmpty()
        @$('@kormapp-workspace').html @workspaceDOM

    checkoutButtonClicked: (e) ->
      e.preventDefault()
      @vent.trigger 'checkout:clicked'

    emptyButtonClicked: ->
      window.navigator.notification.alert @vendor.get('mobile_empty_cart_alert'), null, 'Внимание'

    onRender: ->
      @stickit()
      @workspaceDOM = @$('@kormapp-workspace').children().clone()
      unless @cart.isEmpty()
        @showCheckoutButton()
