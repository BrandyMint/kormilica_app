define ['settings', 'helpers/application_helpers'], (Settings, Helpers) ->
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

      saved_total_cost = @cart.items.getTotalCost()
      @cart.items.each (ci) -> ci.initialize()
      new_total_cost = @cart.items.getTotalCost()

      if saved_total_cost.cents != new_total_cost.cents
        alert "Продавец изменил цены товаров.\nНовая стоимость корзины: #{Helpers.money_txt new_total_cost}"

    _headers: ->
      'X-Vendor-Key': @vendor.get('key') 
