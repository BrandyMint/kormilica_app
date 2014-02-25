define ['backbone'], (Backbone) ->
  'use strict'

  class Profile extends Backbone.Model
    
    defaults:
      name:        ''
      phoneNumber: ''