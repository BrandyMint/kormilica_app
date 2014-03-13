define ['templates/modal_windows/vendor_page', 'helpers/application_helpers'],
(template, Helpers) ->

  class VendorPageView extends Marionette.ItemView
    template: template
    templateHelpers: -> Helpers

    ui:
      closeButton: '.kormapp-modal-button'

    events:
      'click @ui.closeButton': 'close'