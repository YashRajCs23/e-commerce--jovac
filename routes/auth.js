const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads/users directory exists
const uploadDir = path.join(__dirname, "../uploads/users");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Show register form
router.get("/register", async (req, res) => {
  try {
    res.render("authentication/register");
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

// Register new user
router.post("/register", upload.single("image"), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const userObj = new User({
      username: req.body.username,
      email: req.body.email,
      role: req.body.role || "Customer",
      password: hashedPassword,
    });

    // Save image if uploaded
    if (req.file) {
      const filePath = path.join(uploadDir, req.file.filename);
      userObj.image = {
        data: fs.readFileSync(filePath),
        contentType: req.file.mimetype,
      };
      fs.unlinkSync(filePath); // Optional: remove file from disk
    }

    await userObj.save();

    req.flash("login", "User Registered Successfully, Login to Continue");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("register", "Error: " + err.message);
    res.redirect("/register");
  }
});

// Show login form
router.get("/login", async (req, res) => {
  try {
    if (req.session.user) {
      req.flash("error", "You are already logged in");
      return res.redirect("/");
    }
    res.render("authentication/login");
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

// Handle login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    req.session.user = user;
    req.flash("login", `Welcome back "${user.username}"`);
    const redirect = req.session.previousUrl || "/";
    res.redirect(redirect);
  } catch (e) {
    console.error(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  try {
    const redirect = req.session?.previousUrl || "/";
    req.session.destroy(() => {
      req.flash("login", "User Logged Out");
      res.redirect(redirect);
    });
  } catch (e) {
    console.error(e);
    res.status(404).render("error/error", { status: "404" });
  }
});

module.exports = router;
