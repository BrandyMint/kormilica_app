define ['templates/categories/category'],
(categoryTemplate) ->
  class CategoryView extends Marionette.ItemView
    template: categoryTemplate
    tagName: 'a'
    className: 'kormapp-category-item'
    activeClass: 'kormapp-category-item-active'
    triggers:
      'click': 'category:click'

    activate: ->
      @$el.addClass @activeClass

    deactivate: ->
      @$el.removeClass @activeClass
