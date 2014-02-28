define ['app', 'marionette', 'templates/modal_windows/quantity_selector'], (App, Marionette, template) ->

  class QuantitySelector extends Marionette.ItemView
    template: template