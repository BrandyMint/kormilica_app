define ->
  'use strict'

  class Profile extends Backbone.Model

    initialize: ->
      @localStorage = new Backbone.LocalStorage 'profiles'

    # id нужен, чтобы можно было найти модель из localStorage
    defaults:
      id:          1
      name:        ''
      phone:       ''

    # TODO Валидация
    isAllFieldsFilled: ->
      true if @get('name') and @get('phone')
