define ['jquery', 'backbone', 'marionette', 'models/test', 'views/test'], ($, Backbone, Marionette, TestModel, TestView) ->
  
  app = new Marionette.Application

  app.addInitializer ->
    console.log 'app starting...'
    model = new TestModel()
    view = new TestView(model: model)

    $('.backbone-container').html view.render().el

  app.on "initialize:after", ->
    Backbone.history.start()