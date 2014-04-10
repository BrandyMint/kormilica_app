Кормилица App
=============

[![Build Status](http://jenkins.icfdev.ru/buildStatus/icon?job=kormilica_app)](http://jenkins.icfdev.ru/job/kormilica_app/)


DOM
---

![draw](https://docs.google.com/drawings/d/1Js4xmqWnLdcpKFa8283te9hpe5K82jmVX5DwOW2A_os/pub?w=895)



CI
--

* [jenkins](http://jenkins.icfdev.ru/job/kormilica_app/) - тесты и деплой на http://brandymint.github.io/kormilica_app/
* [teamticy](http://teamcity.brandymint.ru/viewType.html?buildTypeId=Kormilica_BuildAndUpload) - билд под мобильные платформы


Development
-----------

    npm install
    bower install
    grunt server

Для очистки корзины в консоли вводим

    App.vent.trigger('cart:clean')

Перенеправление запросов на локальный api-сервер:

    window.kormapp_api_url = 'http://api.3001.vkontraste.ru'

Обновление данных из приложения:

    window.KormApp.updateManager.perform()
    
Локальный билд
--------------

Первым делом

    utils/build_all

Под конкретную платформу

    utils/build_ios
    utils/build_android

Актуальные билды
----------------

Android:

* [последний билд с teamcity](http://icf.chebit.ru/android/Kormilica.apk)
* [Google Play](https://play.google.com/store/apps/details?id=com.brandymint.kormilica), [загрузка](https://play.google.com/apps/publish/?dev_acc=15071385602273245111#ApkPlace:p=com.brandymint.kormilica)
* [группа тестировщиков](https://plus.google.com/communities/111507310547613506785)


iOS:

* [testflight](https://www.testflightapp.com/dashboard/applications/1062985/builds/)

Обновление данных вендора
--------------------------

Скачать инициализационные данные в (`./app/scripts/data/bundle.coffee`). Сохраняются локально все картинки вендора и создать модуль с новыми путями

    grunt fetchBundle --vendor-key 467abe2e7d33e6455fe905e879fd36be # Ключ тестового вендора на продакшене

Загрузка данных вендора с кастомного api (полезно в develoment-е):

    grunt fetchBundle --vendor-key 98b118b9fa89e7aa8c18b0b43f7c178e --base-url http://api.3001.vkontraste.ru/v1/bundles.json

Добавляем ключ `-v` для более полной информации
    
Репозитории
------------

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


Деплой
======

Android
-------

Пароль на alias `kormilica_demo` - kormilica

    jarsigner -verbose  -sigalg SHA1withRSA -digestalg SHA1 ./Kormilica-release-unsigned.apk kormilica_demo
    zipalign -v 4 Kormilica-release-unsigned.apk Kormilica.apk


Обновление versionCode
----------------------

    grunt versionCode


Деплой
------

    http://icf.chebit.ru/android/
    lftp ftp://www:hjv,brb@icfdev.ru
