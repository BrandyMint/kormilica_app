define ['app', 'marionette', 'views/products/list'], (App, Marionette, ProductsView) ->

  class Controller extends Marionette.Controller

    initialize: ->
      @listProducts()

    listProducts: ->
      require ['collections/products'], (Products) =>
        products_data = [
          {id:1, title: 'Оригинальная глазурь', price: '120', image_url: 'images/donut_3.png'}
          {id:2, title: 'Классический пончик', price: '40', image_url: 'images/donut_1.png'}
          {id:6, title: 'Шоколадная глазурь', price: '90', image_url: 'images/donut_2.png'}
          {id:5, title: 'Классический пончик', price: '40', image_url: 'images/donut_1.png'}
          {id:4, title: 'Оригинальная глазурь', price: '120', image_url: 'images/donut_3.png'}
          {id:3, title: 'Шоколадная глазурь', price: '90', image_url: 'images/donut_2.png'}
        ]

        productsListCollection = new Products products_data
        productsListView = new ProductsView collection: productsListCollection

        productsListView.on 'itemview:cart:add', (childView) ->
          App.vent.trigger 'cart:add', childView.model

        App.mainRegion.show productsListView