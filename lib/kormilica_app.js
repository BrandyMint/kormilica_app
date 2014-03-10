(function () {(function() {
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
        return this.on('change:name change:phone', function() {
          return this.save();
        });
      };

      Profile.prototype.defaults = {
        id: 1,
        name: '',
        phone: ''
      };

      Profile.prototype.isAllFieldsFilled = function() {
        if (this.get('name') && this.get('phone')) {
          return true;
        }
      };

      return Profile;

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
        this.set({
          product_title: this.product.get('title'),
          product_price: this.product.get('price')
        });
        this.on('change:quantity', this.updateTotalCost);
        return this.updateTotalCost();
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
        $o.push("<div id='check-top-external'>\n  <div class='center' id='check-top-internal'>\n    <div class='check-top-battlement'>\n      <div class='check-top-battlement-center'></div>\n    </div>\n    <div class='check-content'>\n      <div class='scrollable-check'>\n        <div class='check-header'>\n          <a href='#'>\n            <img src='images/back-button.png'>\n          </a>\n          <h2>Ваш чек</h2>\n        </div>\n        <div class='cart-items'></div>\n      </div>\n      <div class='unscrollable-check'>\n        <div class='clearfix row'>\n          <p class='all-product-sum'>Итог:\n            <span class='all-sum-right'>" + ($c(this.money(this.total_cost))) + "</span>\n          </p>\n        </div>\n        <form name='message\", method=>\"post'>\n          <section>\n            <label for='phone'>Телефон:</label>\n            <input id='phone' type='tel' value='" + ($e($c(this.profile.get('phone') ? this.profile.get('phone') : void 0))) + "' name='phone' placeholder='+7(999)999-99-99'>\n            <label for='name'>Ваше имя:</label>\n            <input id='name' type='text' value='" + ($e($c(this.profile.get('name') ? this.profile.get('name') : void 0))) + "' name='name'>\n          </section>\n        </form>\n        <p class='form-comment'>\n          обязательно введите свой телефон для связи\n        </p>\n      </div>\n    </div>\n  </div>\n</div>");
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
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/check/check',['templates/check/check', 'views/check/check_cart_item', 'helpers/application_helpers'], function(template, CheckCartItemView, Helpers) {
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

      Check.prototype.itemView = CheckCartItemView;

      Check.prototype.itemViewContainer = '.cart-items';

      Check.prototype.initialize = function(options) {
        this.cart = options.cart, this.profile = options.profile;
        this.collection = this.cart.items;
        return this.model = this.profile;
      };

      Check.prototype.bindings = {
        '#name': {
          observe: 'name'
        },
        '#phone': {
          observe: 'phone'
        }
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
        return _.extend(this.cart.toJSON(), {
          items: this.cart.items.toJSON(),
          profile: this.profile
        });
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
        this.app.vent.on('checkout:clicked', function() {
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
        $o.push("<div class='clearfix row'>\n  <div class='column two-thirds'>\n    <img src='" + ($e($c(this.image_url))) + "'>\n    <p>" + ($e($c(this.title))) + "</p>\n    <p class='price'>" + ($c(this.money(this.price))) + "</p>\n  </div>\n  <div class='column one-thirds product-quantity'></div>\n</div>");
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
  define('templates/header/header',[],function() {
    return function(context) {
      var render;
      render = function() {
        var $o;
        $o = [];
        $o.push("<div class='clearfix row'>\n  <div class='column half' id='logo'>\n    <img src='images/logo.png'>\n    <p>Доставка <br> пончиков</p>\n  </div>\n  <div class='column half' id='check'>\n    <img src='images/header-check.png'>\n    <p>ваш заказ на \n      <br>\n      <span id='amount'></span>\n    </p>\n  </div>\n</div>");
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

  define('views/header/header',['templates/header/header', 'helpers/application_helpers'], function(template, Helpers) {
    var HeaderView, _ref;
    return HeaderView = (function(_super) {
      __extends(HeaderView, _super);

      function HeaderView() {
        this.bounce = __bind(this.bounce, this);
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

      HeaderView.prototype.initialize = function(options) {
        this.app = options.app, this.cart = options.cart;
        this.model = this.cart;
        return this.cart.on('add', this.bounce);
      };

      HeaderView.prototype.update = function() {
        if (this.model.isEmpty()) {
          this.hideCheck();
        } else {
          this.showCheck();
        }
        return this.changeCost();
      };

      HeaderView.prototype.showCheck = function() {
        return this.$('#check').html(this.checkDOM);
      };

      HeaderView.prototype.hideCheck = function() {
        return this.$('#check').children().remove();
      };

      HeaderView.prototype.bounce = function() {
        return this.$('#check img').effect('bounce', {
          times: 2
        }, 150);
      };

      HeaderView.prototype.changeCost = function() {
        return this.$('#amount').html(Helpers.money(this.model.get('total_cost')));
      };

      HeaderView.prototype.onRender = function() {
        this.checkDOM = this.$('#check').children().clone();
        return this.update();
      };

      return HeaderView;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/header',['views/header/header'], function(HeaderView) {
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
        this.app.vent.on('check:appeared', function() {
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
        this.collection = this.cart.items;
        this.app.vent.on('check:appeared', function() {
          _this.showDeliveryButton();
          return _this.showCheckBottom();
        });
        this.app.vent.on('check:form:invalid', function() {
          return _this.deactivateDeliveryButton();
        });
        this.app.vent.on('check:form:valid', function() {
          return _this.activateDeliveryButton();
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
        this.trigger('delivery:clicked');
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
        this.footerView.on('checkout:clicked', function() {
          return _this.vent.trigger('checkout:clicked');
        });
        return this.footerView.on('delivery:clicked', function() {
          return _this.app.execute('order:create');
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
        orderOptions = {
          "user": {
            "phone": this.profile.get('phone'),
            "name": this.profile.get('name')
          },
          "items": this._getFormattedCartItems(),
          "total_price": this.cart.get('total_cost')
        };
        order = new Order(orderOptions);
        return order.save(null, {
          success: function(model, response) {
            alert("Ваш заказ №" + response.id);
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
  define('data/vendor_predefined',[],function() {
    return {
      "key": "467abe2e7d33e6455fe905e879fd36be",
      "name": "Тестовый вендор",
      "mobile_description": "Только у нас, \u003Cb\u003Eжирные пончики\u003C/b\u003E. В течении часа.",
      "mobile_subject": "Супер пончики",
      "phone": "79033891228",
      "city": "Чебоксары",
      "minimal_price": {
        "cents": 0,
        "currency": "RUB"
      },
      "delivery_price": {
        "cents": 0,
        "currency": "RUB"
      },
      "currency": "RUB",
      "categories": [
        {
          "id": 1,
          "name": "Пончики"
        }
      ],
      "products": [
        {
          "id": 7,
          "category_id": 1,
          "title": "Пончик с начинкой яблоко-корица",
          "price": {
            "cents": 10000,
            "currency": "RUB"
          },
          "image_url": "http://aydamarket.ru/uploads/product/image/7/kak_prigotovit_ponchiki_s_glazuryu.jpg"
        }, {
          "id": 6,
          "category_id": 1,
          "title": "Пончик с банановой начинкой",
          "price": {
            "cents": 11000,
            "currency": "RUB"
          },
          "image_url": "http://aydamarket.ru/uploads/product/image/6/kak_prigotovit_ponchiki_s_glazuryu.jpg"
        }, {
          "id": 5,
          "category_id": 1,
          "title": " Пончик с начинкой лесные ягоды",
          "price": {
            "cents": 12000,
            "currency": "RUB"
          },
          "image_url": "http://aydamarket.ru/uploads/product/image/5/kak_prigotovit_ponchiki_s_glazuryu.jpg"
        }, {
          "id": 4,
          "category_id": 1,
          "title": "Пончик с начинкой двойной шоколад",
          "price": {
            "cents": 13000,
            "currency": "RUB"
          },
          "image_url": "http://aydamarket.ru/uploads/product/image/4/kak_prigotovit_ponchiki_s_glazuryu.jpg"
        }, {
          "id": 3,
          "category_id": 1,
          "title": "Пончик с творожной начинкой",
          "price": {
            "cents": 14000,
            "currency": "RUB"
          },
          "image_url": "http://aydamarket.ru/uploads/product/image/3/kak_prigotovit_ponchiki_s_glazuryu.jpg"
        }, {
          "id": 2,
          "category_id": 1,
          "title": "Пончик со сливочной начинкой",
          "price": {
            "cents": 15000,
            "currency": "RUB"
          },
          "image_url": "http://aydamarket.ru/uploads/product/image/2/kak_prigotovit_ponchiki_s_glazuryu.jpg"
        }, {
          "id": 1,
          "category_id": 1,
          "title": "Пончик с начинкой ваниль",
          "price": {
            "cents": 16000,
            "currency": "RUB"
          },
          "image_url": "http://aydamarket.ru/uploads/product/image/1/kak_prigotovit_ponchiki_s_glazuryu.jpg"
        }
      ]
    };
  });

}).call(this);

(function() {
  define('app',['models/profile', 'controllers/cart', 'collections/cart_items', 'controllers/check', 'collections/products', 'views/products/products', 'controllers/header', 'controllers/footer', 'controllers/order', 'models/cart', 'controllers/modal', 'data/vendor_predefined'], function(Profile, CartController, CartItems, CheckController, ProductsCollection, ProductsView, HeaderController, FooterController, OrderController, Cart, ModalController, VendorPredefined) {
    var App;
    App = new Marionette.Application;
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
      var productsListView;
      App.vendor = new Backbone.Model(options.vendor);
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
      new HeaderController({
        app: App,
        cart: App.cart
      });
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

(function() {
  'use strict';
  require.config({
    shim: {
      underscore: {
        exports: '_'
      }
    },
    paths: {
      jquery: '../bower_components/jquery/jquery',
      underscore: '../bower_components/underscore/underscore',
      'form-serialize': 'lib/form-serialize'
    }
  });

  require(['app']);

}).call(this);

define("main", function(){});

}());