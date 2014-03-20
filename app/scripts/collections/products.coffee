define ['models/product'], (Product) ->

  class Products extends Backbone.Collection
    model: Product
    localStorage: new Backbone.LocalStorage 'products'
    save: -> @forEach (p) -> p.save()
