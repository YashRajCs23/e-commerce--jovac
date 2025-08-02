const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();
require("dotenv").config();

// Import routes
const prodRoutes = require("./routes/product");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");

// Connect to MongoDB
mongoose.connect(process.env.MDB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Database connected"))
.catch((err) => {
  console.error("❌ Database connection error:", err);
});

// Session & flash
app.use(session({
  name: "ecomv1_id",
  secret: "thisistopsecretstuffdude", // you should move this to .env
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

// Middleware
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Flash locals for all templates
app.use((req, res, next) => {
  res.locals.status = req.flash("status");
  res.locals.register = req.flash("register");
  res.locals.login = req.flash("login");
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.loginUser = req.session.user || null;
  next();
});

// Use routes
app.use(prodRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(orderRoutes);
app.use(adminRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).render("error/error", { status: "404" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
