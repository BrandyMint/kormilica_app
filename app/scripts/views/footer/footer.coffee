define ['templates/footer/footer', 'templates/footer/_checkout'], 
(template, checkoutButtonTemplate) ->

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

    events:
      'click a.kormapp-checkout':         'showCheck'
      'click .kormapp-delivery-discount': 'emptyButtonClicked'

    collectionEvents:
      'add':    'showCheckoutButton'
      'remove': 'hideButton'

    showCheckoutButton: ->
      @$('#kormapp-workspace').html checkoutButtonTemplate

    hideButton: ->
      if @cart.isEmpty()
        @$('#kormapp-workspace').html @workspaceDOM

    showCheck: (e) ->
      e.preventDefault()
      @trigger 'checkout:clicked'

    emptyButtonClicked: ->
      alert @vendor.get 'footer_empty_button'

    onRender: ->
      @stickit()
      @workspaceDOM = @$('#kormapp-workspace').children().clone()
      unless @cart.isEmpty()
        @showCheckoutButton()