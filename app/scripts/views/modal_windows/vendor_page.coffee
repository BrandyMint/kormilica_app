define ['templates/modal_windows/vendor_page', 'helpers/application_helpers'],
(template, Helpers) ->

  class VendorPageView extends Marionette.ItemView
    template: template
    templateHelpers: -> Helpers

    initialize: ({ @version, @user, @updateManager }) ->

    bindings:
      '.kormapp-vendor-title': 
        observe: 'mobile_subject'
        updateMethod: 'html'
      '.kormapp-vendor-description': 
        observe: 'mobile_description'
        updateMethod: 'html'
      '.kormapp-vendor-city':
        observe: 'city'
        onGet:   (val) ->
          "Город #{val}"

    serializeData: ->
      @lastUpdateAt =  @user.get('lastUpdateAt')

      if @lastUpdateAt?
        @lastUpdateAt = (new Date @lastUpdateAt).toLocaleDateString()
      else
        @lastUpdateAt = '???'

      version: @version
      lastUpdateAt: @lastUpdateAt

    ui:
      closeButton:  '.kormapp-modal-button'
      updateButton: '.kormapp-app-update'

    events:
      'click @ui.updateButton': '_update'
      'click': 'close'

    _update: =>
      @updateManager.perform true

    _setScrollableAreaHeight: ->
      container =   $('.kormapp-modal-window')
      vendorTitleHeight = $('.kormapp-vendor-title').outerHeight true
      vendorDescription = $('.kormapp-vendor-description')
      bottomButtonHeight = $('.kormapp-modal-button').outerHeight true

      scrollableHeight = container.height() - vendorTitleHeight - bottomButtonHeight
      vendorDescription.css 'height', scrollableHeight

    onShow: ->
      @_setScrollableAreaHeight()

    onRender: ->
      @stickit()
