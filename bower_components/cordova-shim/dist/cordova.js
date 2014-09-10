/*
 * cordova 3.0.0 desktop shim
 * v0.0.6
 *
 * Date: 10/20/2013
 */
(function ( window, factory ) {

  if ( typeof module === "object" && typeof module.exports === "object" ) {
    // Expose a cordova-making factory as module.exports in loaders that implement the Node
    // module pattern (including browserify).
    // This accentuates the need for a real window in the environment
    // e.g. var cordova = require("cordova")(window);
    module.exports = function( w ) {
      w = w || window;
      if ( !w.document ) {
        throw new Error("cordova requires a window with a document");
      }
      return factory( w );
    };
  } else {
    factory( window );
  }

// Pass this, window may not be defined yet
}(this, function ( window ) {
  

  // Cordova core

  var cordova = {};

	// Connection API

  window.Connection = {
    UNKNOWN : "unknown",
    ETHERNET: "ethernet",
    WIFI    : "wifi",
    CELL_2G : "2g",
    CELL_3G : "3g",
    CELL_4G : "4g",
    NONE    : "none"
  };

  window.navigator.connection = {
    type: 'none'
  };

  function updateConnectionStatus() {
    var online = window.navigator.onLine;

    if (online) {
      window.navigator.connection.type = 'wifi';
    } else {
      window.navigator.connection.type = 'none';
    }
  }

  window.addEventListener("offline", updateConnectionStatus, false);
  window.addEventListener("online", updateConnectionStatus, false);

  updateConnectionStatus();



	// Geolocalisation API

  /* Methods to generate tracks */

  /**
   * Returns a random number between min and max.
   */
  function randomFromRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Returns a random integer between min and max.
   */
  function randomIntFromRange(min, max) {
    var randomFloat = randomFromRange(min, max);
    return parseInt(randomFloat, 10);
  }

  /**
   * Generate a range with the value and a percentage and
   * returns a random number from the range.
   */
  function randomFromPercentage(value, percentage) {
    return randomFromRange(
      value * (1 - percentage),
      value * (1 + percentage)
    );
  }

  function generateRandomPosition() {
    var longitude = Math.random() * Math.PI * 2;
    var latitude = Math.acos(Math.random() * 2 - 1);

    // random speed in meters/seconds
    var speed = randomFromRange(5, 100) / 3.6;

    // random altitude in meters
    var altitude = randomFromRange(10, 1000);

    return {
      coords: {
        latitude        : latitude,
        longitude       : longitude,
        altitude        : altitude,
        accuracy        : randomFromRange(10, 200),
        altitudeAccuracy: randomFromRange(10, 200),
        heading         : null,
        speed           : speed
      },
      timestamp: Date.now()
    };
  }

  function generateLocation(longitude, latitude, radius) {
    // Convert radius from meters to degrees
    var radiusInDegrees = radius / 111300;

    var u = Math.random();
    var v = Math.random();
    var w = radiusInDegrees * Math.sqrt(u);
    var t = 2 * Math.PI * v;
    var x = w * Math.cos(t);
    var y = w * Math.sin(t);

    // Adjust the x-coordinate for the shrinking of the east-west distances
    var new_x = x / Math.cos(latitude);

    var randomLongitude = new_x + longitude;
    var randomLatitude = y + latitude;

    return {
      longitude: randomLongitude,
      latitude : randomLatitude
    };
  }

  function generatePosition(previousPoint) {
    // generate a speed from the previous with 20% more or less
    var speed = randomFromPercentage(previousPoint.coords.speed, 0.2);

    // generate an altitude from the previous with 10% more or less
    var altitude = randomFromPercentage(previousPoint.coords.altitude, 0.1);

    var now = Date.now();

    // time in seconds
    var duration = (now - previousPoint.timestamp) / 1000;
    var distance = speed * duration;

    // from the speed, we can have a distance
    // with that distance, we can have circle around the point
    // we just have to pick one
    var location = generateLocation(
      previousPoint.coords.longitude,
      previousPoint.coords.latitude,
      distance
    );

    return {
      coords: {
        latitude        : location.latitude,
        longitude       : location.longitude,
        altitude        : altitude,
        accuracy        : randomFromRange(10, 200),
        altitudeAccuracy: randomFromRange(10, 200),
        heading         : null,
        speed           : speed
      },
      timestamp: now
    };
  }

  /* API */

  window.PositionError = function() {};
  window.PositionError.PERMISSION_DENIED = 1;
  window.PositionError.POSITION_UNAVAILABLE = 2;
  window.PositionError.TIMEOUT = 3;

  function getRandomError() {
    var code = randomIntFromRange(1, 3);
    return {
      code: code,
      message: null
    };
  }

  function generateError(chance) {
    if (chance === null) {
      chance = 30; // change to have an error
    }
    var percentage = randomFromRange(0, 100);

    //no error
    if (percentage > chance) {
      return null;

    // generate error
    } else {
      return getRandomError();
    }
  }

  navigator.geolocation.getCurrentPosition = function(geolocationSuccess, geolocationError, geolocationOptions) {
    setTimeout(function() {
      var position = generateRandomPosition();
      geolocationSuccess(position);
    }, 100);
  };

  navigator.geolocation.watchPosition = function(geolocationSuccess, geolocationError, geolocationOptions) {
    var position = generateRandomPosition();

    var timer = setInterval(function() {
      if (geolocationOptions.simulateErrors) {
        var error = generateError(geolocationOptions.errorChance);
        if (error) {
          return geolocationError(error);
        }
      }

      position = generatePosition(position);
      geolocationSuccess(position);
    }, 1000);

    return timer;
  };

  navigator.geolocation.clearWatch = function(timer) {
    clearInterval(timer);
  };



  // Notification API

  window.navigator.notification = {

    // http://docs.phonegap.com/en/3.0.0/cordova_notification_notification.md.html#notification.alert
    alert: function(content, callback) {
      alert(content);
      if (callback) {
        callback();
      }
    },

    // http://docs.phonegap.com/en/3.0.0/cordova_notification_notification.md.html#notification.confirm
    confirm: function(content, callback) {
      var result = confirm(content);
      if(result) {
        callback(2);
      } else {
        callback(1);
      }
    },

    // http://docs.phonegap.com/en/3.0.0/cordova_notification_notification.md.html#notification.prompt
    prompt: function(message, callback, title, buttonLabels, defaultText) {
      var result = prompt(message, defaultText);

      callback({
        buttonIndex: 1,
        input1     : result
      });
    },

    // http://docs.phonegap.com/en/3.0.0/cordova_notification_notification.md.html#notification.beep
    beep: function() {},

    // http://docs.phonegap.com/en/3.0.0/cordova_notification_notification.md.html#notification.vibrate
    vibrate: function() {}

  };



	// Notification API

	window.navigator.splashscreen = {

		// http://docs.phonegap.com/en/3.0.0/cordova_splashscreen_splashscreen.md.html#splashscreen.show
		show: function() {},

		// http://docs.phonegap.com/en/3.0.0/cordova_splashscreen_splashscreen.md.html#splashscreen.hide
		hide: function() {}

	};



  // Events API

  // keep the default method in memory
  var defaultAddEventListener = document.addEventListener;

  document.addEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();

    // http://docs.phonegap.com/en/3.0.0/cordova_events_events.md.html#deviceready
    // trigger right away device ready event
    if (e == 'deviceready') {
      handler.call(document, evt, capture);

    // http://docs.phonegap.com/en/3.0.0/cordova_events_events.md.html#online
    } else if (e == 'online') {
      window.addEventListener(e, handler, capture);

     // http://docs.phonegap.com/en/3.0.0/cordova_events_events.md.html#offline
    } else if (e == 'offline') {
      window.addEventListener(e, handler, capture);

    // any other event
    } else {
      defaultAddEventListener.call(document, evt, handler, capture);
    }
  };



  // expose cordova
  window.cordova = cordova;
  return cordova;
}));