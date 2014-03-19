define ['settings'], (Settings) ->
  class ProductsUpdaterController extends Marionette.Controller

    initialize: ({ @vent, @cart, @vendor, @categories, @products }) ->

    perform: ->
      $.ajax
        url: Settings.api_urls.bundles
        headers: @_headers()
        success: @_update
        error: (e) -> console.log 'Ошибка получения списка продуктов с сервера', e

    _update: (data) =>
      console.log 'От сервера получены данные для обновления', data
      @products.reset   data.products
      @categories.reset data.categories
      @vendor.set       data.vendor

    _headers: ->
      'X-Vendor-Key': @vendor.get('key') 
