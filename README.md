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
    
    
Обновление данных вендора
--------------------------

Скачать инициализационные данные в (`./app/scripts/data/bundle.coffee`). Сохраняются локально все картинки вендора и создать модуль с новыми путями

    grunt fetchBundle --vendor-key 467abe2e7d33e6455fe905e879fd36be # Ключ тестового вендора на продакшене

Загрузка данных вендора с кастомного api (полезно в develoment-е):

    grunt fetchBundle --vendor-key 98b118b9fa89e7aa8c18b0b43f7c178e --base-url http://api.3001.vkontraste.ru/v1/bundles.json

Добавляем ключ `-v` для более полной информации
    
Репозитории
------------

* cordova-мобильное приложение: https://github.com/BrandyMint/kormilica_cordova
* rails web: https://github.com/BrandyMint/kormilica

Версионирование:
-----------

    npm version patch  # Инкремент номера версии при релизе
    grunt version      # Обновление версии приложения из package и
                       # номера билда, а также устанавливается версия в bower.json (версия в
                       # package первична)

Документация
-----

* [Структура системы](https://docs.google.com/drawings/d/1byyyI0WgBEKYeN7blmk7f2t20GMzyzR1Gl8JfR-ApSk/edit?usp=sharing)

![draw](https://docs.google.com/drawings/d/1byyyI0WgBEKYeN7blmk7f2t20GMzyzR1Gl8JfR-ApSk/pub?w=795&amp;h=372)

