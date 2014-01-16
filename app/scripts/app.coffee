define ['jquery', 'backbone', 'models/test', 'views/test'], ($, Backbone, TestModel, TestView) ->
  class App
    initialize: ->
      console.log 'app starting...'

      model = new TestModel()
      view = new TestView(model: model)
      
      $('.backbone-container').html view.render().el
      
      Backbone.history.start()
