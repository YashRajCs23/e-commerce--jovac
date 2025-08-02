const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/product");
const Users = require("../models/user");
const isLoggedIn = require("../middlewares/isLoggedIn");
const previousUrl = require("../middlewares/previousUrl");
const currentUrl = require("../middlewares/currentUrl");

// ✅ View Cart
router.get("/user/cart", currentUrl, isLoggedIn, async (req, res) => {
  try {
    const user = await Users.findById(req.user._id).populate("cart.item");

    // Remove null items from cart (e.g., deleted products)
    user.cart = user.cart.filter((entry) => entry.item !== null);
    await user.save();

    res.render("user/cart", { data: user.cart });
  } catch (e) {
    console.error(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

// ✅ Add to Cart
router.post("/user/cart/:prodId", previousUrl, isLoggedIn, async (req, res) => {
  try {
    const { prodId } = req.params;
    const product = await Product.findById(prodId);
    const user = await Users.findById(req.user._id);
    const quantityToAdd = Number(req.body.quantity) || 1;

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products");
    }

    let cartItem = user.cart.find((entry) => entry.item.equals(prodId));

    if (cartItem) {
      cartItem.quantity += quantityToAdd;
      if (cartItem.quantity > 5) {
        req.flash("error", "You cannot add more than 5 of the same item.");
        cartItem.quantity = 5; // limit
      }
    } else {
      user.cart.push({ item: product._id, quantity: quantityToAdd });
    }

    await user.save();
    res.redirect("/user/cart");
  } catch (e) {
    console.error(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

// ✅ Remove from Cart
router.delete("/user/cart/:userId/:prodId", previousUrl, isLoggedIn, async (req, res) => {
  try {
    const { userId, prodId } = req.params;
    const user = await Users.findById(userId);

    const index = user.cart.findIndex((entry) => entry.item.equals(prodId));
    if (index !== -1) user.cart.splice(index, 1);

    await user.save();
    req.flash("success", "Item deleted from your cart");
    res.redirect("/user/cart");
  } catch (e) {
    console.error(e);
    req.flash("error", "There was a problem deleting the item from your cart");
    res.status(404).render("error/error", { status: "404" });
  }
});

// ✅ View Orders
router.get("/user/orders", currentUrl, isLoggedIn, async (req, res) => {
  try {
    const user = await Users.findById(req.user._id)
      .populate({
        path: "orders",
        populate: {
          path: "orderList.item",
          model: Product,
        },
      });

    res.render("user/orders", { orders: user.orders });
  } catch (e) {
    console.error(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

module.exports = router;
