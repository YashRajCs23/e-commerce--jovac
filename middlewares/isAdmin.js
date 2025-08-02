const isAdmin = (req, res, next) => {
  if (req.session.user?.role !== "Admin") {
    req.flash("error", "You need to be an Admin to continue..");
    return res.redirect(req.session.previousUrl || "/");
  }
  next();
};

module.exports = isAdmin;
