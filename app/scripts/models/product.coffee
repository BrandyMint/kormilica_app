define ['app'], ->
  'use strict'

  class Product extends Backbone.Model
    urlRoot: 'products'

    defaults:
      title: 'Пончик'