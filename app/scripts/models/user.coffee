define ->
  'use strict'

  class User extends Backbone.Model
    localStorage: new Backbone.LocalStorage 'users'

    # id нужен, чтобы можно было найти модель из localStorage
    defaults:
      id:           1
      address:      ''
      phone:        ''
      name:         ''
      lastUpdateAt: null

    # TODO Валидация
    isAllFieldsFilled: ->
      true if @get('address') and @get('phone')
