define ['templates/check/check_contacts', 'helpers/application_helpers'],
(template, Helpers) ->

  class CheckContactsView extends Marionette.ItemView
    template: template
    templateHelpers: -> Helpers
    phoneLength: 10
    addressLength: 10

    initialize: ({ @app, @user, @modal, @vendor }) ->
      @model = @user
      @app.vent.on 'order:failed', @activateDeliveryButton

    bindings:
      '@kormapp-address':
        observe: 'address'
      '@kormapp-phone':
        observe: 'phone'
        onSet: (val) ->
          @phone = val.replace(/\D/g, '')
          @phone

    ui:
      form:                   '@kormapp-contact-form'
      deliveryBlock:          '@kormapp-delivery-block'
      deliveryBlockInactive:  '@kormapp-delivery-block-inactive'
      deliveryButtonContent:  '@kormapp-delivery-button-content'
      content:                '@kormapp-modal-content'

    events:
      'click @ui.deliveryBlock': 'addOrder'
      'click @ui.deliveryBlockInactive': 'showErrors'
      'keyup @ui.form': 'manageButtons'
      # ios screen position fixes:
      'click': 'clickAnywhere'
      'click @ui.form, click @ui.content': 'stopEvent'

    serializeData: ->
      _.extend @user.toJSON()

    stopEvent: (e) ->
      e.stopPropagation()

    clickAnywhere: ->
      @adjustScreen()
      @close()

    adjustScreen: (callback) ->
      setTimeout(( ->
        $('body').scrollTop(0)
      ), 100)

    addOrder: (e) ->
      e.stopPropagation()
      @user.save()
      $(@ui.deliveryButtonContent).html 'ОТПРАВЛЯЕМ...'
      @deactivateDeliveryButton()
      @app.vent.trigger 'order:checkout'

    showErrors: (e) ->
      e.preventDefault()
      window.navigator.notification.alert 'Впишите телефон и адрес доставки', null, 'Внимание'

    validate: (e) ->
      @model.get('phone')?.toString().length >= @phoneLength &&
        @model.get('address')?.toString().length >= @addressLength

    manageButtons: (model) ->
      if @validate()
        @activateDeliveryButton()
      else
        @deactivateDeliveryButton()

    deactivateDeliveryButton: =>
      @ui.deliveryBlock.hide()
      @ui.deliveryBlockInactive.show()

    activateDeliveryButton: =>
      @ui.deliveryBlock.show()
      @ui.deliveryBlockInactive.hide()

    onShow: ->
      @manageButtons()

    onRender: ->
      @ui.deliveryBlock.hide()
      @ui.deliveryBlockInactive.show()
      @stickit()
      @stickit @vendor,
        '@kormapp-address-label':
          observe: 'city'
          onGet:   (val) -> "Ваш адрес (#{val})"
