define ['templates/header/header', 'helpers/application_helpers'],
(template, Helpers) ->

    class HeaderView extends Marionette.Layout

      className: 'header'
      template: template