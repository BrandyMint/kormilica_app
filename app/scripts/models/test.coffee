define [
  'underscore'
  'backbone'
], (_, Backbone) ->
  'use strict';

  class TestModel extends Backbone.Model
    defaults:
      model_content: 'test model content'
