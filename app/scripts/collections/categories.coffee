define ['models/category'], (Category) ->

  class Categories extends Backbone.Collection
    model: Category
    localStorage: new Backbone.LocalStorage 'categories'
    comparator: 'position'
    save: -> @forEach (p) -> p.save()
