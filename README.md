Кормилица App
=============

Мобильное приложение (Yeoman-CoffeeScript-Sass-Haml-Backbone-RequireJS)

    git clone https://github.com/BrandyMint/webapp_template destination_dir
    cd destination_dir
    npm install
    bower install
    grunt server

Для очистки корзины в консоли вводим

    App.vent.trigger('cart:clean')

Скачать инициализационные данные

    curl http://api.aydamarket.ru/v1/vendors.json?vendor_key=467abe2e7d33e6455fe905e879fd36be > ./app/data/vendor.json

Сохранить локально все картинки вендора и создать модуль с новыми путями

    grunt fetchPics --vendor-key VENDOR_KEY