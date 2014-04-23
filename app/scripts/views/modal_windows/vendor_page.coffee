define ['templates/modal_windows/vendor_page', 'helpers/application_helpers'],
(template, Helpers) ->

  class VendorPageView extends Marionette.ItemView
    template: template
    templateHelpers: -> Helpers

    initialize: ({ @version, @user, @updateManager }) ->

    ui:
      closeButton:  '@kormapp-modal-button'
      updateButton: '@kormapp-app-update'
      vendorDescription: '@kormapp-vendor-description'

    bindings:
      '@kormapp-vendor-title': 
        observe: 'mobile_subject'
        updateMethod: 'html'
      '@kormapp-vendor-description':
        observe: 'mobile_description'
        updateMethod: 'html'
      '@kormapp-vendor-city':
        observe: 'city'
        onGet:   (val) ->
          "#{val}"

    events:
      'click @ui.updateButton': '_update'
      'click': 'close'


    serializeData: ->
      @lastUpdateAt =  @user.get('lastUpdateAt')

      if @lastUpdateAt?
        @lastUpdateAt = (new Date @lastUpdateAt).toLocaleDateString()
      else
        @lastUpdateAt = '???'

      version: @version
      lastUpdateAt: @lastUpdateAt

    _update: =>
      @updateManager.perform(true) if @updateManager

    _setScrollableAreaHeight: ->
      scrollableHeight = @ui.closeButton.position().top - @ui.vendorDescription.position().top
      @ui.vendorDescription.css 'max-height', scrollableHeight

    onShow: ->
      @_setScrollableAreaHeight()

    onRender: ->
      @stickit()
