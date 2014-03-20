define ['models/category'], (Category) ->

  class Categories extends Backbone.Collection
    model: Category
    localStorage: new Backbone.LocalStorage 'categories'
    save: -> @forEach (p) -> p.save()

