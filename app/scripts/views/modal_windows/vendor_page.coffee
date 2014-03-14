define ['templates/modal_windows/vendor_page', 'helpers/application_helpers'],
(template, Helpers) ->

  class VendorPageView extends Marionette.ItemView
    template: template
    templateHelpers: -> Helpers

    bindings:
      '.kormapp-vendor-title': 
        observe: 'mobile_subject'
        updateMethod: 'html'
      '.kormapp-vendor-description': 
        observe: 'mobile_description'
        updateMethod: 'html'

    ui:
      closeButton: '.kormapp-modal-button'

    events:
      # 'click @ui.closeButton': 'close'
      'click': 'close'

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