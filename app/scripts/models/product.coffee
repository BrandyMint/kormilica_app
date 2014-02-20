define ['underscore', 'backbone'], (_, Backbone) ->
  'use strict'

  class Product extends Backbone.Model
    urlRoot: "products"

    defaults:
      name:  'Пончик'