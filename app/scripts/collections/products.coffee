define ['models/product'], (Model) ->
  'use strict'

  class Products extends Backbone.Collection
    url: "products"
    model: Model