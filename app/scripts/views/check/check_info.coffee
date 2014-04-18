define ['templates/check/check_info', 'helpers/application_helpers'], 
(template, checkoutButtonTemplate, Helpers) ->

  class CheckInfo extends Marionette.ItemView
    template: template

    initialize: ({ @vendor }) ->
      @model = @vendor
      console.log @


    bindings:
      '@kormapp-check-offer':
        observe:      'mobile_footer'
        updateMethod: 'html'
      '@kormapp-check-free-delivery':
        observe:      'mobile_delivery'
        updateMethod: 'html'

    onRender: ->
      @stickit()
