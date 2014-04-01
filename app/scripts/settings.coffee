define ->

  default_api_url = 'http://api.aydamarket.ru'

  api_url = ->
    window.kormapp_api_url || default_api_url

  routes:
    bundles_url: ->
      api_url() + '/v1/bundles.json'
    orders_url:  ->
      api_url() + '/v1/orders.json'
