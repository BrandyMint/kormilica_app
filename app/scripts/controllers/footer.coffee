define ['app', 'views/footer/footer'], (App, View) ->

  API = 
    showFooter: ->
      view = new View
      App.footerRegion.show view

  App.on 'start', ->
    API.showFooter()