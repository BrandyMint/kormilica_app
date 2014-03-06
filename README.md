Кормилица App

Мобильное приложение (Yeoman-CoffeeScript-Sass-Haml-Backbone-RequireJS)

    git clone https://github.com/BrandyMint/webapp_template destination_dir
    cd destination_dir
    npm install
    bower install
    grunt server

Для очистки корзины в консоли вводим

    App.vent.trigger('cart:clean')
