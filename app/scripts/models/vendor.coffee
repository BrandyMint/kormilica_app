define ->
  class Vendor extends Backbone.Model
    defaults:
      key:                 '!PREDEFINED_KEY' 

      # Отражается в teamplates/header/header
      mobile_title:        'Доставка<br>пончиков'
      mobile_logo_url:     'images/logo.png'      

      # Отражается на странице О проекте
      mobile_subject:      'Доставка пончиков "От Геннадия"'
      mobile_description:  'Мы доставляем быстро, минимальная стоимость заказа от 500 руб.'

      # Отражается в templates/footer/footer
      mobile_footer:       'Выберите из списка блюдо на заказ.'
      mobile_delivery:     'Доставка бесплатно от 500 руб.'

      # Отображается при нажатии на "пустой кнопке"
      footer_empty_button: 'Выберите из списка блюдо на заказ.'