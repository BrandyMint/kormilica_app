define ['app', 'marionette','templates/header/header'], (App, Marionette, template) ->

  class Header extends Marionette.ItemView
    template: template