define ['settings', 'helpers/application_helpers'], (Settings, Helpers) ->
  class ProductsUpdaterController extends Marionette.Controller

    initialize: ({ @profile, @user, @cart, @vendor, @categories, @products }) ->

    perform: (interactive) =>
      console.log 'update data'
      $.ajax
        url: Settings.routes.bundles_url()
        headers: @_headers()
        success: (data) =>
          console.log 'update success'
          if interactive
            window.navigator.notification.alert "Обновлено продуктов: #{data?.products?.length}", null, 'Внимание'
          @_update data
        error: (e) => 
          console.log 'update error', e
          if interactive
            window.navigator.notification.alert "Ошибка обновления списка продуктов", null, 'Внимание'
          else
            console.log 'Ошибка получения списка продуктов с сервера', e

    _update: (data) =>
      console.log 'От сервера получены данные для обновления', data
      @products.reset   data.products
      @products.save()

      @categories.reset data.categories
      unless @categories.get(@profile.get('currentCategory'))
        @profile.set('currentCategory', @categories.first().id)

      @vendor.set       data.vendor
      @vendor.save()

      @user.set 'lastUpdateAt', Date.now()
      @user.save()

      if @cart.reattachProductsFromCollection @products
        window.navigator.notification.alert "Продавец изменил цены товаров.\nНовая стоимость корзины: #{Helpers.money_txt @cart.getTotalCost()}"

    _headers: ->
      'X-Vendor-Key': @vendor.get 'key'
