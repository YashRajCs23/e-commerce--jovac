const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'You need to login to continue');
    return res.redirect("/login");
  }
  next();
};

module.exports = isLoggedIn;
