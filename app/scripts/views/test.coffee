define ['backbone', 'templates/test'], (Backbone, template) ->
  class TestView extends Backbone.View
    render: ->
      @$el.html template(@model.toJSON())
      @
