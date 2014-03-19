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

  define('models/user',[],function() {
    'use strict';
    var User, _ref;
    return User = (function(_super) {
      __extends(User, _super);

      function User() {
        _ref = User.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      User.prototype.initialize = function() {
        return this.localStorage = new Backbone.LocalStorage('users');
      };

      User.prototype.defaults = {
        id: 1,
        address: '',
        phone: '',
        name: ''
      };

      User.prototype.isAllFieldsFilled = function() {
        if (this.get('address') && this.get('phone')) {
          return true;
        }
      };

      return User;

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
        mobile_logo_url: 'kormapp/images/logo.png',
        mobile_subject: 'Доставка пончиков "От Геннадия"',
        mobile_description: 'Мы доставляем быстро, минимальная стоимость заказа от 500 руб.',
        mobile_footer: 'Выберите из списка блюдо на заказ.',
        mobile_delivery: 'Доставка бесплатно от 500 руб.',
        footer_empty_button: 'Выберите из списка блюдо на заказ.'
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
        var $o;
        $o = [];
        $o.push("<div class='kormapp-modal-wrapper'>\n  <div class='kormapp-dark-background'></div>\n  <div class='kormapp-modal-window'>\n    <div class='full kormapp-column kormapp-modal-window-white'>\n      <div class='kormapp-quantity-title'>Введите количество</div>\n      <table class='kormapp-quantity-table'>\n        <tr>\n          <td>\n            <p class='kormapp-price'>\n              <span class='kormapp-quantity-price'></span>\n            </p>\n          </td>\n          <td>\n            <p class='kormapp-multiplier'>x\n              <span class='kormapp-multiplier-font kormapp-quantity'></span>\n              \=\n            </p>\n          </td>\n          <td>\n            <p class='kormapp-price kormapp-result'></p>\n          </td>\n        </tr>\n      </table>\n      <div class='kormapp-quantity-selector'>\n        <a id='kormapp-minus-sign' href='#'>-</a>\n        <span class='kormapp-quantity'>" + this.quantity + "</span>\n        шт\n        <a id='kormapp-plus-sign' href='#'>+</a>\n      </div>\n      <a class='kormapp-modal-button' href='#'>\n        <span class='kormapp-modal-button-text'>ГОТОВО</span>\n      </a>\n    </div>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
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
        return "<span class='kormapp-price-font'>" + (value.cents / 100) + "</span> р.";
      },
      money_txt: function(value) {
        return "" + (value.cents / 100) + " руб.";
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
        plusButton: '#kormapp-plus-sign',
        minusButton: '#kormapp-minus-sign',
        confirmButton: '.kormapp-modal-button',
        quantity: '.kormapp-quantity',
        result: '.kormapp-result',
        outside: '.kormapp-dark-background'
      };

      QuantitySelector.prototype.bindings = {
        '.kormapp-quantity': 'quantity',
        '.kormapp-result': {
          observe: 'total_cost',
          updateMethod: 'html',
          onGet: function() {
            return Helpers.money(this.model.get('total_cost'));
          }
        }
      };

      QuantitySelector.prototype.events = {
        'click @ui.minusButton': 'decreaseQuantity',
        'click @ui.plusButton': 'increaseQuantity',
        'click @ui.confirmButton': 'confirmChanges',
        'click @ui.outside': 'close'
      };

      QuantitySelector.prototype.decreaseQuantity = function(e) {
        e.preventDefault();
        if (!(this.model.get('quantity') < 1)) {
          return this.model.set('quantity', this.model.get('quantity') - 1);
        }
      };

      QuantitySelector.prototype.increaseQuantity = function(e) {
        e.preventDefault();
        return this.model.set('quantity', this.model.get('quantity') + 1);
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

      QuantitySelector.prototype.onRender = function() {
        this.stickit();
        return this.stickit(this.model.product, {
          '.kormapp-quantity-price': {
            observe: 'price',
            updateMethod: 'html',
            onGet: function() {
              return Helpers.money(this.model.product.get('price'));
            }
          }
        });
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
        return this.vent.on('order:created', function() {
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
        var _ref1;
        this.product = (_ref1 = this.collection) != null ? _ref1.app.products.get(this.get('product_id')) : void 0;
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

      CartItems.prototype.initialize = function(models, options) {
        this.localStorage = new Backbone.LocalStorage('cart_items');
        return this.app = options.app;
      };

      CartItems.prototype.getTotalCost = function() {
        var addup;
        addup = function(memo, item) {
          var _ref1;
          return (((_ref1 = item.get('total_cost')) != null ? _ref1.cents : void 0) || 0) + memo;
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
        $o.push("<div class='center' id='kormapp-check-external'>\n  <div id='kormapp-check-internal'>\n    <div class='kormapp-check-content'>\n      <div class='kormapp-scrollable-check'>\n        <div class='kormapp-check-header'>\n          <a class='kormapp-back-button-link' href='#'>\n            <span class='kormapp-back-button'></span>\n          </a>\n          <h2 class='kormapp-check-heading'>Ваш чек</h2>\n        </div>\n        <ol class='kormapp-cart-items'></ol>\n      </div>\n      <div class='kormapp-unscrollable-check'>\n        <div class='clearfix kormapp-row'>\n          <p class='kormapp-all-product-sum'>Итог:\n            <span class='kormapp-all-sum-right'>" + ($c(this.money(this.total_cost))) + "</span>\n          </p>\n        </div>\n        <form class='order-data' name='message\", method=>\"post'>\n          <section>\n            <label for='phone'>Телефон:</label>\n            <input id='kormapp-phone' type='tel' name='phone' placeholder='+7(999)999-99-99'>\n            <label for='address'>Ваш адрес:</label>\n            <input id='kormapp-address' type='text' name='address'>\n          </section>\n        </form>\n        <p class='kormapp-form-comment'>\n          обязательно введите свой телефон для связи\n        </p>\n      </div>\n    </div>\n  </div>\n  <div id='kormapp-check-bottom-container'>\n    <div id='kormapp-check-bottom'>\n      <div class='kormapp-check-short-left'></div>\n      <div class='kormapp-check-short-right'></div>\n      <div class='kormapp-check-short-center'></div>\n    </div>\n    <div class='full kormapp-check-button kormapp-delivery'>\n      <a class='kormapp-check-button-link' href='#777'>ДОСТАВИТЬ ЗАКАЗ</a>\n    </div>\n  </div>\n</div>");
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
        $o.push("<p class='kormapp-cartitem-name'>" + ($c(this.product_title)) + "</p>\n<table>\n  <tbody>\n    <tr>\n      <td class='kormapp-product-amount'>");
        $o.push("        " + $c(this.moneyWithoutCurrency(this.product_price)));
        $o.push("        x");
        $o.push("        " + $e($c(this.quantity)));
        $o.push("      </td>\n      <td class='kormapp-separator'>\n        <div class='separator-placeholder'></div>\n      </td>\n      <!-- / TODO Мультивалютность -->\n      <td class='kormapp-product-price'>" + ($e($c("" + (this.moneyWithoutCurrency(this.total_cost)) + " р."))) + "</td>\n    </tr>\n  </tbody>\n</table>");
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

      CheckCartItemView.prototype.tagName = 'li';

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

      Check.prototype.itemViewContainer = '.kormapp-cart-items';

      Check.prototype.initialize = function(options) {
        this.app = options.app, this.cart = options.cart, this.user = options.user;
        this.collection = this.cart.items;
        return this.model = this.user;
      };

      Check.prototype.bindings = {
        '#kormapp-address': {
          observe: 'address'
        },
        '#kormapp-phone': {
          observe: 'phone'
        }
      };

      Check.prototype.ui = {
        form: 'form',
        backButton: '.kormapp-check-header a',
        deliveryButton: '.kormapp-delivery a',
        inactiveDeliveryButton: '.kormapp-delivery-inactive a'
      };

      Check.prototype.events = {
        'click @ui.deliveryButton': 'addOrder',
        'click @ui.inactiveDeliveryButton': 'showErrors',
        'keyup @ui.form': 'manageButtons'
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
          user: this.user
        });
      };

      Check.prototype.addOrder = function(e) {
        this.user.save();
        return this.app.execute('order:create');
      };

      Check.prototype.showErrors = function(e) {
        e.preventDefault();
        return alert('Заполните все поля');
      };

      Check.prototype.checkForEmptyFields = function(e) {
        return $(this.ui.form).find("input").filter(function() {
          return $.trim($(this).val().length) < 1;
        }).length === 0;
      };

      Check.prototype.manageButtons = function(model) {
        if (this.checkForEmptyFields()) {
          return this.activateDeliveryButton();
        } else {
          return this.deactivateDeliveryButton();
        }
      };

      Check.prototype.deactivateDeliveryButton = function() {
        var button;
        button = this.$('#kormapp-check-bottom-container').find('.kormapp-delivery');
        return button.removeClass('kormapp-delivery').addClass('kormapp-delivery-inactive');
      };

      Check.prototype.activateDeliveryButton = function() {
        var button;
        button = this.$('#kormapp-check-bottom-container').find('.kormapp-delivery-inactive');
        return button.removeClass('kormapp-delivery-inactive').addClass('kormapp-delivery');
      };

      Check.prototype._setScrollableAreaHeight = function() {
        var bottomInfo, container, itemsList, scrollableHeight;
        container = $('.kormapp-check-content');
        bottomInfo = $('.kormapp-unscrollable-check');
        itemsList = $('.kormapp-scrollable-check');
        scrollableHeight = container.height() - bottomInfo.height();
        return itemsList.css('height', scrollableHeight);
      };

      Check.prototype.onShow = function() {
        this._setScrollableAreaHeight();
        return this.manageButtons();
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
        this.app = options.app, this.user = options.user, this.cart = options.cart;
        this.app.vent.on('checkout:clicked check:clicked', function() {
          return _this.showCheck();
        });
        return this.app.vent.on('order:created', function() {
          return _this.hideCheck();
        });
      };

      CheckController.prototype.showCheck = function() {
        var _this = this;
        this.checkView = new CheckView({
          app: this.app,
          user: this.user,
          cart: this.cart
        });
        this.checkView.on('cancel:button:clicked', function() {
          return _this.hideCheck();
        });
        return this.app.mainLayout.checkRegion.show(this.checkView);
      };

      CheckController.prototype.hideCheck = function() {
        return this.app.mainLayout.checkRegion.close();
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
  define('templates/header/top_check',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<div class='kormapp-top-check'>\n  <span class='kormapp-check-background-image'></span>\n  <img class='kormapp-check-image'>\n</div>\n<p class='kormapp-top-check-text'>ваш заказ на \n  <br>\n  <span id='kormapp-amount'></span>\n</p>");
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

  define('views/header/top_check',['templates/header/top_check', 'helpers/application_helpers'], function(template, Helpers) {
    var TopCheckView, _ref;
    return TopCheckView = (function(_super) {
      __extends(TopCheckView, _super);

      function TopCheckView() {
        this.showUp = __bind(this.showUp, this);
        this.bounce = __bind(this.bounce, this);
        this.itemRemoved = __bind(this.itemRemoved, this);
        this.clicked = __bind(this.clicked, this);
        _ref = TopCheckView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      TopCheckView.prototype.SLIDE_SPEED = 100;

      TopCheckView.prototype.BOUNCE_SPEED = 150;

      TopCheckView.prototype.template = template;

      TopCheckView.prototype.templateHelpers = function() {
        return Helpers;
      };

      TopCheckView.prototype.ui = {
        checkImage: '.kormapp-check-image'
      };

      TopCheckView.prototype.initialize = function(options) {
        this.app = options.app, this.cart = options.cart;
        this.model = this.cart;
        return this.collection = this.cart.items;
      };

      TopCheckView.prototype.bindings = {
        '#kormapp-amount': {
          observe: 'total_cost',
          updateMethod: 'html',
          onGet: function(value) {
            return Helpers.money(value);
          }
        }
      };

      TopCheckView.prototype.events = {
        'click': 'clicked'
      };

      TopCheckView.prototype.collectionEvents = {
        'add': 'itemAdded',
        'remove': 'itemRemoved'
      };

      TopCheckView.prototype.clicked = function() {
        return this.app.vent.trigger('check:clicked');
      };

      TopCheckView.prototype.itemAdded = function(val) {
        if (this.model.getNumberOfItems() === 1) {
          this.$el.show();
          return this.showUp();
        }
      };

      TopCheckView.prototype.itemRemoved = function() {
        return this._hideIfEmpty();
      };

      TopCheckView.prototype.bounce = function() {
        if (this.model.isEmpty()) {
          return;
        }
        if (!this.ui.checkImage.is(':visible')) {
          return;
        }
        return this.ui.checkImage.effect('bounce', {
          times: 1
        }, this.BOUNCE_SPEED);
      };

      TopCheckView.prototype.showUp = function() {
        return this.ui.checkImage.finish().css('margin-top', this.checkHeight + this.checkMarginTop).animate({
          marginTop: this.checkMarginTop
        }, this.SLIDE_SPEED).effect('bounce', {
          times: 1
        }, this.BOUNCE_SPEED);
      };

      TopCheckView.prototype._hideIfEmpty = function() {
        var _this = this;
        if (this.model.isEmpty()) {
          return this.ui.checkImage.finish().animate({
            marginTop: this.checkHeight + this.checkMarginTop
          }, this.SLIDE_SPEED, 'swing', function() {
            return _this.$el.fadeOut(_this.SLIDE_SPEED);
          });
        }
      };

      TopCheckView.prototype.onRender = function() {
        this.listenTo(this.model, 'change:total_cost_cents', this.bounce);
        this.checkHeight = 50;
        this.checkMarginTop = 0;
        if (this.model.isEmpty()) {
          this.$el.hide();
        }
        return this.stickit();
      };

      return TopCheckView;

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
        $o.push("<div class='clearfix kormapp-row'>\n  <div class='half kormapp-column' id='kormapp-logo'>\n    <div class='kormapp-logo-wrapper'>\n      <img class='kormapp-logo-image'>\n    </div>\n    <p class='kormapp-logo-text'></p>\n  </div>\n  <div class='half kormapp-column' id='kormapp-top-check'></div>\n</div>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/header/header',['views/header/top_check', 'templates/header/header', 'helpers/application_helpers'], function(TopCheckView, template, Helpers) {
    var HeaderView, _ref;
    return HeaderView = (function(_super) {
      __extends(HeaderView, _super);

      function HeaderView() {
        _ref = HeaderView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      HeaderView.prototype.className = 'kormapp-header row';

      HeaderView.prototype.template = template;

      HeaderView.prototype.regions = {
        checkRegion: '#kormapp-top-check'
      };

      HeaderView.prototype.bindings = {
        '.kormapp-logo-text': {
          observe: 'mobile_title',
          updateMethod: 'html'
        },
        '.kormapp-logo-image': {
          attributes: [
            {
              name: 'src',
              observe: 'mobile_logo_url'
            }
          ]
        }
      };

      HeaderView.prototype.ui = {
        logo: '#kormapp-logo'
      };

      HeaderView.prototype.triggers = {
        'click @ui.logo': 'logo:clicked'
      };

      HeaderView.prototype.initialize = function(_arg) {
        this.app = _arg.app, this.cart = _arg.cart, this.vendor = _arg.vendor;
        this.model = this.vendor;
        return this.checkView = new TopCheckView({
          app: this.app,
          cart: this.cart
        });
      };

      HeaderView.prototype.onShow = function() {
        return this.checkRegion.show(this.checkView);
      };

      HeaderView.prototype.onRender = function() {
        return this.stickit();
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
        $o.push("<div>\n  <img class='kormapp-product-image' src='" + ($e($c(this.image.mobile_url))) + "'>\n  <p class='kormapp-product-title'>" + ($e($c(this.title))) + "</p>\n  <p class='kormapp-product-in-list-price'>" + ($c(this.money(this.price))) + "</p>\n</div>\n<div class='kormapp-product-quantity'></div>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
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
        $o.push("<a class='kormapp-in-order kormapp-order-button' href='#777'>\n  <span class='kormapp-to-bucket kormapp-to-bucket-orange'></span>\n  <span class='kormapp-order-button-text'>\n    В ЗАКАЗE\n    <span class='kormapp-cart-item-quantity'></span>\n    шт\n  </span>\n</a>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/products/cart_button',['templates/products/button_added', 'helpers/application_helpers'], function(template) {
    var ProductView, _ref;
    return ProductView = (function(_super) {
      __extends(ProductView, _super);

      function ProductView() {
        _ref = ProductView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ProductView.prototype.template = template;

      ProductView.prototype.bindings = {
        '.kormapp-cart-item-quantity': 'quantity'
      };

      ProductView.prototype.onRender = function() {
        return this.stickit();
      };

      return ProductView;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  define('templates/products/empty_button',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<a class='kormapp-order-button' href='#777'>\n  <span class='kormapp-to-bucket kormapp-to-bucket-regular'></span>\n  <span class='kormapp-order-button-text'>В ЗАКАЗ</span>\n</a>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/products/empty_cart_button',['templates/products/empty_button'], function(template) {
    var EmptyCartButton, _ref;
    return EmptyCartButton = (function(_super) {
      __extends(EmptyCartButton, _super);

      function EmptyCartButton() {
        _ref = EmptyCartButton.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      EmptyCartButton.prototype.template = template;

      return EmptyCartButton;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/products/product',['templates/products/product', 'views/products/cart_button', 'views/products/empty_cart_button', 'helpers/application_helpers'], function(productTemplate, CartButton, EmptyCartButton, Helpers) {
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

      ProductView.prototype.className = 'kormapp-product-block';

      ProductView.prototype.events = {
        click: 'clicked'
      };

      ProductView.prototype.initialize = function(options) {
        this.app = options.app, this.cartItems = options.cartItems;
        return this.listenTo(this.cartItems, 'add remove', this.cartChanged);
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
        var item, view;
        if (item = this.app.cart.items.itemOfProduct(this.model)) {
          view = new CartButton({
            model: item
          });
        } else {
          view = new EmptyCartButton();
        }
        return this.buttonRegion.show(view);
      };

      ProductView.prototype.onRender = function() {
        this.buttonRegion = new Marionette.Region({
          el: this.$el.find('.kormapp-product-quantity')
        });
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
  define('templates/modal_windows/vendor_page',[],function() {
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
        $o.push("<div class='kormapp-modal-wrapper'>\n  <div class='kormapp-dark-background'></div>\n  <div class='kormapp-modal-window kormapp-modal-without-alignment'>\n    <div class='full kormapp-column'>\n      <h2 class='kormapp-vendor-title'></h2>\n      <div class='kormapp-vendor-description'></div>\n      <a class='kormapp-modal-button' href='#'>\n        <span class='kormapp-modal-button-text'>ЗАКРЫТЬ</span>\n      </a>\n    </div>\n    <div class='kormapp-app-version'>" + ($c(this.app.version)) + "</div>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/modal_windows/vendor_page',['templates/modal_windows/vendor_page', 'helpers/application_helpers'], function(template, Helpers) {
    var VendorPageView, _ref;
    return VendorPageView = (function(_super) {
      __extends(VendorPageView, _super);

      function VendorPageView() {
        _ref = VendorPageView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      VendorPageView.prototype.template = template;

      VendorPageView.prototype.templateHelpers = function() {
        return Helpers;
      };

      VendorPageView.prototype.initialize = function(_arg) {
        this.app = _arg.app;
      };

      VendorPageView.prototype.bindings = {
        '.kormapp-vendor-title': {
          observe: 'mobile_subject',
          updateMethod: 'html'
        },
        '.kormapp-vendor-description': {
          observe: 'mobile_description',
          updateMethod: 'html'
        }
      };

      VendorPageView.prototype.serializeData = function() {
        return {
          app: this.app
        };
      };

      VendorPageView.prototype.ui = {
        closeButton: '.kormapp-modal-button'
      };

      VendorPageView.prototype.events = {
        'click': 'close'
      };

      VendorPageView.prototype._setScrollableAreaHeight = function() {
        var bottomButtonHeight, container, scrollableHeight, vendorDescription, vendorTitleHeight;
        container = $('.kormapp-modal-window');
        vendorTitleHeight = $('.kormapp-vendor-title').outerHeight(true);
        vendorDescription = $('.kormapp-vendor-description');
        bottomButtonHeight = $('.kormapp-modal-button').outerHeight(true);
        scrollableHeight = container.height() - vendorTitleHeight - bottomButtonHeight;
        return vendorDescription.css('height', scrollableHeight);
      };

      VendorPageView.prototype.onShow = function() {
        return this._setScrollableAreaHeight();
      };

      VendorPageView.prototype.onRender = function() {
        return this.stickit();
      };

      return VendorPageView;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  define('templates/footer/footer',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<div class='clearfix kormapp-row' id='kormapp-workspace'>\n  <div class='full kormapp-column kormapp-delivery-discount'>\n    <p class='kormapp-footer-offer'></p>\n    <p class='kormapp-free-delivery'></p>\n  </div>\n</div>");
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
        $o.push("<div class='full kormapp-column kormapp-footer-content'>\n  <a class='kormapp-checkout' href='#777'>ОФОРМИТЬ ЗАКАЗ</a>\n</div>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/footer/footer',['templates/footer/footer', 'templates/footer/_checkout', 'helpers/application_helpers'], function(template, checkoutButtonTemplate, Helpers) {
    var Footer, _ref;
    return Footer = (function(_super) {
      __extends(Footer, _super);

      function Footer() {
        _ref = Footer.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Footer.prototype.template = template;

      Footer.prototype.initialize = function(_arg) {
        var _this = this;
        this.vent = _arg.vent, this.cart = _arg.cart, this.vendor = _arg.vendor;
        this.model = this.vendor;
        this.collection = this.cart.items;
        return this.vent.on('order:created', function() {
          return _this.hideButton();
        });
      };

      Footer.prototype.bindings = {
        '.kormapp-footer-offer': {
          observe: 'mobile_footer',
          updateMethod: 'html'
        },
        '.kormapp-free-delivery': {
          observe: 'mobile_delivery',
          updateMethod: 'html'
        }
      };

      Footer.prototype.events = {
        'click a.kormapp-checkout': 'showCheck',
        'click .kormapp-delivery-discount': 'emptyButtonClicked'
      };

      Footer.prototype.collectionEvents = {
        'add': 'showCheckoutButton',
        'remove': 'hideButton'
      };

      Footer.prototype.showCheckoutButton = function() {
        return this.$('#kormapp-workspace').html(checkoutButtonTemplate);
      };

      Footer.prototype.hideButton = function() {
        if (this.cart.isEmpty()) {
          return this.$('#kormapp-workspace').html(this.workspaceDOM);
        }
      };

      Footer.prototype.showCheck = function(e) {
        e.preventDefault();
        if (this._isGreaterThanMinimalPrice()) {
          return this.trigger('checkout:clicked');
        } else {
          return alert("Минимальный заказ от " + this.minimalPrice + " рублей");
        }
      };

      Footer.prototype._isGreaterThanMinimalPrice = function() {
        var currentTotalCost;
        this.minimalPrice = Helpers.moneyWithoutCurrency(this.vendor.get('minimal_price'));
        currentTotalCost = Helpers.moneyWithoutCurrency(this.cart.get('total_cost'));
        return currentTotalCost > this.minimalPrice;
      };

      Footer.prototype.emptyButtonClicked = function() {
        return alert(this.vendor.get('footer_empty_button'));
      };

      Footer.prototype.onRender = function() {
        this.stickit();
        this.workspaceDOM = this.$('#kormapp-workspace').children().clone();
        if (!this.cart.isEmpty()) {
          return this.showCheckoutButton();
        }
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
        this.cart = options.cart, this.app = options.app, this.user = options.user, this.vendor = options.vendor, this.vent = options.vent;
        this.footerView = new FooterView({
          app: this.app,
          cart: this.cart,
          user: this.user,
          vent: this.vent,
          vendor: this.vendor
        });
        this.showFooter();
        return this.footerView.on('checkout:clicked', function() {
          return _this.vent.trigger('checkout:clicked');
        });
      };

      FooterController.prototype.showFooter = function() {
        return this.app.mainLayout.footerRegion.show(this.footerView);
      };

      return FooterController;

    })(Marionette.Controller);
  });

}).call(this);

(function() {
  define('settings',[],function() {
    return {
      api_urls: {
        bundles: 'http://api.aydamarket.ru/v1/bundles.json',
        orders: 'http://api.aydamarket.ru/v1/orders.json'
      }
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/order',['settings'], function(Settings) {
    var Order, _ref;
    return Order = (function(_super) {
      __extends(Order, _super);

      function Order() {
        _ref = Order.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Order.prototype.url = Settings.api_urls.orders;

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
        this.app = options.app, this.cart = options.cart, this.user = options.user;
        return this.app.commands.setHandler('order:create', function() {
          return _this.createOrder();
        });
      };

      OrderController.prototype.createOrder = function() {
        var order, orderOptions,
          _this = this;
        orderOptions = this.cart.toJSON();
        orderOptions.user = this.user.toJSON();
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

      Cart.prototype.initialize = function(attrs, options) {
        this.items = new CartItems({}, options);
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
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/update_manager',['settings', 'helpers/application_helpers'], function(Settings, Helpers) {
    var ProductsUpdaterController, _ref;
    return ProductsUpdaterController = (function(_super) {
      __extends(ProductsUpdaterController, _super);

      function ProductsUpdaterController() {
        this._update = __bind(this._update, this);
        _ref = ProductsUpdaterController.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ProductsUpdaterController.prototype.initialize = function(_arg) {
        this.vent = _arg.vent, this.cart = _arg.cart, this.vendor = _arg.vendor, this.categories = _arg.categories, this.products = _arg.products;
      };

      ProductsUpdaterController.prototype.perform = function() {
        return $.ajax({
          url: Settings.api_urls.bundles,
          headers: this._headers(),
          success: this._update,
          error: function(e) {
            return console.log('Ошибка получения списка продуктов с сервера', e);
          }
        });
      };

      ProductsUpdaterController.prototype._update = function(data) {
        var new_total_cost, saved_total_cost;
        console.log('От сервера получены данные для обновления', data);
        this.products.reset(data.products);
        this.categories.reset(data.categories);
        this.vendor.set(data.vendor);
        saved_total_cost = this.cart.items.getTotalCost();
        this.cart.items.each(function(ci) {
          return ci.initialize();
        });
        new_total_cost = this.cart.items.getTotalCost();
        if (saved_total_cost.cents !== new_total_cost.cents) {
          return alert("Продавец изменил цены товаров.\nНовая стоимость корзины: " + (Helpers.money_txt(new_total_cost)));
        }
      };

      ProductsUpdaterController.prototype._headers = function() {
        return {
          'X-Vendor-Key': this.vendor.get('key')
        };
      };

      return ProductsUpdaterController;

    })(Marionette.Controller);
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
        return this.modalRegion.show(view);
      };

      ModalController.prototype.hide = function() {
        return this.modalRegion.close();
      };

      return ModalController;

    })();
  });

}).call(this);

(function() {
  define('templates/main_layout',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<div id='kormapp-header-region'></div>\n<div class='kormapp-content' id='kormapp-main-region'></div>\n<div class='kormapp-footer' id='kormapp-footer-region'></div>\n<div id='kormapp-check-region'></div>\n<div id='kormapp-modal-region'></div>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/main_layout',['templates/main_layout', 'helpers/application_helpers'], function(template, Helpers) {
    var MainLayout, _ref;
    return MainLayout = (function(_super) {
      __extends(MainLayout, _super);

      function MainLayout() {
        _ref = MainLayout.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      MainLayout.prototype.el = '#kormapp-container';

      MainLayout.prototype.template = template;

      MainLayout.prototype.regions = {
        headerRegion: "#kormapp-header-region",
        mainRegion: "#kormapp-main-region",
        footerRegion: "#kormapp-footer-region",
        checkRegion: "#kormapp-check-region",
        modalRegion: "#kormapp-modal-region"
      };

      return MainLayout;

    })(Marionette.Layout);
  });

}).call(this);

(function() {
  define('app',['models/user', 'models/vendor', 'controllers/cart', 'collections/cart_items', 'controllers/check', 'collections/products', 'views/header/header', 'views/products/products', 'views/modal_windows/vendor_page', 'controllers/footer', 'controllers/order', 'models/cart', 'controllers/update_manager', 'controllers/modal', 'views/main_layout'], function(User, Vendor, CartController, CartItems, CheckController, ProductsCollection, HeaderView, ProductsView, VendorPageView, FooterController, OrderController, Cart, UpdateManager, ModalController, MainLayout) {
    var App;
    App = new Marionette.Application;
    App.version = '0.1.8';
    App.addInitializer(function(options) {
      var headerView, productsListView, sorted_products;
      App.vendor = new Vendor(options.vendor);
      App.categories = new Backbone.Collection(options.categories);
      App.products = new ProductsCollection(options.products);
      App.user = new User;
      App.user.fetch();
      App.cart = new Cart({}, {
        app: this
      });
      App.cart.fetch();
      App.updateManager = new UpdateManager({
        vent: App.vent,
        cart: App.cart,
        vendor: App.vendor,
        categories: App.categories,
        products: App.products
      });
      App.mainLayout = new MainLayout();
      App.mainLayout.render();
      App.modal = new ModalController({
        modalRegion: App.mainLayout.modalRegion
      });
      new CartController({
        vent: App.vent,
        cart: App.cart,
        modal: App.modal
      });
      new CheckController({
        app: App,
        user: App.user,
        cart: App.cart
      });
      new OrderController({
        app: App,
        cart: App.cart,
        user: App.user
      });
      sorted_products = new Backbone.VirtualCollection(App.products, {
        comparator: 'position'
      });
      productsListView = new ProductsView({
        app: App,
        collection: sorted_products
      });
      App.mainLayout.mainRegion.show(productsListView);
      headerView = new HeaderView({
        app: App,
        cart: App.cart,
        vendor: App.vendor
      });
      headerView.on('logo:clicked', function() {
        return App.modal.show(new VendorPageView({
          app: App,
          model: App.vendor
        }));
      });
      App.mainLayout.headerRegion.show(headerView);
      return new FooterController({
        app: App,
        cart: App.cart,
        user: App.user,
        vent: App.vent,
        vendor: App.vendor
      });
    });
    App.on('start', function() {
      return console.log("Start KormApp " + App.version);
    });
    return App;
  });

}).call(this);

