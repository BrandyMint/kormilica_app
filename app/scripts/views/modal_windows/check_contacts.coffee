define ['templates/modal_windows/check_contacts', 'helpers/application_helpers'],
(template, Helpers) ->

  class CheckContactsView extends Marionette.ItemView
    template: template
    templateHelpers: -> Helpers

    initialize: ({ @app, @user, @modal, @vendor }) ->
      @model = @user
      @app.vent.on 'order:failed', @activateDeliveryButton

    bindings:
      '#kormapp-address':
        observe: 'address'
      '#kormapp-phone':
        observe: 'phone'

    ui:
      form:                   'form'
      backButton:             '.kormapp-check-header a'
      deliveryButton:         '.kormapp-delivery a'
      deliveryButtonContent:  '.kormapp-delivery-button'
      inactiveDeliveryButton: '.kormapp-delivery-inactive a'
      outside:                '.kormapp-dark-background'

    events:
      'click @ui.deliveryButton': 'addOrder'
      'click @ui.inactiveDeliveryButton': 'showErrors'
      'keyup @ui.form': 'manageButtons'
      'click @ui.outside': 'close'
      # ios screen position fixes:
      #'click': 'adjustScreen'
      #'click @ui.form': 'stopEvent'

    serializeData: ->
      _.extend user: @user

    addOrder: (e) ->
      e.stopPropagation()
      @user.save()
      $(@ui.deliveryButtonContent).html 'ОТПРАВЛЯЕМ...'
      @deactivateDeliveryButton()
      @app.execute 'order:create'

    showErrors: (e) ->
      e.preventDefault()
      window.navigator.notification.alert 'Впишите телефон и адрес доставки', null, 'Внимание'

    validate: (e) ->
      $(@ui.form).find("input").filter( ->
        return $.trim( $(@).val().length ) < 1
      ).length == 0

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


