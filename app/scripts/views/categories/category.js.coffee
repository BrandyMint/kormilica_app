define ['templates/categories/category'],
(categoryTemplate) ->
  class CategoryView extends Marionette.ItemView
    template: categoryTemplate
    triggers:
      'click': 'category:click'
