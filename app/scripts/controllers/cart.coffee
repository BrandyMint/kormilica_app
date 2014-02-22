define ['app', 'marionette', 'collections/cart'], (App, Marionette, Collection) ->

  class Controller extends Marionette.Controller

    initialize: ->
      @cart = new Collection
      App.profile.set 'cart', @cart

      App.vent.on 'cart:add', (product) =>
        @addToCart product

    addToCart: (product) ->
      @cart.add product
      @cart