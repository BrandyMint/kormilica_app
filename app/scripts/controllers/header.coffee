define ['marionette', 'views/header/header'], (Marionette, HeaderView) ->

  class Controller extends Marionette.Controller

    initialize: (options) ->
      { @collection, @app } = options
      
      @headerView = @getHeaderView @collection
      @app.headerRegion.show @headerView

      @headerView.on 'check:clicked', ->
        @app.vent.trigger 'checkout:show'

      @app.vent.on 'checkout:show', =>
        @hideHeader()

      @app.vent.on 'check:disappeared', =>
        @showHeader()

    hideHeader: ->
      $('#app-container').addClass 'checkout-state'
      @app.headerRegion.close()
      delete @headerView

    showHeader: ->
      $('#app-container').removeClass 'checkout-state'
      @headerView = @getHeaderView @collection
      @app.headerRegion.show @headerView

    getHeaderView: (collection) ->
      new HeaderView
        app: @app
        collection: collection