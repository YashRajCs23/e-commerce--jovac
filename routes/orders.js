const express = require("express");
const router = express.Router();
const Orders = require("../models/order");
const Users = require("../models/user");
const isLoggedIn = require("../middlewares/isLoggedIn");
require("dotenv").config();

// ✅ Place Order (COD)
router.post("/user/order", isLoggedIn, async (req, res) => {
  try {
    const userObj = await Users.findById(req.session.user._id).populate("cart.item");

    if (!userObj || userObj.cart.length === 0) {
      req.flash("error", "Your cart is empty.");
      return res.redirect("/cart");
    }

    const totalPrice = userObj.cart.reduce(
      (sum, c) => sum + (c.item?.price || 0) * c.quantity,
      0
    );

    const orderData = {
      user: userObj._id,
      orderid: "COD_" + Date.now(),
      paymentid: "COD_PAYMENT",
      orderList: userObj.cart,
      purchaseDate: Date.now(),
      finalPrice: totalPrice,
    };

    const order = new Orders(orderData);
    await order.save();

    userObj.orders.push(order);
    userObj.cart = [];
    await userObj.save();

    req.flash("success", "Order placed successfully with Cash on Delivery.");
    res.redirect("/orders");
  } catch (e) {
    console.error(e);
    res.status(500).render("error/error", {
      status: "500",
      message: "Order placement failed",
    });
  }
});

// ✅ View Orders
router.get("/orders", isLoggedIn, async (req, res) => {
  try {
    const user = await Users.findById(req.session.user._id).populate({
      path: "orders",
      populate: {
        path: "orderList.item",
        model: "products",
      },
    });

    res.render("user/orders", { orders: user.orders });
  } catch (e) {
    console.error(e);
    res.status(500).render("error/error", {
      status: "500",
      message: "Could not load orders",
    });
  }
});

module.exports = router;
