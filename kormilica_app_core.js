(function () {(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/profile',['backbone.localStorage'], function() {
    'use strict';
    var Profile, _ref;
    return Profile = (function(_super) {
      __extends(Profile, _super);

      function Profile() {
        _ref = Profile.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Profile.prototype.initialize = function() {
        return this.localStorage = new Backbone.LocalStorage('profiles');
      };

      Profile.prototype.defaults = {
        id: 1,
        name: '',
        phoneNumber: ''
      };

      Profile.prototype.isAllFieldsFilled = function() {
        if (this.get('name') && this.get('phoneNumber')) {
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

  define('controllers/cart',['marionette'], function(Marionette) {
    var CartController, _ref;
    return CartController = (function(_super) {
      __extends(CartController, _super);

      function CartController() {
        _ref = CartController.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CartController.prototype.initialize = function(options) {
        var _this = this;
        this.app = options.app, this.cartItems = options.cartItems;
        this.app.reqres.setHandler('cart:item', function(product) {
          return _this.cartItems.isProductInCart(product);
        });
        this.app.vent.on('cart:add', function(product, quantity) {
          return _this.addToCart(product, quantity);
        });
        this.app.vent.on('quantity:change', function(item, quantity) {
          if (quantity > 0) {
            return _this.changeQuantity(item, quantity);
          } else {
            return _this.deleteItem(item);
          }
        });
        this.app.vent.on('cart:clean', function() {
          return _this.cleanCart();
        });
        return this.app.vent.on('order:created', function() {
          return _this.cleanCart();
        });
      };

      CartController.prototype.addToCart = function(product, quantity) {
        var item, newItem;
        item = this.cartItems.isProductInCart(product);
        if (!item) {
          newItem = this.cartItems.create({
            product: product,
            quantity: quantity
          });
          return this.app.vent.trigger('cartitem:added', newItem);
        } else {
          return this.app.vent.trigger('cartitem:exists', item);
        }
      };

      CartController.prototype.deleteItem = function(item) {
        this.cartItem.get(item.id).destroy();
        return this.app.vent.trigger('cart:item:deleted');
      };

      CartController.prototype.changeQuantity = function(item, quantity) {
        item.set('quantity', quantity);
        return item.save();
      };

      CartController.prototype.cleanCart = function() {
        var model, _results;
        _results = [];
        while (model = this.cartItem.first()) {
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

  define('models/cart_item',['backbone'], function(Backbone) {
    'use strict';
    var CartItem, _ref;
    return CartItem = (function(_super) {
      __extends(CartItem, _super);

      function CartItem() {
        _ref = CartItem.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CartItem.prototype.defaults = {
        quantity: 0
      };

      CartItem.prototype.initialize = function() {
        return this.set('product', window.App.products.get(this.get('product').id));
      };

      CartItem.prototype.price = function() {
        return {
          cents: this.get('product').get('price').cents * this.get('quantity'),
          curency: this.get('product').get('price').currency
        };
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
        return this.localStorage = new Backbone.LocalStorage('cart');
      };

      CartItems.prototype.getTotalCost = function() {
        var addup;
        addup = function(memo, item) {
          return item.price().cents + memo;
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
        return this.find(function(item) {
          return item.get('product').id === product.get('id');
        });
      };

      return CartItems;

    })(Backbone.Collection);
  });

}).call(this);

(function() {
  define('templates/modal_windows/quantity_selector',['jquery', 'underscore'], function($, _) {
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
        $o.push("<div class='modal-wrapper'>\n  <div class='dark-background'></div>\n  <div class='modal-window'>\n    <div class='column full'>\n      <div class='quantity-title'>Введите количество</div>\n      <table class='quantity-table'>\n        <tr>\n          <td>\n            <p class='price'>\n              <span class='price-font'>" + ($c(this.money(this.product.price))) + "</span>\n              р.\n            </p>\n          </td>\n          <td>\n            <p class='multiplier'>x\n              <span class='multiplier-font quantity'>" + ($e($c(this.quantity))) + "</span>\n              \=\n            </p>\n          </td>\n          <td>\n            <p class='price'>\n              <div class='result'>" + ($c(this.money(this.total_cost))) + "</div>\n            </p>\n          </td>\n        </tr>\n      </table>\n      <div class='quantity-selector'>\n        <a id='plus-sign' href='#'>+</a>\n        <span class='quantity'>" + this.quantity + "</span>\n        шт\n        <a id='minus-sign' href='#'>-</a>\n      </div>\n      <a class='button' href='#'>\n        <span>ГОТОВО</span>\n      </a>\n    </div>\n  </div>\n</div>");
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
      }
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/modal_windows/quantity_selector',['marionette', 'templates/modal_windows/quantity_selector', 'helpers/application_helpers'], function(Marionette, template, Helpers) {
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

      QuantitySelector.prototype.initialize = function() {
        this.quantity = this.model.get('quantity');
        this.price = this.model.get('product').price;
        return this.total_cost = this.price * this.quantity;
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
        'click @ui.outside': 'quantity:change:cancel'
      };

      QuantitySelector.prototype.events = {
        'click @ui.minusButton': 'decreaseQuantity',
        'click @ui.plusButton': 'increaseQuantity',
        'click @ui.confirmButton': 'confirmChanges'
      };

      QuantitySelector.prototype.decreaseQuantity = function(e) {
        e.preventDefault();
        if (!(this.quantity < 1)) {
          this.quantity--;
          return this._updateView();
        }
      };

      QuantitySelector.prototype.increaseQuantity = function(e) {
        e.preventDefault();
        this.quantity++;
        return this._updateView();
      };

      QuantitySelector.prototype.confirmChanges = function(e) {
        e.preventDefault();
        return this.trigger('quantity:change', this.quantity);
      };

      QuantitySelector.prototype._updateView = function() {
        $(this.ui.quantity).html(this.quantity);
        return $(this.ui.result).html(this.quantity * this.price);
      };

      return QuantitySelector;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/quantity_selector',['marionette', 'views/modal_windows/quantity_selector'], function(Marionette, QuantitySelectorView) {
    var QuantitySelectorController, _ref;
    return QuantitySelectorController = (function(_super) {
      __extends(QuantitySelectorController, _super);

      function QuantitySelectorController() {
        _ref = QuantitySelectorController.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      QuantitySelectorController.prototype.initialize = function(options) {
        return this.cart = options.cart, this.app = options.app, options;
      };

      QuantitySelectorController.prototype.showQuantitySelector = function(item) {
        var quantitySelectorView,
          _this = this;
        $('#app-container').addClass('modal-state');
        quantitySelectorView = new QuantitySelectorView({
          model: item
        });
        this.app.modalRegion.show(quantitySelectorView);
        quantitySelectorView.on('quantity:change', function(quantity) {
          _this.app.vent.trigger('quantity:change', item, quantity);
          return _this.hideQuantitySelector();
        });
        return quantitySelectorView.on('quantity:change:cancel', function() {
          return _this.hideQuantitySelector();
        });
      };

      QuantitySelectorController.prototype.hideQuantitySelector = function() {
        $('#app-container').removeClass('modal-state');
        return this.app.modalRegion.close();
      };

      return QuantitySelectorController;

    })(Marionette.Controller);
  });

}).call(this);

(function() {
  define('templates/check/check',['jquery', 'underscore'], function($, _) {
    return function(context) {
      var render;
      render = function() {
        var $c, $e, $o, item, pos, _i, _len, _ref;
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
        $o.push("<div id='check-top-external'>\n  <div class='center' id='check-top-internal'>\n    <div class='check-top-battlement'>\n      <div class='check-top-battlement-center'></div>\n    </div>\n    <div class='check-content'>\n      <div class='scrollable-check'>\n        <div class='check-header'>\n          <a href='#'>\n            <img src='images/back-button.png'>\n          </a>\n          <h2>Ваш чек</h2>\n        </div>");
        pos = 1;
        _ref = this.items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          $o.push("        <p>" + ($e($c("" + (pos++) + ". " + item.product.title))) + "</p>\n        <table>\n          <tbody>\n            <tr>\n              <td class='product-amount'>");
          $o.push("                " + $c(this.money(item.product.price)));
          $o.push("                x");
          $o.push("                " + $e($c(item.quantity)));
          $o.push("              </td>\n              <td class='separator'>\n                <div></div>\n              </td>\n              <td class='product-price'>" + ($e($c("" + (item.product.price * item.quantity) + " р."))) + "</td>\n            </tr>\n          </tbody>\n        </table>");
        }
        $o.push("      </div>\n      <div class='unscrollable-check'>\n        <div class='clearfix row'>\n          <p class='all-product-sum'>Итог:\n            <span class='all-sum-right'>" + ($c(this.money(this.total_cost))) + "</span>\n          </p>\n        </div>\n        <form name='message\", method=>\"post'>\n          <section>\n            <label for='phone'>Телефон:</label>\n            <input id='phone' type='tel' value='" + ($e($c(this.profile.get('phoneNumber') ? this.profile.get('phoneNumber') : void 0))) + "' name='phone' placeholder='+7'>\n            <label for='name'>Ваше имя:</label>\n            <input id='name' type='text' value='" + ($e($c(this.profile.get('name') ? this.profile.get('name') : void 0))) + "' name='name'>\n          </section>\n        </form>\n        <p class='form-comment'>\n          обязательно введите свой телефон для связи\n        </p>\n      </div>\n    </div>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/check/check',['marionette', 'templates/check/check', 'jquery.form-serialize'], function(Marionette, template) {
    var Check, _ref;
    return Check = (function(_super) {
      __extends(Check, _super);

      function Check() {
        this.checkForEmptyFields = __bind(this.checkForEmptyFields, this);
        _ref = Check.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Check.prototype.template = template;

      Check.prototype.templateHelpers = function() {
        return Helpers;
      };

      Check.prototype.ui = {
        form: 'form',
        backButton: '.check-header a'
      };

      Check.prototype.events = {
        'keyup form': 'checkForEmptyFields'
      };

      Check.prototype.triggers = {
        'click @ui.backButton': {
          event: 'cancel:button:clicked',
          preventDefault: true
        }
      };

      Check.prototype.serializeData = function() {
        return {
          items: this.collection.toJSON(),
          profile: this.options.profile,
          total_cost: this.collection.getTotalCost()
        };
      };

      Check.prototype.checkForEmptyFields = function(e) {
        var errors, formData, inputData;
        formData = this.ui.form.serializeObject();
        errors = [];
        for (inputData in formData) {
          if (!formData[inputData]) {
            errors.push(inputData);
          }
        }
        if (errors.length > 0) {
          return this.trigger('check:form:empty:field');
        } else {
          return this.trigger('check:form:filled');
        }
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

      return Check;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/check',['marionette', 'views/check/check', 'jquery.form-serialize'], function(Marionette, CheckView) {
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
        this.app.vent.on('checkout:show', function() {
          return _this.showCheck();
        });
        return this.app.vent.on('order:created', function() {
          var $form_data;
          $form_data = _this.checkView.$el.find('form').serializeObject();
          _this.profile.save({
            name: $form_data.name,
            phoneNumber: $form_data.phone
          });
          _this.app.vent.trigger('check:disappeared');
          return _this.hideCheck();
        });
      };

      CheckController.prototype.showCheck = function() {
        var _this = this;
        this.checkView = new CheckView({
          profile: this.profile,
          collection: this.cart
        });
        this.app.checkRegion.show(this.checkView);
        this.checkView.on('check:form:empty:field', function() {
          return this.app.vent.trigger('check:form:invalid');
        });
        this.checkView.on('check:form:filled', function() {
          return this.app.vent.trigger('check:form:valid');
        });
        return this.checkView.on('cancel:button:clicked', function() {
          _this.app.vent.trigger('check:disappeared');
          return _this.hideCheck();
        });
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

      Product.prototype.defaults = {
        title: 'Пончик'
      };

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
  define('templates/products/product',['jquery', 'underscore'], function($, _) {
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
        $o.push("<div class='clearfix row'>\n  <div class='column two-thirds'>\n    <img src='" + ($e($c(this.image_url))) + "'>\n    <p>" + ($e($c(this.title))) + "</p>\n    <p class='price'>" + ($c(this.money(this.price))) + "</p>\n  </div>\n  <div class='column one-thirds product-quantity'>\n    <a class='button' href='#777'>\n      <img src='images/to-bucket.png'>\n        <span>В ЗАКАЗ</span>\n    </a>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  define('templates/products/product_quantity',['jquery', 'underscore'], function($, _) {
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

  define('views/products/product',['marionette', 'templates/products/product', 'templates/products/product_quantity', 'helpers/application_helpers'], function(Marionette, productTemplate, productQuantityTemplate, Helpers) {
    var ProductView, _ref;
    return ProductView = (function(_super) {
      __extends(ProductView, _super);

      function ProductView() {
        this.displaySelectedQuantity = __bind(this.displaySelectedQuantity, this);
        _ref = ProductView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ProductView.prototype.templateHelpers = function() {
        return Helpers;
      };

      ProductView.prototype.template = productTemplate;

      ProductView.prototype.className = 'product-block';

      ProductView.prototype.initialize = function(options) {
        var _this = this;
        this.app = options.app;
        this.item = this.app.request('cart:item', this.model);
        if (this.item) {
          this.quantity = this.item.get('quantity');
        }
        this.app.vent.on('cartitem:added', function(item) {
          if (item.get('product').id === _this.model.get('id')) {
            return _this.displaySelectedQuantity(item.get('quantity'));
          }
        });
        this.app.vent.on('quantity:change', function(item, quantity) {
          if (item.get('product').id === _this.model.get('id')) {
            return _this.displaySelectedQuantity(quantity);
          }
        });
        return this.app.vent.on('order:created', function() {
          return _this.displaySelectedQuantity(0);
        });
      };

      ProductView.prototype.events = {
        'click': 'addToCart'
      };

      ProductView.prototype.addToCart = function(e) {
        e.preventDefault();
        return this.app.vent.trigger('cart:add', this.model, 1);
      };

      ProductView.prototype.displaySelectedQuantity = function(quantity) {
        if (quantity > 0) {
          return this.$('.product-quantity').html(productQuantityTemplate({
            quantity: quantity
          }));
        } else {
          return this.$('.product-quantity').html(this.productQuantityDOM);
        }
      };

      ProductView.prototype.onRender = function() {
        this.productQuantityDOM = this.$('.product-quantity').children().clone();
        if (this.item) {
          return this.displaySelectedQuantity(this.quantity);
        }
      };

      return ProductView;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/products/products',['app', 'marionette', 'views/products/product'], function(App, Marionette, ProductView) {
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
          app: this.app
        };
      };

      return ProductsView;

    })(Marionette.CollectionView);
  });

}).call(this);

(function() {
  define('templates/header/header',['jquery', 'underscore'], function($, _) {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<div class='clearfix row'>\n  <div class='column half' id='logo'>\n    <img src='images/logo.png'>\n    <p>Доставка <br> пончиков</p>\n  </div>\n  <div class='column half' id='check'>\n    <img src='images/header-check.png'>\n    <p>ваш заказ на \n      <br>\n      <span id='header_amount'></span>\n    </p>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/header/header',['marionette', 'templates/header/header', 'jquery.bounce', 'helpers/application_helpers'], function(Marionette, template, jQueryBounce, Helpers) {
    var HeaderView, _ref;
    return HeaderView = (function(_super) {
      __extends(HeaderView, _super);

      function HeaderView() {
        _ref = HeaderView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      HeaderView.prototype.template = template;

      HeaderView.prototype.className = 'header';

      HeaderView.prototype.templateHelpers = function() {
        return Helpers;
      };

      HeaderView.prototype.triggers = {
        'click #check': 'check:clicked'
      };

      HeaderView.prototype.modelEvents = {
        'change': 'update'
      };

      HeaderView.prototype.binding = {
        '#header_amount': {
          observe: ['total_cost_cents', 'total_cost'],
          onGet: function(cents, cost) {
            return Helpers.money(cost);
          }
        }
      };

      HeaderView.prototype.initialize = function(options) {
        var _this = this;
        this.app = options.app, this.cart = options.cart;
        this.model = this.cart;
        return this.app.vent.on('cartitem:added', function() {
          return _this.bounceCheck(2, '5px', 100);
        });
      };

      HeaderView.prototype.update = function() {
        if (this.model.get('total_cost').cents > 0) {
          return this.showCheck();
        } else {
          return this.hideCheck();
        }
      };

      HeaderView.prototype.showCheck = function() {
        return this.$('#check').html(this.checkDOM);
      };

      HeaderView.prototype.hideCheck = function() {
        return this.$('#check').children().remove();
      };

      HeaderView.prototype.bounceCheck = function(times, distance, speed) {
        return this.$('#check img').bounce(times, distance, speed);
      };

      HeaderView.prototype.onRender = function() {
        this.stickit();
        return this.checkDOM = this.$('#check').children().clone();
      };

      return HeaderView;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/header',['marionette', 'views/header/header'], function(Marionette, HeaderView) {
    var HeaderController, _ref;
    return HeaderController = (function(_super) {
      __extends(HeaderController, _super);

      function HeaderController() {
        _ref = HeaderController.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      HeaderController.prototype.initialize = function(options) {
        var _this = this;
        this.cart = options.cart, this.app = options.app;
        this.headerView = new HeaderView({
          app: this.app,
          cart: this.cart
        });
        this.showHeader();
        this.headerView.on('check:clicked', function() {
          return this.app.vent.trigger('checkout:show');
        });
        this.app.vent.on('checkout:show', function() {
          return _this.hideHeader();
        });
        return this.app.vent.on('check:disappeared', function() {
          return _this.showHeader();
        });
      };

      HeaderController.prototype.hideHeader = function() {
        $('#app-container').addClass('checkout-state');
        return this.app.headerRegion.close();
      };

      HeaderController.prototype.showHeader = function() {
        $('#app-container').removeClass('checkout-state');
        return this.app.headerRegion.show(this.headerView);
      };

      return HeaderController;

    })(Marionette.Controller);
  });

}).call(this);

(function() {
  define('templates/footer/footer',['jquery', 'underscore'], function($, _) {
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
  define('templates/footer/_checkout',['jquery', 'underscore'], function($, _) {
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
  define('templates/footer/_delivery',['jquery', 'underscore'], function($, _) {
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
  define('templates/footer/_check_bottom',['jquery', 'underscore'], function($, _) {
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

  define('views/footer/footer',['marionette', 'templates/footer/footer', 'templates/footer/_checkout', 'templates/footer/_delivery', 'templates/footer/_check_bottom'], function(Marionette, template, checkoutButtonTemplate, deliveryButtonTemplate, checkBottomTemplate) {
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
        this.profile = options.profile, this.app = options.app, this.cartItems = options.cartItems;
        this.collection = this.cartItems;
        this.app.vent.on('checkout:show', function() {
          _this.showDeliveryButton();
          return _this.showCheckBottom();
        });
        this.app.vent.on('check:form:invalid', function() {
          return _this.deactivateDeliveryButton();
        });
        this.app.vent.on('check:form:valid', function() {
          return _this.activateDeliveryButton();
        });
        return this.app.vent.on('check:disappeared', function() {
          return _this.showCheckoutButton();
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
        if (this.cartItems.getTotalCost() === 0) {
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
        alert('Заказ создан!');
        this.trigger('delivery:clicked');
        return this.hideButton();
      };

      Footer.prototype.showErrors = function(e) {
        e.preventDefault();
        return alert('Заполните все поля');
      };

      Footer.prototype.onRender = function() {
        this.workspaceDOM = this.$('#workspace').children().clone();
        if (this.cartItems.length > 0) {
          return this.showCheckoutButton();
        }
      };

      return Footer;

    })(Marionette.ItemView);
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

      Cart.prototype.initialize = function() {
        this.items = new CartItems();
        this.listenTo(this.items, 'change', this.updateAggregators);
        this.listenTo(this.items, 'add', this.updateAggregators);
        this.listenTo(this.items, 'remove', this.updateAggregators);
        return this.updateAggregators();
      };

      Cart.prototype.fetch = function() {
        return this.items.fetch();
      };

      Cart.prototype.updateAggregators = function() {
        this.set('total_cost', this.items.getTotalCost());
        this.set('total_count', this.items.getTotalCount());
        return this.set('total_cost_cents', this.get('total_cost').cents);
      };

      Cart.prototype.isEmpty = function() {
        return this.get('total_count') === 0;
      };

      return Cart;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  define('app',['marionette', 'backbone', 'backbone.stickit', 'models/profile', 'controllers/cart', 'collections/cart_items', 'controllers/quantity_selector', 'controllers/check', 'collections/products', 'views/products/products', 'controllers/header', 'views/footer/footer', 'models/cart'], function(Marionette, Backbone, Stickit, Profile, CartController, CartItems, QuantitySelectorController, CheckController, ProductsCollection, ProductsView, HeaderController, FooterView, Cart) {
    debugger;
    window.App = new Marionette.Application;
    App.addRegions({
      headerRegion: "#header-region",
      mainRegion: "#main-region",
      footerRegion: "#footer-region",
      checkRegion: "#check-region",
      modalRegion: "#modal-region"
    });
    App.addInitializer(function(options) {
      var footerView, productsListView;
      App.products = new ProductsCollection;
      App.profile = new Profile();
      App.profile.fetch();
      App.categories = new Backbone.Collection;
      App.cart = new Cart();
      $.get(options.data_file, function(data) {
        console.log('Load', options.data_file);
        App.profile.set(data);
        App.products.reset(data.products);
        App.categories.reset(data.categories);
        return App.cart.fetch();
      });
      new CartController({
        app: App,
        cartItems: App.cart.items
      });
      new QuantitySelectorController({
        app: App
      });
      new CheckController({
        app: App,
        profile: App.profile,
        cartItems: App.cart.items
      });
      productsListView = new ProductsView({
        app: App,
        collection: App.products
      });
      App.mainRegion.show(productsListView);
      new HeaderController({
        app: App,
        cart: App.cart
      });
      footerView = new FooterView({
        app: App,
        cartItems: App.cart.items,
        profile: App.profile
      });
      App.footerRegion.show(footerView);
      footerView.on('checkout:clicked', function() {
        return App.vent.trigger('checkout:show');
      });
      return footerView.on('delivery:clicked', function() {
        return App.vent.trigger('order:created');
      });
    });
    App.on('start', function() {
      return console.log('App starting....');
    });
    App.on('initialize:after', function() {
      return Backbone.history.start();
    });
    return App;
  });

}).call(this);

}());