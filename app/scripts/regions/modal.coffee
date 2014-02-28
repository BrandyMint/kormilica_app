define ["marionette"], (Marionette) ->
  
  class ModalRegion extends Backbone.Marionette.Region
    open: (view) ->
      view.$el = view.$el.children()
      view.$el.unwrap()
      wrappedView = $('<div class="dark-background"></div').html view.$el
      @$el.html wrappedView