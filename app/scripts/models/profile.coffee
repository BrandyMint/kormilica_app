define ['app', 'controllers/cart', 'backbone.localStorage'], (App) ->
  'use strict'

  class Profile extends Backbone.Model

    initialize: ->
      @localStorage = new Backbone.LocalStorage 'profiles'

    # id нужен, чтобы можно было найти модель из localStorage
    defaults:
      id:          1
      name:        ''
      phoneNumber: ''

    isAllFieldsFilled: ->
      true if @get('name') and @get('phoneNumber')