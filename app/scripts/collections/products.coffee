define ['models/product'], (Model) ->

  class Products extends Backbone.Collection
    url: "products"
    model: Model