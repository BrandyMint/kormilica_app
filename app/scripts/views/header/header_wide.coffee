define ['views/header/header_narrow', 'views/header/top_check', 'templates/header/header_wide', 'helpers/application_helpers'],
(HeaderNarrowView, TopCheckView, template, Helpers) ->

    class HeaderWideView extends HeaderNarrowView
      template: template
