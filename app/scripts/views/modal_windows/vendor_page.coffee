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
          "#{val}"

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
      @updateManager.perform(true) if @updateManager

    _setScrollableAreaHeight: ->
      vendorDescription = $('.kormapp-vendor-description')
      scrollableHeight = $(window).height()/2
      vendorDescription.css 'max-height', scrollableHeight

    onShow: ->
      @_setScrollableAreaHeight()

    onRender: ->
      @stickit()
