/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/profile',[],function() {
    'use strict';
    var Profile, _ref;
    return Profile = (function(_super) {
      __extends(Profile, _super);

      function Profile() {
        _ref = Profile.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Profile.prototype.initialize = function() {
        this.localStorage = new Backbone.LocalStorage('profiles');
        return this.on('change', function() {
          return this.save();
        });
      };

      Profile.prototype.defaults = {
        id: 1,
        address: '',
        phone: '',
        name: ''
      };

      Profile.prototype.isAllFieldsFilled = function() {
        if (this.get('address') && this.get('phone')) {
          return true;
        }
      };

      return Profile;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/vendor',[],function() {
    var Vendor, _ref;
    return Vendor = (function(_super) {
      __extends(Vendor, _super);

      function Vendor() {
        _ref = Vendor.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Vendor.prototype.defaults = {
        key: '!PREDEFINED_KEY',
        mobile_title: 'Доставка<br>пончиков',
        mobile_logo_url: 'images/logo.png',
        mobile_subject: 'Доставка пончиков "От Геннадия"',
        mobile_description: 'Мы доставляем быстро, минимальная стоимость заказа от 500 руб.',
        mobile_footer: 'Выберите блюдо на заказ.',
        mobile_delivery: 'Доставка бесплатно от 500 руб.'
      };

      return Vendor;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  define('templates/modal_windows/quantity_selector',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $c, $e, $o;
        $e = function(text, escape) {
          return ("" + text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/\//g, '&#47;').replace(/"/g, '&quot;');
        };
        $c = function(text) {
          switch (text) {
            case null:
            case void 0:
              return '';
            case true:
            case false:
              return '' + text;
            default:
              return text;
          }
        };
        $o = [];
        $o.push("<div class='modal-wrapper'>\n  <div class='dark-background'></div>\n  <div class='modal-window'>\n    <div class='column full'>\n      <div class='quantity-title'>Введите количество</div>\n      <table class='quantity-table'>\n        <tr>\n          <td>\n            <p class='price'>\n              <span class='price-font'>" + ($c(this.money(this.product.get('price')))) + "</span>\n              р.\n            </p>\n          </td>\n          <td>\n            <p class='multiplier'>x\n              <span class='multiplier-font quantity'>" + ($e($c(this.quantity))) + "</span>\n              \=\n            </p>\n          </td>\n          <td>\n            <p class='price result'>" + ($c(this.money(this.total_cost))) + "</p>\n          </td>\n        </tr>\n      </table>\n      <div class='quantity-selector'>\n        <a id='plus-sign' href='#'>+</a>\n        <span class='quantity'>" + this.quantity + "</span>\n        шт\n        <a id='minus-sign' href='#'>-</a>\n      </div>\n      <a class='button' href='#'>\n        <span>ГОТОВО</span>\n      </a>\n    </div>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  define('helpers/application_helpers',[],function() {
    return {
      ficon: function(name, attrs) {
        return "<i class='fontello-icon-" + name + "'></i>";
      },
      badge: function(text, type) {
        return "<span class=\"badge badge-" + (type ? type : "default") + "\">" + text + "</span>";
      },
      truncate: function(string, size) {
        var new_string, words_array;
        if (size == null) {
          size = 100;
        }
        if (string.length < size) {
          return string;
        }
        words_array = $.trim(string).substring(0, size).split(' ');
        new_string = words_array.join(" ") + "&hellip;";
        return new_string;
      },
      url: function(url_name) {
        return App.urls[url_name] || ("Неизвестный url_name " + url_name);
      },
      money: function(value) {
        return "<span class='price-font'>" + (value.cents / 100) + "</span> р.";
      },
      moneyWithoutCurrency: function(value) {
        return "" + (value.cents / 100);
      }
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/modal_windows/quantity_selector',['templates/modal_windows/quantity_selector', 'helpers/application_helpers'], function(template, Helpers) {
    var QuantitySelector, _ref;
    return QuantitySelector = (function(_super) {
      __extends(QuantitySelector, _super);

      function QuantitySelector() {
        _ref = QuantitySelector.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      QuantitySelector.prototype.template = template;

      QuantitySelector.prototype.templateHelpers = function() {
        return Helpers;
      };

      QuantitySelector.prototype.ui = {
        plusButton: '#plus-sign',
        minusButton: '#minus-sign',
        confirmButton: '.button',
        quantity: '.quantity',
        result: '.result',
        outside: '.dark-background'
      };

      QuantitySelector.prototype.triggers = {
        'click @ui.outside': 'close'
      };

      QuantitySelector.prototype.events = {
        'click @ui.minusButton': 'decreaseQuantity',
        'click @ui.plusButton': 'increaseQuantity',
        'click @ui.confirmButton': 'confirmChanges'
      };

      QuantitySelector.prototype.serializeData = function() {
        return _.extend(this.model.toJSON(), {
          product: this.model.product
        });
      };

      QuantitySelector.prototype.decreaseQuantity = function(e) {
        e.preventDefault();
        if (!(this.model.get('quantity') < 1)) {
          this.model.set('quantity', this.model.get('quantity') - 1);
          return this._updateView();
        }
      };

      QuantitySelector.prototype.increaseQuantity = function(e) {
        e.preventDefault();
        this.model.set('quantity', this.model.get('quantity') + 1);
        return this._updateView();
      };

      QuantitySelector.prototype.confirmChanges = function(e) {
        e.preventDefault();
        return this.close();
      };

      QuantitySelector.prototype.onClose = function() {
        if (this.model.get('quantity') === 0) {
          return this.model.destroy();
        }
      };

      QuantitySelector.prototype._updateView = function() {
        $(this.ui.quantity).html(this.model.get('quantity'));
        return $(this.ui.result).html(Helpers.money(this.model.get('total_cost')));
      };

      return QuantitySelector;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/cart',['views/modal_windows/quantity_selector'], function(QuantitySelectorView) {
    var CartController, _ref;
    return CartController = (function(_super) {
      __extends(CartController, _super);

      function CartController() {
        this.productClick = __bind(this.productClick, this);
        _ref = CartController.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CartController.prototype.initialize = function(options) {
        var _this = this;
        this.vent = options.vent, this.modal = options.modal, this.cart = options.cart;
        this.vent.on('product:click', this.productClick);
        return this.vent.on('cart:clean order:created', function() {
          return _this.cleanCart();
        });
      };

      CartController.prototype.productClick = function(product) {
        var item;
        item = this.cart.items.itemOfProduct(product);
        if (item) {
          return this.modal.show(new QuantitySelectorView({
            model: item
          }));
        } else {
          return this.cart.addProduct(product);
        }
      };

      CartController.prototype.deleteItem = function(item) {
        return this.vent.trigger('cart:item:deleted');
      };

      CartController.prototype.cleanCart = function() {
        var model, _results;
        _results = [];
        while (model = this.cart.items.first()) {
          _results.push(model.destroy());
        }
        return _results;
      };

      return CartController;

    })(Marionette.Controller);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/cart_item',[],function() {
    'use strict';
    var CartItem, _ref;
    return CartItem = (function(_super) {
      __extends(CartItem, _super);

      function CartItem() {
        _ref = CartItem.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CartItem.prototype.defaults = {
        quantity: 1
      };

      CartItem.prototype.initialize = function() {
        this.product = window.App.products.get(this.get('product_id'));
        if (this.product != null) {
          this.set({
            product_title: this.product.get('title'),
            product_price: this.product.get('price')
          });
          this.on('change:quantity', this.updateTotalCost);
          return this.updateTotalCost();
        } else {
          return this.destroy();
        }
      };

      CartItem.prototype.updateTotalCost = function() {
        var cents;
        cents = this.product.get('price').cents * this.get('quantity');
        return this.set({
          total_cost: {
            cents: cents,
            currency: this.product.get('price').currency
          },
          total_cost_cents: cents
        });
      };

      return CartItem;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('collections/cart_items',['models/cart_item'], function(CartItem) {
    var CartItems, _ref;
    return CartItems = (function(_super) {
      __extends(CartItems, _super);

      function CartItems() {
        _ref = CartItems.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CartItems.prototype.url = 'cart';

      CartItems.prototype.model = CartItem;

      CartItems.prototype.initialize = function() {
        return this.localStorage = new Backbone.LocalStorage('cart_items');
      };

      CartItems.prototype.getTotalCost = function() {
        var addup;
        addup = function(memo, item) {
          return item.get('total_cost').cents + memo;
        };
        return {
          cents: this.reduce(addup, 0),
          currency: 'RUB'
        };
      };

      CartItems.prototype.getTotalCount = function() {
        var addup;
        addup = function(memo, item) {
          return item.get('quantity') + memo;
        };
        return this.reduce(addup, 0);
      };

      CartItems.prototype.isProductInCart = function(product) {
        return !!this.cartItem(product);
      };

      CartItems.prototype.itemOfProduct = function(product) {
        return this.findWhere({
          product_id: product.id
        });
      };

      return CartItems;

    })(Backbone.Collection);
  });

}).call(this);

(function() {
  define('templates/check/check',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $c, $o;
        $c = function(text) {
          switch (text) {
            case null:
            case void 0:
              return '';
            case true:
            case false:
              return '' + text;
            default:
              return text;
          }
        };
        $o = [];
        $o.push("<div id='check-top-external'>\n  <div class='center' id='check-top-internal'>\n    <div class='check-top-battlement'>\n      <div class='check-top-battlement-center'></div>\n    </div>\n    <div class='check-content'>\n      <div class='scrollable-check'>\n        <div class='check-header'>\n          <a href='#'>\n            <img src='images/back-button.png'>\n          </a>\n          <h2>Ваш чек</h2>\n        </div>\n        <div class='cart-items'></div>\n      </div>\n      <div class='unscrollable-check'>\n        <div class='clearfix row'>\n          <p class='all-product-sum'>Итог:\n            <span class='all-sum-right'>" + ($c(this.money(this.total_cost))) + "</span>\n          </p>\n        </div>\n        <form name='message\", method=>\"post'>\n          <section>\n            <label for='phone'>Телефон:</label>\n            <input id='phone' type='tel' name='phone' placeholder='+7(999)999-99-99'>\n            <label for='addrss'>Ваш адрес:</label>\n            <input id='name' type='text' name='address'>\n          </section>\n        </form>\n        <p class='form-comment'>\n          обязательно введите свой телефон для связи\n        </p>\n      </div>\n    </div>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  define('templates/check/check_cart_item',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $c, $e, $o;
        $e = function(text, escape) {
          return ("" + text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/\//g, '&#47;').replace(/"/g, '&quot;');
        };
        $c = function(text) {
          switch (text) {
            case null:
            case void 0:
              return '';
            case true:
            case false:
              return '' + text;
            default:
              return text;
          }
        };
        $o = [];
        $o.push("<p>" + ($e($c("Число. " + this.product_title))) + "</p>\n<table>\n  <tbody>\n    <tr>\n      <td class='product-amount'>");
        $o.push("        " + $c(this.moneyWithoutCurrency(this.product_price)));
        $o.push("        x");
        $o.push("        " + $e($c(this.quantity)));
        $o.push("      </td>\n      <td class='separator'>\n        <div></div>\n      </td>\n      <!-- / TODO Мультивалютность -->\n      <td class='product-price'>" + ($e($c("" + (this.moneyWithoutCurrency(this.total_cost)) + " р."))) + "</td>\n    </tr>\n  </tbody>\n</table>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/check/check_cart_item',['templates/check/check_cart_item', 'helpers/application_helpers'], function(checkCartItemViewTemplate, Helpers) {
    var CheckCartItemView, _ref;
    return CheckCartItemView = (function(_super) {
      __extends(CheckCartItemView, _super);

      function CheckCartItemView() {
        _ref = CheckCartItemView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CheckCartItemView.prototype.template = checkCartItemViewTemplate;

      CheckCartItemView.prototype.templateHelpers = function() {
        return Helpers;
      };

      return CheckCartItemView;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/check/check',['templates/check/check', 'views/check/check_cart_item', 'helpers/application_helpers'], function(template, CheckCartItemView, Helpers) {
    var Check, _ref;
    return Check = (function(_super) {
      __extends(Check, _super);

      function Check() {
        _ref = Check.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Check.prototype.template = template;

      Check.prototype.templateHelpers = function() {
        return Helpers;
      };

      Check.prototype.itemView = CheckCartItemView;

      Check.prototype.itemViewContainer = '.cart-items';

      Check.prototype.initialize = function(options) {
        this.cart = options.cart, this.profile = options.profile;
        this.collection = this.cart.items;
        return this.model = this.profile;
      };

      Check.prototype.bindings = {
        '#address': {
          observe: 'address'
        },
        '#phone': {
          observe: 'phone'
        }
      };

      Check.prototype.ui = {
        form: 'form',
        backButton: '.check-header a'
      };

      Check.prototype.triggers = {
        'click @ui.backButton': {
          event: 'cancel:button:clicked',
          preventDefault: true
        }
      };

      Check.prototype.serializeData = function() {
        return _.extend(this.cart.toJSON(), {
          items: this.cart.items.toJSON(),
          profile: this.profile
        });
      };

      Check.prototype._setScrollableAreaHeight = function() {
        var bottomInfo, container, itemsList, scrollableHeight;
        container = $('.check-content');
        bottomInfo = $('.unscrollable-check');
        itemsList = $('.scrollable-check');
        scrollableHeight = container.height() - bottomInfo.height();
        return itemsList.css('height', scrollableHeight);
      };

      Check.prototype.onShow = function() {
        return this._setScrollableAreaHeight();
      };

      Check.prototype.onRender = function() {
        return this.stickit();
      };

      return Check;

    })(Marionette.CompositeView);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/check',['views/check/check'], function(CheckView) {
    var CheckController, _ref;
    return CheckController = (function(_super) {
      __extends(CheckController, _super);

      function CheckController() {
        _ref = CheckController.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CheckController.prototype.initialize = function(options) {
        var _this = this;
        this.profile = options.profile, this.cart = options.cart, this.app = options.app;
        this.checkView = new CheckView({
          profile: this.profile,
          cart: this.cart
        });
        this.app.reqres.setHandler("form:data", function() {
          return _this.checkView.$el.find('form').serializeObject();
        });
        this.app.vent.on('checkout:clicked check:clicked', function() {
          _this.showCheck();
          return _this.app.vent.trigger('check:appeared');
        });
        this.app.vent.on('order:created', function() {
          _this.hideCheck();
          return _this.app.vent.trigger('check:disappeared');
        });
        this.checkView.on('check:form:empty:field', function() {
          return _this.app.vent.trigger('check:form:invalid');
        });
        this.checkView.on('check:form:filled', function() {
          return _this.app.vent.trigger('check:form:valid');
        });
        return this.checkView.on('cancel:button:clicked', function() {
          _this.app.vent.trigger('check:disappeared');
          return _this.hideCheck();
        });
      };

      CheckController.prototype.showCheck = function() {
        return this.app.checkRegion.show(this.checkView);
      };

      CheckController.prototype.hideCheck = function() {
        return this.app.checkRegion.close();
      };

      return CheckController;

    })(Marionette.Controller);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/product',['app'], function() {
    'use strict';
    var Product, _ref;
    return Product = (function(_super) {
      __extends(Product, _super);

      function Product() {
        _ref = Product.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Product.prototype.urlRoot = 'products';

      return Product;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('collections/products',['models/product'], function(Model) {
    var Products, _ref;
    return Products = (function(_super) {
      __extends(Products, _super);

      function Products() {
        _ref = Products.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Products.prototype.url = "products";

      Products.prototype.model = Model;

      return Products;

    })(Backbone.Collection);
  });

}).call(this);

(function() {
  define('templates/header/header_check',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<img src='images/header-check.png'>\n<p>ваш заказ на \n  <br>\n  <span id='amount'></span>\n</p>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/header/header_check',['templates/header/header_check', 'helpers/application_helpers'], function(template, Helpers) {
    var HeaderCheckView, _ref;
    return HeaderCheckView = (function(_super) {
      __extends(HeaderCheckView, _super);

      function HeaderCheckView() {
        this.bounce = __bind(this.bounce, this);
        this.itemRemoved = __bind(this.itemRemoved, this);
        this.clicked = __bind(this.clicked, this);
        _ref = HeaderCheckView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      HeaderCheckView.prototype.template = template;

      HeaderCheckView.prototype.templateHelpers = function() {
        return Helpers;
      };

      HeaderCheckView.prototype.initialize = function(options) {
        this.app = options.app, this.cart = options.cart;
        this.model = this.cart;
        return this.collection = this.cart.items;
      };

      HeaderCheckView.prototype.bindings = {
        '#amount': {
          observe: 'total_cost',
          updateMethod: 'html',
          onGet: function(value) {
            return Helpers.money(value);
          }
        }
      };

      HeaderCheckView.prototype.events = {
        'click': 'clicked'
      };

      HeaderCheckView.prototype.collectionEvents = {
        'add': 'itemAdded',
        'remove': 'itemRemoved'
      };

      HeaderCheckView.prototype.clicked = function() {
        return this.app.vent.trigger('check:clicked');
      };

      HeaderCheckView.prototype.itemAdded = function(val) {
        if (this.model.getNumberOfItems() === 1) {
          this.$el.show();
        }
        return this.bounce();
      };

      HeaderCheckView.prototype.itemRemoved = function() {
        if (this.model.isEmpty()) {
          return this.$el.hide();
        }
      };

      HeaderCheckView.prototype.bounce = function() {
        return this.$('img').effect('bounce', {
          times: 2
        }, 150);
      };

      HeaderCheckView.prototype.onRender = function() {
        return this.stickit();
      };

      return HeaderCheckView;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  define('templates/header/header',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<div class='clearfix row'>\n  <div class='column half' id='logo'>\n    <img src='images/logo.png'>\n    <p>Доставка <br> пончиков</p>\n  </div>\n  <div class='column half' id='check'></div>\n</div>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/header/header',['views/header/header_check', 'templates/header/header', 'helpers/application_helpers'], function(HeaderCheckView, template, Helpers) {
    var HeaderView, _ref;
    return HeaderView = (function(_super) {
      __extends(HeaderView, _super);

      function HeaderView() {
        _ref = HeaderView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      HeaderView.prototype.className = 'header';

      HeaderView.prototype.template = template;

      HeaderView.prototype.regions = {
        checkRegion: '#check'
      };

      HeaderView.prototype.initialize = function(options) {
        this.app = options.app, this.cart = options.cart;
        return this.checkView = new HeaderCheckView({
          app: this.app,
          cart: this.cart
        });
      };

      HeaderView.prototype.onShow = function() {
        return this.checkRegion.show(this.checkView);
      };

      return HeaderView;

    })(Marionette.Layout);
  });

}).call(this);

(function() {
  define('templates/products/product',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $c, $e, $o;
        $e = function(text, escape) {
          return ("" + text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/\//g, '&#47;').replace(/"/g, '&quot;');
        };
        $c = function(text) {
          switch (text) {
            case null:
            case void 0:
              return '';
            case true:
            case false:
              return '' + text;
            default:
              return text;
          }
        };
        $o = [];
        $o.push("<div class='clearfix row'>\n  <div class='column two-thirds'>\n    <img src='" + ($e($c(this.image.mobile_url))) + "'>\n    <p>" + ($e($c(this.title))) + "</p>\n    <p class='price'>" + ($c(this.money(this.price))) + "</p>\n  </div>\n  <div class='column one-thirds product-quantity'></div>\n</div>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  define('templates/products/button',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<a class='button' href='#777'>\n  <img src='images/to-bucket.png'>\n    <span>В ЗАКАЗ</span>\n</a>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  define('templates/products/button_added',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<a class='button in-order' href='#777'>\n  <img src='images/to-bucket-orange.png'>\n    <span>В ЗАКАЗE " + this.quantity + " шт</span>\n</a>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/products/product',['templates/products/product', 'templates/products/button', 'templates/products/button_added', 'helpers/application_helpers'], function(productTemplate, buttonTemplate, buttonAddedTemplate, Helpers) {
    var ProductView, _ref;
    return ProductView = (function(_super) {
      __extends(ProductView, _super);

      function ProductView() {
        this.showButton = __bind(this.showButton, this);
        this.cartChanged = __bind(this.cartChanged, this);
        _ref = ProductView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ProductView.prototype.templateHelpers = function() {
        return Helpers;
      };

      ProductView.prototype.template = productTemplate;

      ProductView.prototype.className = 'product-block';

      ProductView.prototype.ui = {
        'button': '.product-quantity'
      };

      ProductView.prototype.events = {
        'click': 'clicked'
      };

      ProductView.prototype.initialize = function(options) {
        this.app = options.app, this.cartItems = options.cartItems;
        this.listenTo(this.cartItems, 'add', this.cartChanged);
        return this.listenTo(this.cartItems, 'remove', this.cartChanged);
      };

      ProductView.prototype.clicked = function(e) {
        e.preventDefault();
        return this.app.vent.trigger('product:click', this.model);
      };

      ProductView.prototype.cartChanged = function(item) {
        if (item.get('product_id') === this.model.id) {
          return this.showButton();
        }
      };

      ProductView.prototype.showButton = function() {
        var item;
        if (item = window.App.cart.items.itemOfProduct(this.model)) {
          return this.ui.button.html(buttonAddedTemplate({
            quantity: item.get('quantity')
          }));
        } else {
          return this.ui.button.html(buttonTemplate());
        }
      };

      ProductView.prototype.onRender = function() {
        return this.showButton();
      };

      return ProductView;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/products/products',['views/products/product'], function(ProductView) {
    var ProductsView, _ref;
    return ProductsView = (function(_super) {
      __extends(ProductsView, _super);

      function ProductsView() {
        this.itemViewOptions = __bind(this.itemViewOptions, this);
        _ref = ProductsView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ProductsView.prototype.itemView = ProductView;

      ProductsView.prototype.initialize = function(options) {
        return this.app = options.app, options;
      };

      ProductsView.prototype.itemViewOptions = function() {
        return {
          app: this.app,
          cartItems: this.app.cart.items
        };
      };

      return ProductsView;

    })(Marionette.CollectionView);
  });

}).call(this);

(function() {
  define('templates/footer/footer',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<div class='clearfix row' id='check-bottom'></div>\n<div class='clearfix row' id='workspace'>\n  <div class='column delivery-discount full'>\n    <p>Выберите блюдо на заказ.</p>\n    <p class='free-delivery'>Доставка бесплатно от 500 руб.</p>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  define('templates/footer/_checkout',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<div class='column footer-content full'>\n  <a class='button checkout' href='#777'>ОФОРМИТЬ ЗАКАЗ</a>\n</div>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  define('templates/footer/_delivery',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $c, $e, $o;
        $e = function(text, escape) {
          return ("" + text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/\//g, '&#47;').replace(/"/g, '&quot;');
        };
        $c = function(text) {
          switch (text) {
            case null:
            case void 0:
              return '';
            case true:
            case false:
              return '' + text;
            default:
              return text;
          }
        };
        $o = [];
        $o.push("<div class='" + (['column', 'full', 'footer-content', "" + ($e($c(this.isAllFieldsFilled() === true ? 'delivery' : 'delivery-inactive')))].sort().join(' ').replace(/^\s+|\s+$/g, '')) + "'>\n  <a class='button' href='#777'>ДОСТАВИТЬ ЗАКАЗ</a>\n</div>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  define('templates/footer/_check_bottom',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<div class='column full'>\n  <div id='check-bottom-hidden'>\n    <div class='check-short-battlement'>\n      <div class='check-short-battlement-center'></div>\n    </div>\n    <div class='check-short-left'></div>\n    <div class='check-short-right'></div>\n    <div class='check-short-center'></div>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/footer/footer',['templates/footer/footer', 'templates/footer/_checkout', 'templates/footer/_delivery', 'templates/footer/_check_bottom'], function(template, checkoutButtonTemplate, deliveryButtonTemplate, checkBottomTemplate) {
    var Footer, _ref;
    return Footer = (function(_super) {
      __extends(Footer, _super);

      function Footer() {
        _ref = Footer.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Footer.prototype.template = template;

      Footer.prototype.initialize = function(options) {
        var _this = this;
        this.profile = options.profile, this.app = options.app, this.cart = options.cart;
        this.listenTo(this.profile, 'change:name change:phone', this.manageButtons);
        this.collection = this.cart.items;
        this.app.vent.on('check:appeared', function() {
          _this.showDeliveryButton();
          return _this.showCheckBottom();
        });
        this.app.vent.on('check:disappeared', function() {
          return _this.showCheckoutButton();
        });
        return this.app.vent.on('order:created', function() {
          return _this.hideButton();
        });
      };

      Footer.prototype.events = {
        'click a.checkout': 'showCheck',
        'click .delivery a': 'addOrder',
        'click .delivery-inactive a': 'showErrors'
      };

      Footer.prototype.collectionEvents = {
        'add': 'showCheckoutButton',
        'remove': 'hideButton'
      };

      Footer.prototype.manageButtons = function(model, value) {
        if (!!value) {
          return this.showDeliveryButton();
        } else {
          return this.deactivateDeliveryButton();
        }
      };

      Footer.prototype.showCheckoutButton = function() {
        return this.$('#workspace').html(checkoutButtonTemplate);
      };

      Footer.prototype.showDeliveryButton = function() {
        return this.$('#workspace').html(deliveryButtonTemplate(this.profile));
      };

      Footer.prototype.deactivateDeliveryButton = function() {
        var button;
        button = this.$('#workspace').find('.delivery');
        return button.removeClass('delivery').addClass('delivery-inactive');
      };

      Footer.prototype.activateDeliveryButton = function() {
        var button;
        button = this.$('#workspace').find('.delivery-inactive');
        return button.removeClass('delivery-inactive').addClass('delivery');
      };

      Footer.prototype.hideButton = function() {
        if (this.cart.isEmpty()) {
          this.$('#workspace').html(this.workspaceDOM);
          return this.$('#check-bottom').children().remove();
        }
      };

      Footer.prototype.showCheckBottom = function() {
        return this.$('#check-bottom').html(checkBottomTemplate);
      };

      Footer.prototype.showCheck = function(e) {
        e.preventDefault();
        this.showDeliveryButton();
        return this.trigger('checkout:clicked');
      };

      Footer.prototype.addOrder = function(e) {
        e.preventDefault();
        this.app.execute('order:create');
        return this.hideButton();
      };

      Footer.prototype.showErrors = function(e) {
        e.preventDefault();
        return alert('Заполните все поля');
      };

      Footer.prototype.onRender = function() {
        this.workspaceDOM = this.$('#workspace').children().clone();
        if (!this.cart.isEmpty()) {
          return this.showCheckoutButton();
        }
      };

      Footer.prototype.onClose = function() {
        return this.stopListening();
      };

      return Footer;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/footer',['views/footer/footer'], function(FooterView) {
    var FooterController, _ref;
    return FooterController = (function(_super) {
      __extends(FooterController, _super);

      function FooterController() {
        _ref = FooterController.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      FooterController.prototype.initialize = function(options) {
        var _this = this;
        this.cart = options.cart, this.app = options.app, this.profile = options.profile, this.vent = options.vent;
        this.footerView = new FooterView({
          app: this.app,
          cart: this.cart,
          profile: this.profile
        });
        this.showFooter();
        return this.footerView.on('checkout:clicked', function() {
          return _this.vent.trigger('checkout:clicked');
        });
      };

      FooterController.prototype.showFooter = function() {
        return this.app.footerRegion.show(this.footerView);
      };

      return FooterController;

    })(Marionette.Controller);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/order',[],function() {
    var Order, _ref;
    return Order = (function(_super) {
      __extends(Order, _super);

      function Order() {
        _ref = Order.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Order.prototype.url = 'http://api.aydamarket.ru/v1/orders.json';

      Order.prototype.sync = function(method, model, options) {
        options.headers = {
          'X-Vendor-Key': '467abe2e7d33e6455fe905e879fd36be'
        };
        return Backbone.sync(method, model, options);
      };

      return Order;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/order',['models/order'], function(Order) {
    var OrderController, _ref;
    return OrderController = (function(_super) {
      __extends(OrderController, _super);

      function OrderController() {
        this.createOrder = __bind(this.createOrder, this);
        _ref = OrderController.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      OrderController.prototype.initialize = function(options) {
        var _this = this;
        this.app = options.app, this.cart = options.cart, this.profile = options.profile;
        return this.app.commands.setHandler('order:create', function() {
          return _this.createOrder();
        });
      };

      OrderController.prototype.createOrder = function() {
        var order, orderOptions,
          _this = this;
        orderOptions = this.cart.toJSON();
        orderOptions.user = this.profile.toJSON();
        orderOptions.items = this._getFormattedCartItems();
        order = new Order(orderOptions);
        return order.save(null, {
          success: function(model, response) {
            var text, _ref1;
            if (((_ref1 = response.message) != null ? _ref1.text : void 0) != null) {
              text = response.message.text;
            } else {
              text = "Ваш заказ №" + response.id;
            }
            alert(text);
            return _this.app.vent.trigger('order:created', response);
          }
        });
      };

      OrderController.prototype._getFormattedCartItems = function() {
        var item, _i, _len, _ref1, _results;
        _ref1 = this.cart.items.toJSON();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          item = _ref1[_i];
          _results.push(item = {
            product_id: item.product_id,
            count: item.quantity,
            price: item.total_cost_cents
          });
        }
        return _results;
      };

      return OrderController;

    })(Marionette.Controller);
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/cart',['collections/cart_items'], function(CartItems) {
    'use strict';
    var Cart, _ref;
    return Cart = (function(_super) {
      __extends(Cart, _super);

      function Cart() {
        this.updateAggregators = __bind(this.updateAggregators, this);
        _ref = Cart.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Cart.prototype.initialize = function(options) {
        this.items = new CartItems();
        this.listenTo(this.items, 'add change remove', this.updateAggregators);
        return this.updateAggregators();
      };

      Cart.prototype.fetch = function() {
        return this.items.fetch();
      };

      Cart.prototype.updateAggregators = function() {
        var total_cost;
        total_cost = this.items.getTotalCost();
        return this.set({
          total_cost: total_cost,
          total_count: this.items.getTotalCount(),
          total_cost_cents: total_cost.cents
        });
      };

      Cart.prototype.isEmpty = function() {
        return this.items.length === 0;
      };

      Cart.prototype.getNumberOfItems = function() {
        return this.items.length;
      };

      Cart.prototype.changeQuantity = function(product, quantity) {
        var item;
        item = this.items.itemOfProduct(product);
        item.set('quantity', quantity);
        return item.save();
      };

      Cart.prototype.addProduct = function(product) {
        return this.items.create({
          product_id: product.id
        });
      };

      Cart.prototype.removeProduct = function(product) {
        var item;
        item = this.items.itemOfProduct(product);
        if (item != null) {
          return item.destroy();
        }
      };

      return Cart;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  define('controllers/modal',[],function() {
    var ModalController;
    return ModalController = (function() {
      function ModalController(options) {
        this.modalRegion = options.modalRegion;
      }

      ModalController.prototype.show = function(view) {
        view.on('onClose', this.hide);
        $('#app-container').addClass('modal-state');
        return this.modalRegion.show(view);
      };

      ModalController.prototype.hide = function() {
        $('#app-container').removeClass('modal-state');
        return this.modalRegion.close();
      };

      return ModalController;

    })();
  });

}).call(this);

(function() {
  define('app',['models/profile', 'models/vendor', 'controllers/cart', 'collections/cart_items', 'controllers/check', 'collections/products', 'views/header/header', 'views/products/products', 'controllers/footer', 'controllers/order', 'models/cart', 'controllers/modal'], function(Profile, Vendor, CartController, CartItems, CheckController, ProductsCollection, HeaderView, ProductsView, FooterController, OrderController, Cart, ModalController) {
    var App;
    App = new Marionette.Application;
    App.version = '0.1.1';
    App.addRegions({
      headerRegion: "#header-region",
      mainRegion: "#main-region",
      footerRegion: "#footer-region",
      checkRegion: "#check-region",
      modalRegion: "#modal-region"
    });
    App.modal = new ModalController({
      modalRegion: App.modalRegion
    });
    App.addInitializer(function(options) {
      var headerView, productsListView;
      App.vendor = new Vendor(options.vendor);
      App.categories = new Backbone.Collection(options.vendor.categories);
      App.products = new ProductsCollection(options.vendor.products);
      App.profile = new Profile;
      App.profile.fetch();
      App.cart = new Cart;
      App.cart.fetch();
      new CartController({
        vent: App.vent,
        cart: App.cart,
        modal: App.modal
      });
      new CheckController({
        app: App,
        profile: App.profile,
        cart: App.cart
      });
      new OrderController({
        app: App,
        cart: App.cart,
        profile: App.profile
      });
      productsListView = new ProductsView({
        app: App,
        collection: App.products
      });
      App.mainRegion.show(productsListView);
      headerView = new HeaderView({
        app: App,
        cart: App.cart
      });
      App.headerRegion.show(headerView);
      return new FooterController({
        app: App,
        cart: App.cart,
        profile: App.profile,
        vent: App.vent
      });
    });
    App.on('start', function() {
      return console.log('App starting....');
    });
    return App;
  });

}).call(this);

