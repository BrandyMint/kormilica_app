define ['helpers/application_helpers'], (Helpers) ->
  class Vendor extends Backbone.Model
    localStorage: new Backbone.LocalStorage 'vendors'
    defaults:
      key:                 '!PREDEFINED_KEY' 

      # Отражается в teamplates/header/header
      mobile_title:        'Доставка<br>пончиков'
      mobile_logo_url:     'kormapp/images/logo.png'

      # Отражается на странице О проекте
      mobile_subject:      'Доставка пончиков "От Геннадия"'
      mobile_description:  'Мы доставляем быстро, минимальная стоимость заказа от 500 руб.'

      # Отражается в templates/footer/footer
      mobile_footer:       'Выберите из списка блюдо на заказ.'
      mobile_delivery:     'Доставка бесплатно от 500 руб.'

      # Отображается при нажатии на "пустой кнопке"
      mobile_empty_cart_alert: 'Выберите из списка блюдо на заказ.'

      mobile_minimal_alert:  'Минимальный заказ от 500 руб.'

    minimal_alert: ->
      @get 'mobile_minimal_alert'

    isPriceValid: (cart) ->
      cart.get('total_cost').cents >= @get('minimal_price').cents
