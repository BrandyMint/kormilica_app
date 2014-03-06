(function () {(function() {
  define('data/products',[],function() {
    return [
      {
        id: 1,
        title: 'Оригинальная глазурь',
        price: '140',
        image_url: 'images/donut_3.png'
      }, {
        id: 2,
        title: 'Классический пончик',
        price: '60',
        image_url: 'images/donut_1.png'
      }, {
        id: 6,
        title: 'Шоколадная глазурь',
        price: '90',
        image_url: 'images/donut_2.png'
      }, {
        id: 5,
        title: 'Классический пончик',
        price: '30',
        image_url: 'images/donut_1.png'
      }, {
        id: 4,
        title: 'Оригинальная глазурь',
        price: '160',
        image_url: 'images/donut_3.png'
      }, {
        id: 3,
        title: 'Шоколадная глазурь',
        price: '10',
        image_url: 'images/donut_2.png'
      }
    ];
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/cart',['app', 'marionette'], function(App, Marionette) {
    var Controller, _ref;
    return Controller = (function(_super) {
      __extends(Controller, _super);

      function Controller() {
        _ref = Controller.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Controller.prototype.initialize = function(options) {
        var collection,
          _this = this;
        collection = options.collection;
        this.cart = collection;
        App.cart = this.cart;
        App.reqres.setHandler('cart:item', function(product) {
          return _this._isProductAlreadyInCart(product);
        });
        App.vent.on('cart:add', function(product, quantity) {
          return _this.addToCart(product, quantity);
        });
        App.vent.on('quantity:change', function(item, quantity) {
          if (quantity > 0) {
            return _this.changeQuantity(item, quantity);
          } else {
            return _this.deleteItem(item);
          }
        });
        App.vent.on('cart:clean', function() {
          return _this.cleanCart();
        });
        return App.vent.on('order:created', function() {
          return _this.cleanCart();
        });
      };

      Controller.prototype.addToCart = function(product, quantity) {
        var item, newItem;
        item = this._isProductAlreadyInCart(product);
        if (!item) {
          newItem = this.cart.create({
            product: product,
            quantity: quantity
          });
          return App.vent.trigger('cartitem:added', newItem);
        } else {
          return App.vent.trigger('cartitem:exists', item);
        }
      };

      Controller.prototype.deleteItem = function(item) {
        this.cart.get(item.id).destroy();
        return App.vent.trigger('cart:item:deleted');
      };

      Controller.prototype.changeQuantity = function(item, quantity) {
        item.set('quantity', quantity);
        return item.save();
      };

      Controller.prototype.cleanCart = function() {
        var model, _results;
        _results = [];
        while (model = this.cart.first()) {
          _results.push(model.destroy());
        }
        return _results;
      };

      Controller.prototype._isProductAlreadyInCart = function(product) {
        return this.cart.find(function(item) {
          return item.get('product').id === product.get('id');
        });
      };

      return Controller;

    })(Marionette.Controller);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/profile',['app', 'controllers/cart', 'backbone.localStorage'], function(App) {
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

  define('models/cart_item',['app'], function() {
    'use strict';
    var CartItem, _ref;
    return CartItem = (function(_super) {
      __extends(CartItem, _super);

      function CartItem() {
        _ref = CartItem.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CartItem.prototype.defaults = {
        product: '',
        quantity: 0
      };

      CartItem.prototype.price = function() {
        return this.get('product').price * this.get('quantity');
      };

      return CartItem;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('collections/cart',['models/cart_item', 'backbone.localStorage'], function(Model) {
    var CartItems, _ref;
    return CartItems = (function(_super) {
      __extends(CartItems, _super);

      function CartItems() {
        _ref = CartItems.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CartItems.prototype.url = 'cart';

      CartItems.prototype.model = Model;

      CartItems.prototype.initialize = function() {
        return this.localStorage = new Backbone.LocalStorage('cart');
      };

      CartItems.prototype.getTotalCost = function() {
        var addup;
        addup = function(memo, item) {
          return item.price() + memo;
        };
        return this.reduce(addup, 0);
      };

      CartItems.prototype.getTotalCount = function() {
        var addup;
        addup = function(memo, item) {
          return item.get('quantity') + memo;
        };
        return this.reduce(addup, 0);
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
        $o.push("<div class='modal-wrapper'>\n  <div class='dark-background'></div>\n  <div class='modal-window'>\n    <div class='column full'>\n      <div class='quantity-title'>Введите количество</div>\n      <table class='quantity-table'>\n        <tr>\n          <td>\n            <p class='price'>\n              <span class='price-font'>" + this.product.price + "</span>\n              р.\n            </p>\n          </td>\n          <td>\n            <p class='multiplier'>x\n              <span class='multiplier-font quantity'>" + ($e($c(this.quantity))) + "</span>\n              \=\n            </p>\n          </td>\n          <td>\n            <p class='price'>\n              <span class='price-font result'>" + (this.product.price * this.quantity) + "</span>\n              р.\n            </p>\n          </td>\n        </tr>\n      </table>\n      <div class='quantity-selector'>\n        <a id='plus-sign' href='#'>+</a>\n        <span class='quantity'>" + this.quantity + "</span>\n        шт\n        <a id='minus-sign' href='#'>-</a>\n      </div>\n      <a class='button' href='#'>\n        <span>ГОТОВО</span>\n      </a>\n    </div>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/modal_windows/quantity_selector',['app', 'marionette', 'templates/modal_windows/quantity_selector'], function(App, Marionette, template) {
    var QuantitySelector, _ref;
    return QuantitySelector = (function(_super) {
      __extends(QuantitySelector, _super);

      function QuantitySelector() {
        _ref = QuantitySelector.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      QuantitySelector.prototype.template = template;

      QuantitySelector.prototype.initialize = function() {
        this.quantity = this.model.get('quantity');
        return this.price = this.model.get('product').price;
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

  define('controllers/quantity_selector',['app', 'marionette', 'views/modal_windows/quantity_selector'], function(App, Marionette, QuantitySelectorView) {
    var Controller, _ref;
    return Controller = (function(_super) {
      __extends(Controller, _super);

      function Controller() {
        _ref = Controller.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Controller.prototype.initialize = function(options) {
        var _this = this;
        this.cart = options.cart;
        return App.vent.on('cartitem:exists', function(item) {
          return _this.showQuantitySelector(item);
        });
      };

      Controller.prototype.showQuantitySelector = function(item) {
        var quantitySelectorView,
          _this = this;
        $('#app-container').addClass('modal-state');
        quantitySelectorView = new QuantitySelectorView({
          model: item
        });
        App.modalRegion.show(quantitySelectorView);
        quantitySelectorView.on('quantity:change', function(quantity) {
          App.vent.trigger('quantity:change', item, quantity);
          return _this.hideQuantitySelector();
        });
        return quantitySelectorView.on('quantity:change:cancel', function() {
          return _this.hideQuantitySelector();
        });
      };

      Controller.prototype.hideQuantitySelector = function() {
        $('#app-container').removeClass('modal-state');
        return App.modalRegion.close();
      };

      return Controller;

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
        $o.push("<div id='check-top-external'>\n  <div class='center' id='check-top-internal'>\n    <div class='check-top-battlement'>\n      <div class='check-top-battlement-center'></div>\n    </div>\n    <div class='check-content'>\n      <div class='scrollable-check'>\n        <h2>Ваш чек</h2>");
        pos = 1;
        _ref = this.items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          $o.push("        <p>" + ($e($c("" + (pos++) + ". " + item.product.title))) + "</p>\n        <table>\n          <tbody>\n            <tr>\n              <td class='product-amount'>" + ($e($c("" + item.product.price + "x" + item.quantity))) + "</td>\n              <td class='separator'>\n                <div></div>\n              </td>\n              <td class='product-price'>" + ($e($c("" + (item.product.price * item.quantity) + " р."))) + "</td>\n            </tr>\n          </tbody>\n        </table>");
        }
        $o.push("      </div>\n      <div class='unscrollable-check'>\n        <div class='clearfix row'>\n          <p class='all-product-sum'>Итог:\n            <span class='all-sum-right'>" + ($e($c("" + this.totalCost + " р."))) + "</span>\n          </p>\n        </div>\n        <form name='message\", method=>\"post'>\n          <section>\n            <label for='phone'>Телефон:</label>\n            <input id='phone' type='tel' value='" + ($e($c(this.profile.get('phoneNumber') ? this.profile.get('phoneNumber') : void 0))) + "' name='phone' placeholder='+7'>\n            <label for='name'>Ваше имя:</label>\n            <input id='name' type='text' value='" + ($e($c(this.profile.get('name') ? this.profile.get('name') : void 0))) + "' name='name'>\n          </section>\n        </form>\n        <p class='form-comment'>\n          обязательно введите свой телефон для связи\n        </p>\n      </div>\n    </div>\n  </div>\n</div>");
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
    var CheckTop, _ref;
    return CheckTop = (function(_super) {
      __extends(CheckTop, _super);

      function CheckTop() {
        this.checkForEmptyFields = __bind(this.checkForEmptyFields, this);
        _ref = CheckTop.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CheckTop.prototype.template = template;

      CheckTop.prototype.ui = {
        form: 'form'
      };

      CheckTop.prototype.events = {
        'keyup form': 'checkForEmptyFields'
      };

      CheckTop.prototype.serializeData = function() {
        return {
          items: this.collection.toJSON(),
          profile: this.options.profile
        };
      };

      CheckTop.prototype.templateHelpers = function() {
        return {
          totalCost: this.collection.getTotalCost()
        };
      };

      CheckTop.prototype.checkForEmptyFields = function(e) {
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

      CheckTop.prototype._setScrollableAreaHeight = function() {
        var bottomInfo, container, itemsList, scrollableHeight;
        container = $('.check-content');
        bottomInfo = $('.unscrollable-check');
        itemsList = $('.scrollable-check');
        scrollableHeight = container.height() - bottomInfo.height();
        return itemsList.css('height', scrollableHeight);
      };

      CheckTop.prototype.onShow = function() {
        return this._setScrollableAreaHeight();
      };

      return CheckTop;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/check',['app', 'marionette', 'views/check/check', 'jquery.form-serialize'], function(App, Marionette, CheckView) {
    var Controller, _ref;
    return Controller = (function(_super) {
      __extends(Controller, _super);

      function Controller() {
        _ref = Controller.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Controller.prototype.initialize = function(options) {
        var _this = this;
        this.profile = options.profile, this.cart = options.cart;
        App.vent.on('checkout:show', function() {
          return _this.showCheck();
        });
        return App.vent.on('order:created', function() {
          var $form_data;
          $form_data = _this.checkView.$el.find('form').serializeObject();
          _this.profile.save({
            name: $form_data.name,
            phoneNumber: $form_data.phone
          });
          return _this.hideCheck();
        });
      };

      Controller.prototype.showCheck = function() {
        this.checkView = new CheckView({
          profile: this.profile,
          collection: this.cart
        });
        App.checkRegion.show(this.checkView);
        this.checkView.on('check:form:empty:field', function() {
          return App.vent.trigger('check:form:invalid');
        });
        return this.checkView.on('check:form:filled', function() {
          return App.vent.trigger('check:form:valid');
        });
      };

      Controller.prototype.hideCheck = function() {
        return App.checkRegion.close();
      };

      return Controller;

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
  define('templates/products/list_item',['jquery', 'underscore'], function($, _) {
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
        $o.push("<div class='clearfix row'>\n  <div class='column two-thirds'>\n    <img src='" + ($e($c(this.image_url))) + "'>\n    <p>" + ($e($c(this.title))) + "</p>\n    <p class='price'>\n      <span class='price-font'>" + ($e($c(this.price))) + "</span>\n      р.\n    </p>\n  </div>\n  <div class='column one-thirds product-quantity'>\n    <a class='button' href='#777'>\n      <img src='images/to-bucket.png'>\n        <span>В ЗАКАЗ</span>\n    </a>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  define('templates/products/list_item_quantity',['jquery', 'underscore'], function($, _) {
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

  define('views/products/list_item',['app', 'marionette', 'templates/products/list_item', 'templates/products/list_item_quantity'], function(App, Marionette, listItemTemplate, listItemQuantityTemplate) {
    var Product, _ref;
    return Product = (function(_super) {
      __extends(Product, _super);

      function Product() {
        this.displaySelectedQuantity = __bind(this.displaySelectedQuantity, this);
        _ref = Product.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Product.prototype.template = listItemTemplate;

      Product.prototype.className = 'product-block';

      Product.prototype.initialize = function() {
        var _this = this;
        this.item = App.request('cart:item', this.model);
        if (this.item) {
          this.quantity = this.item.get('quantity');
        }
        App.vent.on('cartitem:added', function(item) {
          if (item.get('product').id === _this.model.get('id')) {
            return _this.displaySelectedQuantity(item.get('quantity'));
          }
        });
        App.vent.on('quantity:change', function(item, quantity) {
          if (item.get('product').id === _this.model.get('id')) {
            return _this.displaySelectedQuantity(quantity);
          }
        });
        return App.vent.on('order:created', function() {
          return _this.displaySelectedQuantity(0);
        });
      };

      Product.prototype.events = {
        'click': 'addToCart'
      };

      Product.prototype.addToCart = function(e) {
        e.preventDefault();
        return App.vent.trigger('cart:add', this.model, 1);
      };

      Product.prototype.displaySelectedQuantity = function(quantity) {
        if (quantity > 0) {
          return this.$('.product-quantity').html(listItemQuantityTemplate({
            quantity: quantity
          }));
        } else {
          return this.$('.product-quantity').html(this.productQuantityDOM);
        }
      };

      Product.prototype.onRender = function() {
        this.productQuantityDOM = this.$('.product-quantity').children().clone();
        if (this.item) {
          return this.displaySelectedQuantity(this.quantity);
        }
      };

      return Product;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/products/list',['app', 'marionette', 'views/products/list_item'], function(App, Marionette, ItemView) {
    var Products, _ref;
    return Products = (function(_super) {
      __extends(Products, _super);

      function Products() {
        _ref = Products.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Products.prototype.itemView = ItemView;

      return Products;

    })(Marionette.CollectionView);
  });

}).call(this);

(function() {
  define('templates/header/header',['jquery', 'underscore'], function($, _) {
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
        $o.push("<div class='clearfix row'>\n  <div class='column half' id='logo'>\n    <img src='images/logo.png'>\n    <p>Доставка <br> пончиков</p>\n  </div>\n  <div class='column half' id='check'>\n    <img src='images/header-check.png'>\n    <p>ваш заказ на \n      <br>\n      <span id='amount'>" + ($e($c(this.totalCost + " руб."))) + "</span>\n    </p>\n  </div>\n</div>");
        return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
      };
      return render.call(context);
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/header/header',['app', 'marionette', 'templates/header/header', 'jquery.bounce'], function(App, Marionette, template) {
    var Header, _ref;
    return Header = (function(_super) {
      __extends(Header, _super);

      function Header() {
        _ref = Header.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Header.prototype.template = template;

      Header.prototype.className = 'header';

      Header.prototype.initialize = function() {
        var _this = this;
        return App.vent.on('cartitem:added', function() {
          return _this.bounceCheck(2, '5px', 100);
        });
      };

      Header.prototype.triggers = {
        'click #check': 'check:clicked'
      };

      Header.prototype.serializeData = function() {
        return {
          items: this.collection.toJSON()
        };
      };

      Header.prototype.templateHelpers = function() {
        return {
          totalCost: this.collection.getTotalCost()
        };
      };

      Header.prototype.collectionEvents = {
        'all': 'updateTotalCost'
      };

      Header.prototype.updateTotalCost = function() {
        if (this.collection.getTotalCost() > 0) {
          this.showCheck();
        } else {
          this.hideCheck();
        }
        return this.$('#amount').html(this.collection.getTotalCost() + " руб.");
      };

      Header.prototype.showCheck = function() {
        return this.$('#check').html(this.checkDOM);
      };

      Header.prototype.hideCheck = function() {
        return this.$('#check').children().remove();
      };

      Header.prototype.bounceCheck = function(times, distance, speed) {
        return this.$('#check img').bounce(times, distance, speed);
      };

      Header.prototype.onRender = function() {
        this.checkDOM = this.$('#check').children().clone();
        if (!(this.collection.getTotalCost() > 0)) {
          return this.hideCheck();
        }
      };

      return Header;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('controllers/header',['app', 'marionette', 'views/header/header'], function(App, Marionette, HeaderView) {
    var Controller, _ref;
    return Controller = (function(_super) {
      __extends(Controller, _super);

      function Controller() {
        _ref = Controller.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Controller.prototype.initialize = function(options) {
        var _this = this;
        this.collection = options.collection;
        this.headerView = this.getHeaderView(this.collection);
        App.headerRegion.show(this.headerView);
        this.headerView.on('check:clicked', function() {
          return App.vent.trigger('checkout:show');
        });
        App.vent.on('checkout:show', function() {
          return _this.hideHeader();
        });
        return App.vent.on('order:created', function() {
          return _this.showHeader();
        });
      };

      Controller.prototype.hideHeader = function() {
        $('#app-container').addClass('checkout-state');
        App.headerRegion.close();
        return delete this.headerView;
      };

      Controller.prototype.showHeader = function() {
        $('#app-container').removeClass('checkout-state');
        this.headerView = this.getHeaderView(this.collection);
        return App.headerRegion.show(this.headerView);
      };

      Controller.prototype.getHeaderView = function(collection) {
        return new HeaderView({
          collection: collection
        });
      };

      return Controller;

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

  define('views/footer/footer',['app', 'marionette', 'templates/footer/footer', 'templates/footer/_checkout', 'templates/footer/_delivery', 'templates/footer/_check_bottom'], function(App, Marionette, template, checkoutButtonTemplate, deliveryButtonTemplate, checkBottomTemplate) {
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
        this.profile = options.profile;
        App.vent.on('checkout:show', function() {
          _this.showDeliveryButton();
          return _this.showCheckBottom();
        });
        App.vent.on('check:form:invalid', function() {
          return _this.deactivateDeliveryButton();
        });
        return App.vent.on('check:form:valid', function() {
          return _this.activateDeliveryButton();
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
        if (this.collection.getTotalCost() === 0) {
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
        if (this.collection.length > 0) {
          return this.showCheckoutButton();
        }
      };

      return Footer;

    })(Marionette.ItemView);
  });

}).call(this);

(function() {
  define('app',['marionette', 'data/products'], function(Marionette, productsData) {
    window.App = new Marionette.Application;
    App.addRegions({
      headerRegion: "#header-region",
      mainRegion: "#main-region",
      footerRegion: "#footer-region",
      checkRegion: "#check-region",
      modalRegion: "#modal-region"
    });
    App.addInitializer(function() {
      var _this = this;
      require(['models/profile'], function(ProfileModel) {
        App.profile = new ProfileModel;
        return App.profile.fetch();
      });
      require(['controllers/cart', 'collections/cart'], function(CartController, CartCollection) {
        var cartCollection;
        cartCollection = new CartCollection;
        cartCollection.fetch();
        return new CartController({
          collection: cartCollection
        });
      });
      require(['controllers/quantity_selector'], function(QuantitySelectorController) {
        return new QuantitySelectorController;
      });
      require(['controllers/check'], function(CheckController) {
        return new CheckController({
          profile: App.profile,
          cart: App.cart
        });
      });
      require(['collections/products', 'views/products/list'], function(ProductsCollection, ProductsView) {
        var productsListCollection, productsListView;
        productsListCollection = new ProductsCollection(productsData);
        productsListView = new ProductsView({
          collection: productsListCollection
        });
        return App.mainRegion.show(productsListView);
      });
      require(['controllers/header'], function(HeaderController) {
        return new HeaderController({
          collection: App.cart
        });
      });
      return require(['views/footer/footer'], function(FooterView) {
        var footerView;
        footerView = new FooterView({
          collection: App.cart,
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