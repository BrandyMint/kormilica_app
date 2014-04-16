define ['templates/modal_windows/check_contacts', 'helpers/application_helpers'],
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
      '#kormapp-address':
        observe: 'address'
      '#kormapp-phone':
        observe: 'phone'
        onSet: (val) ->
          @phone = val.replace(/\D/g, '')
          @phone

    ui:
      form:                   'form'
      backButton:             '.kormapp-check-header a'
      deliveryButton:         '.kormapp-delivery a'
      deliveryButtonContent:  '.kormapp-delivery-button'
      inactiveDeliveryButton: '.kormapp-delivery-inactive a'
      content:                '@kormapp-modal-content'

    events:
      'click @ui.deliveryButton': 'addOrder'
      'click @ui.inactiveDeliveryButton': 'showErrors'
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
      #$(@ui.form).find("input").filter( ->
        #return $.trim( $(@).val().length ) < 1
      #).length == 0
       @model.get('phone')?.toString().length >= @phoneLength &&
         @model.get('address')?.toString().length >= @addressLength

    manageButtons: (model) ->
      if @validate()
        @activateDeliveryButton()
      else
        @deactivateDeliveryButton()

    deactivateDeliveryButton: =>
      button = @$el.find('.kormapp-delivery')
      button.removeClass('kormapp-delivery').addClass('kormapp-delivery-inactive')

    activateDeliveryButton: =>
      button = @$el.find('.kormapp-delivery-inactive')
      button.removeClass('kormapp-delivery-inactive').addClass('kormapp-delivery')
      $(@ui.deliveryButtonContent).html 'ДОСТАВИТЬ ЗАКАЗ'

    onShow: ->
      @manageButtons()

    onRender: ->
      @stickit()

      @stickit @vendor,
        'label[for="address"]':
          observe: 'city'
          onGet:   (val) -> "Ваш адрес (#{val})"
