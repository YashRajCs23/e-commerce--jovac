const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/product");
const Reviews = require("../models/reviews");
const Users = require("../models/user");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");
const multer = require("multer");
const previousUrl = require("../middlewares/previousUrl");
const path = require("path");
const fs = require("fs");
const currentUrl = require("../middlewares/currentUrl");
const { v4: uuid } = require("uuid");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/uploads/product"));
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});
const upload = multer({ storage });

// Show all products
router.get("/", currentUrl, async (req, res) => {
  try {
    const data = await Product.find({});
    res.render("products/index", { data });
  } catch (err) {
    console.log(err);
    res.status(404).render("error/error", { status: "404" });
  }
});

// New product form
router.get("/products/new", isLoggedIn, isAdmin, (req, res) => {
  res.render("products/new");
});

// Create product
router.post("/products/new", isLoggedIn, isAdmin, upload.single("image"), async (req, res) => {
  try {
    let data = req.body;

    if (data.price <= 100000) {
      try {
        const file = path.join(__dirname, "/uploads/product/" + req.file.filename);
        data.image = { data: fs.readFileSync(file), contentType: "image/png" };
      } catch {
        data.image = null;
      }

      await Product.create(data);
      req.flash("status", "Item Added Successfully!");
      res.redirect("/admin/products");
    } else {
      req.flash("error", "You cannot set price more than 100000");
      res.redirect("/products/new");
    }
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

// Show product
router.get("/products/:id", currentUrl, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Product.findById(id).populate("reviews");
    res.render("products/item", { data });
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

// Edit form
router.get("/products/:id/edit", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Product.findById(id);
    res.render("products/edit", { data });
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

// Update product
router.patch("/products/:id", isLoggedIn, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.price <= 100000) {
      if (req.file) {
        const file = path.join(__dirname, "/uploads/product/" + req.file.filename);
        data.image = { data: fs.readFileSync(file), contentType: "image/png" };
      }

      await Product.findByIdAndUpdate(id, data);
      req.flash("status", "Item details updated successfully");
      res.redirect("/admin/products");
    } else {
      req.flash("error", "You cannot set price more than 100000");
      res.redirect(`/products/${id}/edit`);
    }
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

// Delete product
router.delete("/products/:id/delete", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleting = await Product.findById(id);
    await Product.findByIdAndDelete(id);
    req.flash("status", `The item "${deleting.name}" was deleted successfully`);
    res.redirect("/admin/products");
  } catch (e) {
    res.status(404).render("error/error", { status: "404" });
  }
});

// Add review
router.post("/products/:id/reviews", isLoggedIn, async (req, res) => {
  try {
    const data = req.body;
    data.user = req.user.username;
    data.date = Date.now();

    const productObj = await Product.findById(req.params.id);
    const reviewObj = new Reviews(data);

    productObj.reviews.push(reviewObj);
    await productObj.save();
    await reviewObj.save();

    req.flash("success", "Your review was added successfully!");
    res.redirect(`/products/${req.params.id}`);
  } catch (e) {
    res.status(404).render("error/error", { status: "404" });
  }
});

// Middleware to authorize review actions
const reviewChange = async (req, res, next) => {
  const userReview = await Reviews.findById(req.params.rev_id);
  if (userReview.user === req.user.username) next();
  else {
    req.session.previousUrl = req.headers.referer;
    req.flash("login", "You are not authorized for this operation");
    res.redirect(req.session.previousUrl);
  }
};

// Edit review
router.get("/products/:id/reviews/:rev_id", isLoggedIn, reviewChange, async (req, res) => {
  try {
    const { id, rev_id } = req.params;
    const data = await Reviews.findById(rev_id);
    res.render("reviews/edit", { data, id, rev_id });
  } catch (e) {
    req.flash("error", "Sorry, we encountered a problem");
    res.redirect(`/products/${req.params.id}`);
  }
});

// Update review
router.patch("/products/:id/reviews/:rev_id", isLoggedIn, async (req, res) => {
  try {
    const { id, rev_id } = req.params;
    const data = req.body;
    data.date = Date.now();

    await Reviews.findByIdAndUpdate(rev_id, data);
    req.flash("success", "Your review was updated successfully");
    res.redirect(`/products/${id}`);
  } catch (e) {
    req.flash("error", "There was a problem updating your comment");
    res.redirect(`/products/${req.params.id}`);
  }
});

// Delete review
router.delete("/products/:id/reviews/:rev_id", isLoggedIn, async (req, res) => {
  try {
    const { id, rev_id } = req.params;
    await Reviews.findByIdAndDelete(rev_id);
    req.flash("success", "Your review was deleted successfully");
    res.redirect(`/products/${id}`);
  } catch (e) {
    req.flash("error", "There was a problem deleting your comment");
    res.redirect(`/products/${req.params.id}`);
  }
});

module.exports = router;
