define ['marionette', 'templates/products/product',
  'templates/cart_item_button/add', 'templates/cart_item_button/added',
  'helpers/application_helpers'],
  (Marionette, productTemplate, cartItemButtonAdd, cartItemButtonAdded, Helpers) ->

  class CartItemButtonView extends Marionette.ItemView
