define ['app', 'views/header/header'], (App, View) ->

  API = 
    showHeader: ->
      view = new View
      App.headerRegion.show view

  App.on 'start', ->
    API.showHeader()