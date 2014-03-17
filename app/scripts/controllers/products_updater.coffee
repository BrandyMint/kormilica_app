define ->

  class ProductsUpdaterController extends Marionette.Controller

    initialize: ({ @url, @cart, @products, @vendor }) ->
      @VENDOR_KEY = @vendor.get 'key'

      @listenTo @products, 'reset', ->
        console.log 'Коллекция продуктов обновлена', @products

      $.ajax
        url: @url
        headers:
          'X-Vendor-Key': @VENDOR_KEY
        success: (data) =>
          console.log 'От сервера получен список продуктов', data.products
          @_overrideProductsCollection data.products
        error: ->
          console.log 'Ошибка получения списка продуктов с сервера'

    _overrideProductsCollection: (receivedProducts) ->
      @products.reset receivedProducts