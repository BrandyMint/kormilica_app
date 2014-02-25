define ['app', 'controllers/cart'], (App) ->
  'use strict'

  class Profile extends Backbone.Model
    
    defaults:
      name:        ''
      phoneNumber: ''