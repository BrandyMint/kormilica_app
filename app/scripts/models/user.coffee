define ->
  'use strict'

  class User extends Backbone.Model

    initialize: ->
      @localStorage = new Backbone.LocalStorage 'users'

    # id нужен, чтобы можно было найти модель из localStorage
    defaults:
      id:          1
      address:     ''
      phone:       ''
      name:        ''

    # TODO Валидация
    isAllFieldsFilled: ->
      true if @get('address') and @get('phone')
