define ->

  class Order extends Backbone.Model

    sync: (method, model, options) ->
      options.headers = 'X-Vendor-Key': '467abe2e7d33e6455fe905e879fd36be'
      Backbone.sync method, model, options