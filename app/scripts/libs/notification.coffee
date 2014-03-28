# Usage
#unless window.navigator?.notification?
  #require ['notification'], (Notification) ->
    #window.navigator = {} unless window.navigator?
    #window.navigator.notification = Notification

define ->
  # Интерфейс: https://github.com/apache/cordova-plugin-dialogs/blob/master/www/notification.js
  Notification = 
    alert: (message, completeCallback, title, buttonLabel) ->
      window.alert message
      completeCallback?.call @

    confirm: (message, resultCallback, title, buttonLabels) ->
      res = window.confirm message
      resultCallback?.call @, res
      res

  return Notification
