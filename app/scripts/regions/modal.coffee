define ["marionette"], (Marionette) ->
  
  class ModalRegion extends Backbone.Marionette.Region
    open: (view) ->
      view.$el = view.$el.children()
      view.$el.unwrap()
      wrappedView = $('<div class="modal-wrapper"></div').append('<div class="dark-background"></div>').append view.$el
      @$el.html wrappedView