define ['underscore', 'backbone', 'models/product'], (_, Backbone, Model) ->
  'use strict'

  class Products extends Backbone.Collection
    url: "products"

    model: Model