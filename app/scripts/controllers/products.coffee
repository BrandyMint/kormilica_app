define ['app', 'views/products/list'], (App, ProductsView) ->

  API = 
    listProducts: ->
      require ['collections/products'], (Products) =>
        products_data = [
          {id:1, price: '120', image_url: 'фывфю.jpg'}
          {id:2, price: '40', image_url: 'фывфю2.jpg'}
          {id:3, price: '90', image_url: 'фывфю3.jpg'}
        ]

        productsListCollection = new Products products_data
        productsListView = new ProductsView collection: productsListCollection
        App.mainRegion.show productsListView

  App.on 'products:list', ->
    API.listProducts()
