define ['settings', 'helpers/application_helpers'], (Settings, Helpers) ->
  class ProductsUpdaterController extends Marionette.Controller

    initialize: ({ @user, @cart, @vendor, @categories, @products }) ->

    perform: ->
      $.ajax
        url: Settings.api_urls.bundles
        headers: @_headers()
        success: @_update
        error: (e) -> console.log 'Ошибка получения списка продуктов с сервера', e

    _update: (data) =>
      console.log 'От сервера получены данные для обновления', data
      @products.reset   data.products
      @products.save()

      @categories.reset data.categories

      @vendor.set       data.vendor
      @vendor.save()

      debugger
      @user.set 'lastUpdateAt', Date.now()
      @user.save()

      if @cart.reattachProductsFromCollection @products
        alert "Продавец изменил цены товаров.\nНовая стоимость корзины: #{Helpers.money_txt @cart.getTotalCost()}"

    _headers: ->
      'X-Vendor-Key': @vendor.get 'key'
