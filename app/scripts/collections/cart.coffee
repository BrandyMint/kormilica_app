define ['models/product'], (Model) ->
  'use strict'

  class Cart extends Backbone.Collection
    model: Model