define ->
  class Profile extends Backbone.Model
    localStorage: new Backbone.LocalStorage 'profile'

    defaults:
      id: 1

    initialize: ->
      @on 'change', => @save()
